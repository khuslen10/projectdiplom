const bcrypt = require('bcryptjs');
const db = require('../config/db');

async function verifyPassword() {
  try {
    // Get the manager account
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', ['manager@example.com']);
    
    if (rows.length === 0) {
      console.log('Manager account not found!');
      return;
    }
    
    const user = rows[0];
    console.log('Manager account found:');
    console.log({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      password_hash: user.password.substring(0, 20) + '...' // Show only part of the hash for security
    });
    
    // Test the password
    const testPassword = 'manager123';
    const isMatch = await bcrypt.compare(testPassword, user.password);
    
    console.log(`\nPassword '${testPassword}' is ${isMatch ? 'correct' : 'incorrect'}`);
    
    // If password doesn't match, update it with a known good hash
    if (!isMatch) {
      console.log('\nUpdating password hash...');
      
      // Generate new hash
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(testPassword, salt);
      
      // Update in database
      await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, user.id]);
      
      console.log('Password updated successfully!');
    }
    
    // Close the connection
    await db.end();
  } catch (error) {
    console.error('Error verifying password:', error);
  }
}

verifyPassword();
