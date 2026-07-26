// setup-cloud-db.js
// شغّل هذا الملف مرة واحدة فقط لإنشاء الجداول في قاعدة البيانات السحابية
// طريقة التشغيل: node setup-cloud-db.js

const pool = require('./db');

const statements = [
  `CREATE TABLE IF NOT EXISTS doctors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    specialty VARCHAR(100) NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    doctor_id INT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id),
    UNIQUE KEY unique_booking (doctor_id, appointment_date, appointment_time)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
];

const doctorSeeds = `
  INSERT IGNORE INTO doctors (slug, name, specialty) VALUES
  ('layan-alamin', 'د. ليان الأمين', 'طب الأسرة'),
  ('omar-eltajani', 'د. عمر التجاني', 'طب الأطفال'),
  ('sara-mahjoub', 'د. سارة محجوب', 'الأمراض الجلدية'),
  ('khalid-yassin', 'د. خالد ياسين', 'جراحة العظام')
`;

async function setup() {
  try {
    for (const sql of statements) {
      await pool.query(sql);
      console.log('✅ تم إنشاء جدول بنجاح');
    }

    await pool.query(doctorSeeds);
    console.log('✅ تم إدخال بيانات الأطباء بنجاح');

    console.log('🎉 قاعدة البيانات السحابية جاهزة بالكامل!');
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    process.exit();
  }
}

setup();