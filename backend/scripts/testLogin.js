const axios = require('axios');

async function testLogin() {
  try {
    console.log('Testing login with manager account...');
    
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'manager@example.com',
      password: 'manager123'
    });
    
    console.log('Login successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('Login failed!');
    console.error('Error:', error.response ? error.response.data : error.message);
    console.error('Status:', error.response ? error.response.status : 'No status');
    
    if (error.response && error.response.data) {
      console.error('Error message:', error.response.data.message);
    }
  }
}

testLogin();
