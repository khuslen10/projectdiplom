const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

const initDatabase = async () => {
  try {
    // Create connection to MySQL server without database selection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });

    console.log('Өгөгдлийн сангийн холболт амжилттай');

    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log(`${process.env.DB_NAME} өгөгдлийн сан амжилттай үүсгэгдлээ`);

    // Use the database
    await connection.query(`USE ${process.env.DB_NAME}`);

    // Read SQL file
    const sqlFilePath = path.join(__dirname, 'database.sql');
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');

    // Split SQL script into separate statements
    const statements = sqlScript.split(';').filter(statement => statement.trim() !== '');

    // Execute each statement
    for (const statement of statements) {
      await connection.query(statement);
    }

    console.log('Өгөгдлийн сангийн бүтэц амжилттай үүсгэгдлээ');
    await connection.end();
    
    return true;
  } catch (error) {
    console.error('Өгөгдлийн сан үүсгэхэд алдаа гарлаа:', error);
    return false;
  }
};

// Run if called directly
if (require.main === module) {
  initDatabase()
    .then(success => {
      if (success) {
        console.log('Өгөгдлийн сан амжилттай үүсгэгдлээ');
      } else {
        console.log('Өгөгдлийн сан үүсгэхэд алдаа гарлаа');
      }
      process.exit(success ? 0 : 1);
    });
}

module.exports = initDatabase;
