const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { auth, authorize } = require('../middleware/auth');

// @route   POST api/attendance/check-in
// @desc    Check in
// @access  Private
router.post('/check-in', auth, attendanceController.checkIn);

// @route   POST api/attendance/check-out
// @desc    Check out
// @access  Private
router.post('/check-out', auth, attendanceController.checkOut);

// @route   GET api/attendance/latest
// @desc    Get latest attendance for current user
// @access  Private
router.get('/latest', auth, attendanceController.getLatestAttendance);

// @route   GET api/attendance/me
// @desc    Get attendance history for current user
// @access  Private
router.get('/me', auth, attendanceController.getUserAttendance);

// @route   GET api/attendance/user/:userId
// @desc    Get attendance for specific user
// @access  Private (Admin/Manager)
router.get('/user/:userId', auth, authorize('admin', 'manager'), attendanceController.getAttendanceByUserId);

// @route   GET api/attendance
// @desc    Get all attendance records
// @access  Private (Admin/Manager)
router.get('/', auth, authorize('admin', 'manager'), attendanceController.getAllAttendance);

// @route   PUT api/attendance/:id
// @desc    Update attendance status
// @access  Private (Admin/Manager)
router.put('/:id', auth, authorize('admin', 'manager'), attendanceController.updateAttendanceStatus);

// @route   GET api/attendance/office-location
// @desc    Get office location settings
// @access  Private
router.get('/office-location', auth, attendanceController.getOfficeLocation);

// @route   PUT api/attendance/office-location
// @desc    Update office location settings
// @access  Private (Admin only)
router.put('/office-location', auth, authorize('admin'), attendanceController.updateOfficeLocation);

// @route   DELETE api/attendance/:id
// @desc    Delete attendance record
// @access  Private (Admin only)
router.delete('/:id', auth, authorize('admin'), attendanceController.deleteAttendance);

module.exports = router;
