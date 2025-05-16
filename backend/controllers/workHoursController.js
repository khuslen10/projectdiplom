const WorkHours = require('../models/WorkHours');
const Salary = require('../models/Salary');
const Changelog = require('../models/Changelog');

// Calculate work hours for a specific period
exports.calculateWorkHours = async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.body;
    
    if (!userId || !startDate || !endDate) {
      return res.status(400).json({ 
        message: 'Хэрэглэгчийн ID, эхлэх огноо, дуусах огноо заавал шаардлагатай' 
      });
    }
    
    // Calculate working hours from attendance
    const workHours = await WorkHours.calculateWorkHours(userId, startDate, endDate);
    
    // Get user's base salary
    const salaries = await Salary.getByUserId(userId);
    if (!salaries || salaries.length === 0) {
      return res.status(404).json({ message: 'Хэрэглэгчийн цалингийн мэдээлэл олдсонгүй' });
    }
    
    // Use the most recent salary record
    const latestSalary = salaries[0];
    
    // Calculate salary based on working hours
    const salaryCalculation = await WorkHours.calculateSalary(
      userId, 
      workHours, 
      latestSalary.base_salary
    );
    
    // Save the calculation
    const workHoursId = await WorkHours.saveWorkHoursCalculation(workHours, salaryCalculation);
    
    // Add to changelog
    await Changelog.create({
      title: 'Ажлын цагийн тооцоо хийгдсэн',
      description: `${req.user.name} ${userId}-тай хэрэглэгчийн ажлын цагийн тооцоо хийлээ`,
      type: 'update',
      created_by: req.user.id
    });
    
    res.json({
      message: 'Ажлын цагийн тооцоо амжилттай хийгдлээ',
      workHoursId,
      workHours: {
        ...workHours,
        salary: salaryCalculation
      }
    });
  } catch (error) {
    console.error('Ажлын цагийн тооцоо хийхэд алдаа гарлаа:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};

// Get calculated work hours by ID
exports.getWorkHoursById = async (req, res) => {
  try {
    const { id } = req.params;
    const workHours = await WorkHours.getById(id);
    
    if (!workHours) {
      return res.status(404).json({ message: 'Ажлын цагийн тооцоо олдсонгүй' });
    }
    
    res.json(workHours);
  } catch (error) {
    console.error('Ажлын цагийн тооцоо авахад алдаа гарлаа:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};

// Get work hours by user ID and period
exports.getWorkHoursByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        message: 'Эхлэх огноо, дуусах огноо заавал шаардлагатай' 
      });
    }
    
    const workHours = await WorkHours.getByUserIdAndPeriod(userId, startDate, endDate);
    
    res.json(workHours);
  } catch (error) {
    console.error('Хэрэглэгчийн ажлын цагийн тооцоо авахад алдаа гарлаа:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};

// Get current user's work hours
exports.getCurrentUserWorkHours = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        message: 'Эхлэх огноо, дуусах огноо заавал шаардлагатай' 
      });
    }
    
    const workHours = await WorkHours.getByUserIdAndPeriod(userId, startDate, endDate);
    
    res.json(workHours);
  } catch (error) {
    console.error('Одоогийн хэрэглэгчийн ажлын цагийн тооцоо авахад алдаа гарлаа:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};

// Create a new work hours record manually (for admins)
exports.createManualWorkHours = async (req, res) => {
  try {
    const { 
      userId, startDate, endDate, 
      regularHours, overtimeHours, weekendHours, nightHours,
      manualAdjustment, adjustmentReason 
    } = req.body;
    
    if (!userId || !startDate || !endDate) {
      return res.status(400).json({ 
        message: 'Хэрэглэгчийн ID, эхлэх огноо, дуусах огноо заавал шаардлагатай' 
      });
    }
    
    // First calculate automatically from attendance
    const workHours = await WorkHours.calculateWorkHours(userId, startDate, endDate);
    
    // Apply manual adjustment if provided
    if (manualAdjustment) {
      workHours.regular_hours = regularHours || workHours.regular_hours;
      workHours.overtime_hours = overtimeHours || workHours.overtime_hours;
      workHours.weekend_hours = weekendHours || workHours.weekend_hours;
      workHours.night_hours = nightHours || workHours.night_hours;
      workHours.adjustment_reason = adjustmentReason;
    }
    
    // Get user's base salary
    const salaries = await Salary.getByUserId(userId);
    if (!salaries || salaries.length === 0) {
      return res.status(404).json({ message: 'Хэрэглэгчийн цалингийн мэдээлэл олдсонгүй' });
    }
    
    // Use the most recent salary record
    const latestSalary = salaries[0];
    
    // Calculate salary based on working hours
    const salaryCalculation = await WorkHours.calculateSalary(
      userId, 
      workHours, 
      latestSalary.base_salary
    );
    
    // Save the calculation
    const workHoursId = await WorkHours.saveWorkHoursCalculation(workHours, salaryCalculation);
    
    // Add to changelog
    await Changelog.create({
      title: manualAdjustment ? 'Гараар ажлын цагийн тооцоо оруулсан' : 'Ажлын цагийн тооцоо хийгдсэн',
      description: `${req.user.name} ${userId}-тай хэрэглэгчийн ажлын цагийн тооцоо ${manualAdjustment ? 'гараар оруулсан' : 'хийсэн'}`,
      type: 'update',
      created_by: req.user.id
    });
    
    res.status(201).json({
      message: 'Ажлын цагийн тооцоо амжилттай хадгалагдлаа',
      workHoursId,
      workHours: {
        ...workHours,
        salary: salaryCalculation
      }
    });
  } catch (error) {
    console.error('Ажлын цагийн тооцоо хадгалахад алдаа гарлаа:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};

// Process payroll for a specific period
exports.processPayroll = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        message: 'Эхлэх огноо, дуусах огноо заавал шаардлагатай' 
      });
    }
    
    // Get all active users
    const [users] = await db.query('SELECT id FROM users WHERE status = "active"');
    
    const results = [];
    const errors = [];
    
    // Process each user
    for (const user of users) {
      try {
        // Calculate work hours
        const workHours = await WorkHours.calculateWorkHours(user.id, startDate, endDate);
        
        // Get user's base salary
        const salaries = await Salary.getByUserId(user.id);
        if (!salaries || salaries.length === 0) {
          errors.push({
            userId: user.id,
            error: 'Цалингийн мэдээлэл олдсонгүй'
          });
          continue;
        }
        
        // Use the most recent salary record
        const latestSalary = salaries[0];
        
        // Calculate salary
        const salaryCalculation = await WorkHours.calculateSalary(
          user.id, 
          workHours, 
          latestSalary.base_salary
        );
        
        // Save calculation
        const workHoursId = await WorkHours.saveWorkHoursCalculation(workHours, salaryCalculation);
        
        // Create a new salary record with the calculated values
        const newSalaryId = await Salary.create({
          user_id: user.id,
          base_salary: latestSalary.base_salary,
          bonus: salaryCalculation.overtime_pay + salaryCalculation.weekend_pay + salaryCalculation.night_shift_pay,
          deductions: salaryCalculation.total_deductions,
          effective_date: new Date().toISOString().split('T')[0] // Today
        });
        
        results.push({
          userId: user.id,
          workHoursId,
          salaryId: newSalaryId
        });
      } catch (error) {
        console.error(`Error processing payroll for user ${user.id}:`, error);
        errors.push({
          userId: user.id,
          error: error.message
        });
      }
    }
    
    // Add to changelog
    await Changelog.create({
      title: 'Цалингийн тооцоо бөөнөөр хийгдсэн',
      description: `${req.user.name} ${startDate}-${endDate} хугацааны цалингийн тооцоо хийлээ`,
      type: 'update',
      created_by: req.user.id
    });
    
    res.json({
      message: 'Цалингийн тооцоо амжилттай хийгдлээ',
      processed: results.length,
      errors: errors.length,
      results,
      errorDetails: errors
    });
  } catch (error) {
    console.error('Цалингийн тооцоо хийхэд алдаа гарлаа:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
}; 