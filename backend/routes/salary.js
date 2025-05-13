const express = require('express');
const router = express.Router();
const salaryController = require('../controllers/salaryController');
const { auth, authorize } = require('../middleware/auth');

// @route   POST api/salary
// @desc    Create a new salary record
// @access  Private (Admin/Manager)
router.post('/', auth, authorize('admin', 'manager'), salaryController.createSalary);

// @route   GET api/salary/me/current
// @desc    Get current salary for current user
// @access  Private
router.get('/me/current', auth, salaryController.getCurrentUserSalary);

// @route   GET api/salary/me
// @desc    Get salary history for current user
// @access  Private
router.get('/me', auth, salaryController.getUserSalary);

// @route   GET api/salary/user/:userId
// @desc    Get salary history for specific user
// @access  Private (Admin/Manager)
router.get('/user/:userId', auth, authorize('admin', 'manager'), salaryController.getSalaryByUserId);

// @route   GET api/salary/:id
// @desc    Get salary record by ID
// @access  Private (Admin/Manager or owner)
router.get('/:id', auth, salaryController.getSalaryById);

// @route   GET api/salary
// @desc    Get all salary records
// @access  Private (Admin/Manager)
router.get('/', auth, authorize('admin', 'manager'), salaryController.getAllSalaries);

// @route   PUT api/salary/:id
// @desc    Update salary record
// @access  Private (Admin/Manager)
router.put('/:id', auth, authorize('admin', 'manager'), salaryController.updateSalary);

// @route   DELETE api/salary/:id
// @desc    Delete salary record
// @access  Private (Admin only)
router.delete('/:id', auth, authorize('admin'), salaryController.deleteSalary);

module.exports = router;
