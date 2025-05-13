const db = require('../config/db');
const Salary = require('../models/Salary');

async function createSampleSalaryData() {
  try {
    console.log('Creating sample salary data...');
    
    // Get manager user ID
    const [managerRows] = await db.query('SELECT id FROM users WHERE email = ?', ['manager@example.com']);
    if (managerRows.length === 0) {
      console.log('Manager account not found!');
      return;
    }
    
    const managerId = managerRows[0].id;
    console.log(`Found manager with ID: ${managerId}`);
    
    // Check if salary record already exists
    const [existingRows] = await db.query('SELECT id FROM salary WHERE user_id = ?', [managerId]);
    if (existingRows.length > 0) {
      console.log('Salary record already exists for manager');
      return;
    }
    
    // Create current salary
    const currentSalary = {
      user_id: managerId,
      base_salary: 1500000,
      bonus: 200000,
      deductions: 50000,
      effective_date: new Date().toISOString().split('T')[0] // Today
    };
    
    const currentSalaryId = await Salary.create(currentSalary);
    console.log(`Created current salary record with ID: ${currentSalaryId}`);
    
    // Create historical salary records (3 months ago)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const historicalSalary = {
      user_id: managerId,
      base_salary: 1400000,
      bonus: 150000,
      deductions: 45000,
      effective_date: threeMonthsAgo.toISOString().split('T')[0]
    };
    
    const historicalSalaryId = await Salary.create(historicalSalary);
    console.log(`Created historical salary record with ID: ${historicalSalaryId}`);
    
    // Create older historical salary record (6 months ago)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const olderSalary = {
      user_id: managerId,
      base_salary: 1300000,
      bonus: 100000,
      deductions: 40000,
      effective_date: sixMonthsAgo.toISOString().split('T')[0]
    };
    
    const olderSalaryId = await Salary.create(olderSalary);
    console.log(`Created older salary record with ID: ${olderSalaryId}`);
    
    console.log('Sample salary data created successfully!');
    
    // Close the connection
    await db.end();
  } catch (error) {
    console.error('Error creating sample salary data:', error);
  }
}

createSampleSalaryData();
