const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { auth, authorize } = require('../middleware/auth');

// @route   GET api/reports/attendance
// @desc    Get monthly attendance report
// @access  Private (Admin/Manager)
router.get('/attendance', auth, authorize('admin', 'manager'), reportController.getMonthlyAttendanceReport);

// @route   GET api/reports/performance
// @desc    Get employee performance report
// @access  Private (Admin/Manager)
router.get('/performance', auth, authorize('admin', 'manager'), reportController.getEmployeePerformanceReport);

// @route   GET api/reports/salary
// @desc    Get salary report
// @access  Private (Admin/Manager)
router.get('/salary', auth, authorize('admin', 'manager'), reportController.getSalaryReport);

module.exports = router;
