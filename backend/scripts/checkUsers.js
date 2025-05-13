const db = require('../config/db');

async function checkUsers() {
  try {
    // Get all users
    const [rows] = await db.query('SELECT id, name, email, role, position, department FROM users');
    
    console.log('Users in database:');
    console.log(rows);
    
    // Check if manager exists
    const manager = rows.find(user => user.email === 'manager@example.com');
    if (manager) {
      console.log('\nManager account found:');
      console.log(manager);
    } else {
      console.log('\nManager account not found!');
    }
    
    // Close the connection
    await db.end();
  } catch (error) {
    console.error('Error checking users:', error);
  }
}

checkUsers();
