// db.js
// إعداد الاتصال بقاعدة بيانات عيادة دوراريت (Aiven MySQL السحابية)

require('dotenv').config();
const mysql = require('mysql2/promise');

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