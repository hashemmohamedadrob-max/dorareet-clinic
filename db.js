// db.js
// إعداد الاتصال بقاعدة بيانات عيادة دوراريت (السحابية Aiven MySQL)

require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  charset: 'utf8mb4_general_ci', // نسخة MySQL الحديثة تدعم utf8mb4 بالكامل
  ssl: {
    rejectUnauthorized: false // يفعل الاتصال المشفر المطلوب من Aiven
  },
  waitForConnections: true,
  connectionLimit: 10
});

module.exports = pool;