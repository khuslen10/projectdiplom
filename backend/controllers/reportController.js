const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Performance = require('../models/Performance');
const Salary = require('../models/Salary');
const Leave = require('../models/Leave');

// Сарын ирцийн тайлан үүсгэх
exports.getMonthlyAttendanceReport = async (req, res) => {
  try {
    const { month, year, department } = req.query;
    
    // Оролтыг шалгах
    if (!month || !year) {
      return res.status(400).json({ message: 'Сар болон жил заавал шаардлагатай' });
    }
    
    // Тоон утга руу хөрвүүлэх
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    
    // Сар ба жилийг шалгах
    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({ message: 'Сар буруу байна (1-12)' });
    }
    
    if (isNaN(yearNum) || yearNum < 2020 || yearNum > 2100) {
      return res.status(400).json({ message: 'Жил буруу байна (2020-2100)' });
    }
    
    // Сарын эхлэх ба дуусах огноог авах
    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0);
    
    // SQL хүсэлтэд зориулж огноог форматлах
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    // Бүх хэрэглэгчдийг авах (хэлтсээр шүүх боломжтой)
    let users;
    if (department) {
      users = await User.getByDepartment(department);
    } else {
      users = await User.getAll();
    }
    
    // Тухайн сард хэрэглэгч бүрийн ирцийн мэдээллийг авах
    const report = [];
    
    for (const user of users) {
      // Тухайн сард хэрэглэгчийн ирцийн бүртгэлийг авах
      const attendanceRecords = await Attendance.getByUserIdAndDateRange(
        user.id, 
        startDateStr, 
        endDateStr
      );
      
      // Статистик тооцоолох
      const totalDays = endDate.getDate();
      const presentDays = attendanceRecords.filter(record => record.status === 'present').length;
      const lateDays = attendanceRecords.filter(record => record.status === 'late').length;
      const absentDays = attendanceRecords.filter(record => record.status === 'absent').length;
      const halfDays = attendanceRecords.filter(record => record.status === 'half-day').length;
      const recordedDays = presentDays + lateDays + absentDays + halfDays;
      const missingDays = totalDays - recordedDays;
      
      // Дундаж ирсэн ба явсан цагийг тооцоолох
      let totalCheckInMinutes = 0;
      let totalCheckOutMinutes = 0;
      let checkInCount = 0;
      let checkOutCount = 0;
      
      for (const record of attendanceRecords) {
        if (record.check_in) {
          const checkInTime = new Date(record.check_in);
          totalCheckInMinutes += checkInTime.getHours() * 60 + checkInTime.getMinutes();
          checkInCount++;
        }
        
        if (record.check_out) {
          const checkOutTime = new Date(record.check_out);
          totalCheckOutMinutes += checkOutTime.getHours() * 60 + checkOutTime.getMinutes();
          checkOutCount++;
        }
      }
      
      const avgCheckInTime = checkInCount > 0 
        ? formatMinutesToTime(totalCheckInMinutes / checkInCount) 
        : 'N/A';
        
      const avgCheckOutTime = checkOutCount > 0 
        ? formatMinutesToTime(totalCheckOutMinutes / checkOutCount) 
        : 'N/A';
      
      // Хэрэглэгчийн тайланг ерөнхий тайланд нэмэх
      report.push({
        user_id: user.id,
        name: user.name,
        email: user.email,
        position: user.position,
        department: user.department,
        total_days: totalDays,
        present_days: presentDays,
        late_days: lateDays,
        absent_days: absentDays,
        half_days: halfDays,
        missing_days: missingDays,
        attendance_rate: ((presentDays + (lateDays * 0.8) + (halfDays * 0.5)) / totalDays * 100).toFixed(2),
        avg_check_in: avgCheckInTime,
        avg_check_out: avgCheckOutTime
      });
    }
    
    res.json({
      month: monthNum,
      year: yearNum,
      department: department || 'Бүх хэлтэс',
      total_employees: report.length,
      report
    });
    
  } catch (error) {
    console.error('Сарын ирцийн тайлан үүсгэхэд алдаа гарлаа:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};

// Ажилтны гүйцэтгэлийн тайлан үүсгэх
exports.getEmployeePerformanceReport = async (req, res) => {
  try {
    const { year, department } = req.query;
    
    // Оролтыг шалгах
    if (!year) {
      return res.status(400).json({ message: 'Жил заавал шаардлагатай' });
    }
    
    // Convert to number
    const yearNum = parseInt(year);
    
    // Validate year
    if (isNaN(yearNum) || yearNum < 2020 || yearNum > 2100) {
      return res.status(400).json({ message: 'Жил буруу байна (2020-2100)' });
    }
    
    // Бүх хэрэглэгчдийг авах (хэлтсээр шүүх боломжтой)
    let users;
    if (department) {
      users = await User.getByDepartment(department);
    } else {
      users = await User.getAll();
    }
    
    // Тухайн хугацаанд хэрэглэгч бүрийн гүйцэтгэлийн мэдээллийг авах
    const report = [];
    
    for (const user of users) {
      // Тухайн хугацаанд хэрэглэгчийн гүйцэтгэлийн бүртгэлийг авах
      const performanceReviews = await Performance.getByUserIdAndYear(user.id, yearNum);
      
      // Дундаж үнэлгээг тооцоолох
      let totalRating = 0;
      let reviewCount = 0;
      
      for (const review of performanceReviews) {
        totalRating += review.rating;
        reviewCount++;
      }
      
      const avgRating = reviewCount > 0 ? (totalRating / reviewCount).toFixed(1) : 'N/A';
      
      // Хэрэглэгчийн тайланг ерөнхий тайланд нэмэх
      report.push({
        user_id: user.id,
        name: user.name,
        email: user.email,
        position: user.position,
        department: user.department,
        review_count: reviewCount,
        avg_rating: avgRating,
        latest_review: performanceReviews.length > 0 ? performanceReviews[0] : null
      });
    }
    
    res.json({
      year: yearNum,
      department: department || 'Бүх хэлтэс',
      total_employees: report.length,
      report
    });
    
  } catch (error) {
    console.error('Ажилтны гүйцэтгэлийн тайлан үүсгэхэд алдаа гарлаа:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};

// Цалингийн тайлан үүсгэх
exports.getSalaryReport = async (req, res) => {
  try {
    const { year, month, department } = req.query;
    
    // Оролтыг шалгах
    if (!year) {
      return res.status(400).json({ message: 'Жил заавал шаардлагатай' });
    }
    
    // Тоон утга руу хөрвүүлэх
    const yearNum = parseInt(year);
    const monthNum = month ? parseInt(month) : null;
    
    // Validate year and month
    if (isNaN(yearNum) || yearNum < 2020 || yearNum > 2100) {
      return res.status(400).json({ message: 'Жил буруу байна (2020-2100)' });
    }
    
    if (monthNum !== null && (isNaN(monthNum) || monthNum < 1 || monthNum > 12)) {
      return res.status(400).json({ message: 'Сар буруу байна (1-12)' });
    }
    
    // Бүх хэрэглэгчдийг авах (хэлтсээр шүүх боломжтой)
    let users;
    if (department) {
      users = await User.getByDepartment(department);
    } else {
      users = await User.getAll();
    }
    
    // Хэрэглэгч бүрийн цалингийн мэдээллийг авах
    const report = [];
    let totalBaseSalary = 0;
    let totalBonus = 0;
    let totalDeductions = 0;
    let totalNetSalary = 0;
    
    for (const user of users) {
      // Хэрэглэгчийн цалингийн бүртгэлийг авах
      let salaryRecords;
      
      if (monthNum) {
        // Тодорхой сарын цалингийг авах
        const startDate = new Date(yearNum, monthNum - 1, 1);
        const endDate = new Date(yearNum, monthNum, 0);
        
        salaryRecords = await Salary.getByUserIdAndDateRange(
          user.id, 
          startDate.toISOString().split('T')[0], 
          endDate.toISOString().split('T')[0]
        );
      } else {
        // Жилийн бүх цалингийн бүртгэлийг авах
        const startDate = new Date(yearNum, 0, 1);
        const endDate = new Date(yearNum, 11, 31);
        
        salaryRecords = await Salary.getByUserIdAndDateRange(
          user.id, 
          startDate.toISOString().split('T')[0], 
          endDate.toISOString().split('T')[0]
        );
      }
      
      // Нийт дүнг тооцоолох
      let userBaseSalary = 0;
      let userBonus = 0;
      let userDeductions = 0;
      
      for (const record of salaryRecords) {
        userBaseSalary += parseFloat(record.base_salary);
        userBonus += parseFloat(record.bonus);
        userDeductions += parseFloat(record.deductions);
      }
      
      const userNetSalary = userBaseSalary + userBonus - userDeductions;
      
      // Нийт дүнг шинэчлэх
      totalBaseSalary += userBaseSalary;
      totalBonus += userBonus;
      totalDeductions += userDeductions;
      totalNetSalary += userNetSalary;
      
      // Хэрэглэгчийн тайланг ерөнхий тайланд нэмэх
      report.push({
        user_id: user.id,
        name: user.name,
        email: user.email,
        position: user.position,
        department: user.department,
        base_salary: userBaseSalary,
        bonus: userBonus,
        deductions: userDeductions,
        net_salary: userNetSalary,
        records: salaryRecords
      });
    }
    
    res.json({
      year: yearNum,
      month: monthNum,
      department: department || 'Бүх хэлтэс',
      total_employees: report.length,
      total_base_salary: totalBaseSalary,
      total_bonus: totalBonus,
      total_deductions: totalDeductions,
      total_net_salary: totalNetSalary,
      report
    });
    
  } catch (error) {
    console.error('Цалингийн тайлан үүсгэхэд алдаа гарлаа:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};

// Минутыг HH:MM цагийн формат руу хөрвүүлэх туслах функц
function formatMinutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}
