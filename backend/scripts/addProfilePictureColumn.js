const db = require('../config/db');

async function addProfilePictureColumn() {
  try {
    console.log('Adding profile_picture column to users table...');
    
    // Check if column already exists
    const [columns] = await db.query('SHOW COLUMNS FROM users LIKE "profile_picture"');
    
    if (columns.length > 0) {
      console.log('profile_picture column already exists');
    } else {
      // Add profile_picture column to users table
      await db.query('ALTER TABLE users ADD COLUMN profile_picture VARCHAR(255)');
      console.log('profile_picture column added successfully');
    }
    
    // Close the connection
    await db.end();
  } catch (error) {
    console.error('Error adding profile_picture column:', error);
  }
}

addProfilePictureColumn();
