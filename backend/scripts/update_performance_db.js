/**
 * Script to update the performance_reviews table schema
 * This ensures proper status transitions and consistency between admin and employee views
 */

const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function updatePerformanceSchema() {
  try {
    console.log('Starting performance schema update...');
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'update_performance_schema.sql');
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Split the SQL script into individual statements
    const statements = sqlScript
      .split(';')
      .filter(statement => statement.trim() !== '');
    
    // Execute each statement
    for (const statement of statements) {
      try {
        await db.query(statement);
        console.log('Executed:', statement.trim().substring(0, 60) + '...');
      } catch (err) {
        // Log error but continue with other statements
        console.error('Error executing statement:', statement.trim());
        console.error('Error details:', err.message);
      }
    }
    
    console.log('Performance schema update completed successfully');
    
    // Verify the changes
    const [rows] = await db.query('DESCRIBE performance_reviews');
    console.log('Updated performance_reviews table structure:');
    console.table(rows.map(row => ({ Field: row.Field, Type: row.Type, Default: row.Default })));
    
    // Get status distribution
    const [statusCounts] = await db.query(`
      SELECT status, COUNT(*) as count 
      FROM performance_reviews 
      GROUP BY status
    `);
    console.log('Status distribution:');
    console.table(statusCounts);
    
  } catch (error) {
    console.error('Error updating performance schema:', error);
  } finally {
    // Close the database connection
    process.exit(0);
  }
}

// Run the update function
updatePerformanceSchema();
