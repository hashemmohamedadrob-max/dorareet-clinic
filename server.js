// server.js
// سيرفر عيادة دوراريت — متصل بقاعدة البيانات + نظام دخول الإدارة

const express = require('express');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const pool = require('./db');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// إعداد الجلسات (Sessions) لتذكّر أن المدير سجّل دخوله
app.use(session({
  secret: 'dorareet-clinic-secret-key', // في مرحلة الرفع سنجعله متغيراً سرياً أقوى
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 4 } // الجلسة تنتهي بعد 4 ساعات
}));

// Middleware: يتحقق أن المدير مسجّل دخوله قبل السماح له بالوصول لمسارات الإدارة
function requireAdminAuth(req, res, next) {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  return res.status(401).json({ success: false, message: 'يجب تسجيل الدخول أولاً.' });
}

// ============ مسارات الحجز (نفس السابق) ============
app.post('/api/book', async (req, res) => {
  const { patientName, phone, doctor, date, time, notes } = req.body;

  if (!patientName || !phone || !doctor || !date || !time) {
    return res.status(400).json({
      success: false,
      message: 'من فضلك أكمل جميع الحقول المطلوبة.'
    });
  }

  try {
    const [doctorRows] = await pool.query(
      'SELECT id FROM doctors WHERE slug = ?',
      [doctor]
    );

    if (doctorRows.length === 0) {
      return res.status(400).json({ success: false, message: 'الطبيب المختار غير موجود.' });
    }

    const doctorId = doctorRows[0].id;

    await pool.query(
      `INSERT INTO appointments (patient_name, phone, doctor_id, appointment_date, appointment_time, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [patientName, phone, doctorId, date, time, notes || null]
    );

    console.log(`✅ تم حفظ حجز جديد: ${patientName} - ${date} ${time}`);
    res.json({ success: true, message: 'تم تأكيد حجزك بنجاح! سنتواصل معك قبل الموعد.' });

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('⚠️ محاولة حجز مكرر (تعارض مواعيد):', { doctor, date, time });
      return res.status(409).json({
        success: false,
        message: 'عذراً، هذا الموعد محجوز بالفعل لهذا الطبيب. الرجاء اختيار وقت آخر.'
      });
    }
    console.error('❌ خطأ في قاعدة البيانات:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ في السيرفر. حاول مرة أخرى لاحقاً.' });
  }
});

// ============ مسارات تسجيل دخول الإدارة ============

// تسجيل الدخول
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'أدخل اسم المستخدم وكلمة المرور.' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT * FROM admins WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'بيانات الدخول غير صحيحة.' });
    }

    const admin = rows[0];
    const passwordMatches = await bcrypt.compare(password, admin.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({ success: false, message: 'بيانات الدخول غير صحيحة.' });
    }

    req.session.isAdmin = true;
    req.session.username = admin.username;

    res.json({ success: true, message: 'تم تسجيل الدخول بنجاح.' });

  } catch (error) {
    console.error('❌ خطأ أثناء تسجيل الدخول:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ في السيرفر.' });
  }
});

// تسجيل الخروج
app.post('/api/admin/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true, message: 'تم تسجيل الخروج.' });
  });
});

// التحقق من حالة الجلسة (هل المدير مسجّل دخوله حالياً؟)
app.get('/api/admin/session', (req, res) => {
  res.json({ isAdmin: !!(req.session && req.session.isAdmin) });
});

// ============ مسارات لوحة تحكم الإدارة (محمية بتسجيل الدخول) ============

// جلب كل الحجوزات مع اسم الطبيب وتخصصه، مرتبة من الأقرب للأبعد
app.get('/api/admin/appointments', requireAdminAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        appointments.id,
        appointments.patient_name,
        appointments.phone,
        appointments.appointment_date,
        appointments.appointment_time,
        appointments.notes,
        appointments.created_at,
        doctors.name AS doctor_name,
        doctors.specialty AS doctor_specialty
      FROM appointments
      JOIN doctors ON appointments.doctor_id = doctors.id
      ORDER BY appointments.appointment_date ASC, appointments.appointment_time ASC
    `);

    res.json({ success: true, appointments: rows });
  } catch (error) {
    console.error('❌ خطأ في جلب الحجوزات:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ في جلب الحجوزات.' });
  }
});

// حذف/إلغاء حجز معيّن حسب رقمه
app.delete('/api/admin/appointments/:id', requireAdminAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM appointments WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'تم إلغاء الحجز بنجاح.' });
  } catch (error) {
    console.error('❌ خطأ في حذف الحجز:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء الإلغاء.' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ السيرفر يعمل الآن على: http://localhost:${PORT}`);
});