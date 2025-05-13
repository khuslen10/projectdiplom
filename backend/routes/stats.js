const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { auth, authorize } = require('../middleware/auth');

// @route   GET api/stats/department
// @desc    Get department distribution stats
// @access  Public (for testing)
router.get('/department', statsController.getDepartmentStats);

// @route   GET api/stats/attendance
// @desc    Get attendance stats for a specific month and year
// @access  Public (for testing)
router.get('/attendance', statsController.getAttendanceStats);

// @route   GET api/stats/performance
// @desc    Get performance stats by department
// @access  Public (for testing)
router.get('/performance', statsController.getPerformanceStats);

// @route   GET api/stats/salary
// @desc    Get salary stats by department
// @access  Public (for testing)
router.get('/salary', statsController.getSalaryStats);

// @route   GET api/stats/overall
// @desc    Get overall system stats
// @access  Public (for testing)
router.get('/overall', statsController.getOverallStats);

module.exports = router;
