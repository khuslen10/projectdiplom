/**
 * Script to update the default ALLOWED_RADIUS value in .env file
 * This makes attendance registration easier by setting a larger default radius
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Default values if not found in .env
const DEFAULT_OFFICE_LAT = '47.916646';
const DEFAULT_OFFICE_LNG = '106.908877';
const DEFAULT_ALLOWED_RADIUS = '3000'; // Setting a larger default value of 3000 meters

async function updateDefaultRadius() {
  try {
    console.log('Updating default radius value...');
    
    const envPath = path.resolve(__dirname, '../.env');
    let envVars = {};
    let envContent = '';
    
    // Check if .env file exists
    if (fs.existsSync(envPath)) {
      console.log('Reading existing .env file');
      envContent = fs.readFileSync(envPath, 'utf8');
      // Parse existing env file
      envVars = dotenv.parse(envContent);
    } else {
      console.log('Creating new .env file');
    }
    
    // Update or add values
    envVars.OFFICE_LAT = envVars.OFFICE_LAT || DEFAULT_OFFICE_LAT;
    envVars.OFFICE_LNG = envVars.OFFICE_LNG || DEFAULT_OFFICE_LNG;
    envVars.ALLOWED_RADIUS = DEFAULT_ALLOWED_RADIUS; // Always update to new default
    
    // Convert to string format
    envContent = Object.entries(envVars)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    // Write to .env file
    fs.writeFileSync(envPath, envContent);
    
    console.log('Default radius successfully updated to 3000 meters');
    console.log('Updated .env content:');
    console.log(`OFFICE_LAT=${envVars.OFFICE_LAT}`);
    console.log(`OFFICE_LNG=${envVars.OFFICE_LNG}`);
    console.log(`ALLOWED_RADIUS=${envVars.ALLOWED_RADIUS}`);
    
  } catch (error) {
    console.error('Error updating default radius:', error);
  }
}

// Run the function
updateDefaultRadius().then(() => {
  console.log('Script completed');
}).catch(err => {
  console.error('Script failed:', err);
}); 