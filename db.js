// db.js
// إعداد الاتصال بقاعدة بيانات عيادة دوراريت عبر WampServer

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',           // فارغة لأن WampServer يستخدم root بدون كلمة مرور افتراضياً
  database: 'dorareet_clinic',
  charset: 'utf8_general_ci', // يضمن قراءة/كتابة الأحرف العربية بشكل صحيح (نسختكم MySQL 5.1 لا تدعم utf8mb4)
  waitForConnections: true,
  connectionLimit: 10
});

module.exports = pool;