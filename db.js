// db.js
// إعداد الاتصال بقاعدة بيانات عيادة دوراريت (Aiven MySQL السحابية)

require('dotenv').config();
const mysql = require('mysql2/promise');

// --- سطر تشخيصي مؤقت: سنحذفه بعد حل المشكلة ---
console.log('🔍 DEBUG DB_HOST =', JSON.stringify(process.env.DB_HOST));
console.log('🔍 DEBUG DB_PORT =', JSON.stringify(process.env.DB_PORT));
console.log('🔍 DEBUG DB_USER =', JSON.stringify(process.env.DB_USER));
console.log('🔍 DEBUG DB_NAME =', JSON.stringify(process.env.DB_NAME));
// --- نهاية السطر التشخيصي ---

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  charset: 'utf8mb4_general_ci', // Aiven تدعم utf8mb4 بالكامل (نسخة MySQL حديثة)
  ssl: {
    rejectUnauthorized: false // يفعّل الاتصال المشفّر المطلوب من Aiven
  },
  waitForConnections: true,
  connectionLimit: 10
});

module.exports = pool;