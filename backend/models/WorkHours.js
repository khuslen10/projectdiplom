const db = require('../config/db');

class WorkHours {
  // Calculate working hours from attendance records for a specific user and date range
  static async calculateWorkHours(userId, startDate, endDate) {
    try {
      // Get all approved attendance records for the user in the date range
      const [attendanceRecords] = await db.query(
        `SELECT * FROM attendance 
         WHERE user_id = ? 
         AND DATE(check_in) >= ? 
         AND DATE(check_in) <= ? 
         AND approval_status = 'approved'
         AND check_out IS NOT NULL
         ORDER BY check_in`,
        [userId, startDate, endDate]
      );
      
      // Initialize calculation variables
      let totalRegularHours = 0;
      let totalOvertimeHours = 0;
      let totalWeekendHours = 0;
      let totalNightHours = 0;
      let daysWorked = 0;
      let daysLate = 0;
      let workingSummary = [];
      
      // Standard work settings
      const regularHoursPerDay = 8;
      const nightShiftStart = 22; // 10 PM
      const nightShiftEnd = 6; // 6 AM
      const standardStartTime = 9; // 9 AM
      const lateThreshold = 15; // 15 minutes grace period
      
      // Process each attendance record
      for (const record of attendanceRecords) {
        const checkIn = new Date(record.check_in);
        const checkOut = new Date(record.check_out);
        
        // Skip invalid records
        if (checkOut <= checkIn) continue;
        
        // Calculate total hours worked
        const totalHours = (checkOut - checkIn) / (1000 * 60 * 60);
        
        // Determine if it's a weekend
        const day = checkIn.getDay();
        const isWeekend = day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
        
        // Check if late
        const checkInHour = checkIn.getHours();
        const checkInMinute = checkIn.getMinutes();
        const minutesLate = (checkInHour - standardStartTime) * 60 + checkInMinute;
        const isLate = !isWeekend && checkInHour >= standardStartTime && minutesLate > lateThreshold;
        
        // Calculate regular and overtime hours
        let regularHours = 0;
        let overtimeHours = 0;
        let weekendHours = 0;
        let nightHours = 0;
        
        if (isWeekend) {
          // Weekend hours (all count as weekend hours)
          weekendHours = totalHours;
        } else {
          // Regular workday
          regularHours = Math.min(totalHours, regularHoursPerDay);
          overtimeHours = Math.max(0, totalHours - regularHoursPerDay);
          daysWorked++;
          
          if (isLate) {
            daysLate++;
          }
        }
        
        // Calculate night shift hours
        // This is a simplified calculation - a more accurate version would check each hour
        const checkInHours = checkIn.getHours();
        const checkOutHours = checkOut.getHours();
        
        if (checkInHours >= nightShiftStart || checkOutHours < nightShiftEnd) {
          // If part of the shift is during night hours
          // For simplicity, we're assuming any work that starts after night shift start
          // or ends before night shift end counts entirely as night shift
          nightHours = totalHours;
        }
        
        // Add to totals
        totalRegularHours += regularHours;
        totalOvertimeHours += overtimeHours;
        totalWeekendHours += weekendHours;
        totalNightHours += nightHours;
        
        // Add daily summary
        workingSummary.push({
          date: checkIn.toISOString().split('T')[0],
          check_in: record.check_in,
          check_out: record.check_out,
          regular_hours: regularHours,
          overtime_hours: overtimeHours,
          weekend_hours: weekendHours,
          night_hours: nightHours,
          is_late: isLate,
          total_hours: totalHours
        });
      }
      
      return {
        user_id: userId,
        period_start: startDate,
        period_end: endDate,
        regular_hours: totalRegularHours,
        overtime_hours: totalOvertimeHours,
        weekend_hours: totalWeekendHours,
        night_hours: totalNightHours,
        days_worked: daysWorked,
        days_late: daysLate,
        daily_summary: workingSummary
      };
    } catch (error) {
      throw error;
    }
  }
  
  // Calculate salary based on working hours and salary settings
  static async calculateSalary(userId, workHours, baseSalary) {
    try {
      // Get salary settings
      const [userSettings] = await db.query(
        `SELECT hourly_rate, overtime_rate, weekend_rate, night_shift_rate 
         FROM user_settings 
         WHERE user_id = ?`,
        [userId]
      );
      
      // Default rates if settings not found
      const hourlyRate = userSettings.length > 0 ? userSettings[0].hourly_rate : baseSalary / 176; // 22 days × 8 hours
      const overtimeRate = userSettings.length > 0 ? userSettings[0].overtime_rate : 1.5;
      const weekendRate = userSettings.length > 0 ? userSettings[0].weekend_rate : 2.0;
      const nightShiftRate = userSettings.length > 0 ? userSettings[0].night_shift_rate : 1.4;
      
      // Calculate pay components
      const regularPay = workHours.regular_hours * hourlyRate;
      const overtimePay = workHours.overtime_hours * hourlyRate * overtimeRate;
      const weekendPay = workHours.weekend_hours * hourlyRate * weekendRate;
      const nightShiftPay = workHours.night_hours * hourlyRate * nightShiftRate;
      
      // Calculate deductions
      const grossPay = regularPay + overtimePay + weekendPay + nightShiftPay;
      const incomeTax = grossPay * 0.10; // 10% income tax
      const socialInsurance = grossPay * 0.115; // 11.5% social insurance
      const healthInsurance = grossPay * 0.01; // 1% health insurance
      
      // Total deductions
      const totalDeductions = incomeTax + socialInsurance + healthInsurance;
      
      // Net pay
      const netPay = grossPay - totalDeductions;
      
      return {
        gross_pay: grossPay,
        regular_pay: regularPay,
        overtime_pay: overtimePay,
        weekend_pay: weekendPay,
        night_shift_pay: nightShiftPay,
        income_tax: incomeTax,
        social_insurance: socialInsurance,
        health_insurance: healthInsurance,
        total_deductions: totalDeductions,
        net_pay: netPay
      };
    } catch (error) {
      throw error;
    }
  }
  
  // Store working hours calculation in database
  static async saveWorkHoursCalculation(workHours, salaryCalculation) {
    try {
      const [result] = await db.query(
        `INSERT INTO work_hours (
          user_id, period_start, period_end, regular_hours, overtime_hours, 
          weekend_hours, night_hours, days_worked, days_late, 
          gross_pay, regular_pay, overtime_pay, weekend_pay, night_shift_pay,
          income_tax, social_insurance, health_insurance, total_deductions, net_pay
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          workHours.user_id, workHours.period_start, workHours.period_end,
          workHours.regular_hours, workHours.overtime_hours, 
          workHours.weekend_hours, workHours.night_hours,
          workHours.days_worked, workHours.days_late,
          salaryCalculation.gross_pay, salaryCalculation.regular_pay,
          salaryCalculation.overtime_pay, salaryCalculation.weekend_pay,
          salaryCalculation.night_shift_pay, salaryCalculation.income_tax,
          salaryCalculation.social_insurance, salaryCalculation.health_insurance,
          salaryCalculation.total_deductions, salaryCalculation.net_pay
        ]
      );
      
      // Save daily summary records
      for (const day of workHours.daily_summary) {
        await db.query(
          `INSERT INTO work_hours_daily (
            work_hours_id, date, check_in, check_out, 
            regular_hours, overtime_hours, weekend_hours, night_hours, 
            is_late, total_hours
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            result.insertId, day.date, day.check_in, day.check_out,
            day.regular_hours, day.overtime_hours, day.weekend_hours, day.night_hours,
            day.is_late, day.total_hours
          ]
        );
      }
      
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }
  
  // Get stored work hours by ID
  static async getById(id) {
    try {
      const [workHours] = await db.query(
        `SELECT * FROM work_hours WHERE id = ?`,
        [id]
      );
      
      if (workHours.length === 0) {
        return null;
      }
      
      // Get daily summary
      const [dailySummary] = await db.query(
        `SELECT * FROM work_hours_daily WHERE work_hours_id = ? ORDER BY date`,
        [id]
      );
      
      return {
        ...workHours[0],
        daily_summary: dailySummary
      };
    } catch (error) {
      throw error;
    }
  }
  
  // Get work hours by user ID and period
  static async getByUserIdAndPeriod(userId, startDate, endDate) {
    try {
      const [workHours] = await db.query(
        `SELECT * FROM work_hours 
         WHERE user_id = ? 
         AND period_start >= ? 
         AND period_end <= ?
         ORDER BY period_start DESC`,
        [userId, startDate, endDate]
      );
      
      return workHours;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = WorkHours; 