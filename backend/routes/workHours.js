const express = require('express');
const router = express.Router();
const workHoursController = require('../controllers/workHoursController');
const { auth, authorize } = require('../middleware/auth');

// @route   POST api/work-hours/calculate
// @desc    Calculate work hours for a period
// @access  Private (Admin/Manager)
router.post('/calculate', auth, authorize('admin', 'manager'), workHoursController.calculateWorkHours);

// @route   GET api/work-hours/:id
// @desc    Get work hours calculation by ID
// @access  Private (Admin/Manager)
router.get('/:id', auth, authorize('admin', 'manager'), workHoursController.getWorkHoursById);

// @route   GET api/work-hours/user/:userId
// @desc    Get work hours for a specific user
// @access  Private (Admin/Manager)
router.get('/user/:userId', auth, authorize('admin', 'manager'), workHoursController.getWorkHoursByUser);

// @route   GET api/work-hours/me
// @desc    Get current user's work hours
// @access  Private
router.get('/me', auth, workHoursController.getCurrentUserWorkHours);

// @route   POST api/work-hours/manual
// @desc    Create a manual work hours entry
// @access  Private (Admin/Manager)
router.post('/manual', auth, authorize('admin', 'manager'), workHoursController.createManualWorkHours);

// @route   POST api/work-hours/payroll
// @desc    Process payroll for all employees
// @access  Private (Admin only)
router.post('/payroll', auth, authorize('admin'), workHoursController.processPayroll);

module.exports = router; 