// create-admin.js
// شغّل هذا الملف مرة واحدة فقط لإنشاء حساب المدير الأول
// طريقة التشغيل: node create-admin.js

const bcrypt = require('bcryptjs');
const pool = require('./db');

const USERNAME = 'admin';       // يمكنك تغييره
const PASSWORD = 'Dorareet@2026'; // غيّره لكلمة مرور قوية خاصة بك

async function createAdmin() {
  try {
    const passwordHash = await bcrypt.hash(PASSWORD, 10);

    await pool.query(
      'INSERT INTO admins (username, password_hash) VALUES (?, ?)',
      [USERNAME, passwordHash]
    );

    console.log('✅ تم إنشاء حساب المدير بنجاح!');
    console.log(`   اسم المستخدم: ${USERNAME}`);
    console.log(`   كلمة المرور:   ${PASSWORD}`);
    console.log('   (احتفظ بها في مكان آمن، ولن تظهر بهذا الشكل مرة أخرى)');
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('⚠️ يوجد حساب مدير بهذا الاسم بالفعل.');
    } else {
      console.error('❌ خطأ:', error.message);
    }
  } finally {
    process.exit();
  }
}

createAdmin();