const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { auth, authorize } = require('../middleware/auth');

// @route   POST api/leave
// @desc    Create a new leave request
// @access  Private
router.post('/', auth, leaveController.createLeaveRequest);

// @route   GET api/leave/me
// @desc    Get leave requests for current user
// @access  Private
router.get('/me', auth, leaveController.getUserLeaveRequests);

// @route   GET api/leave/:id
// @desc    Get leave request by ID
// @access  Private (Admin/Manager or owner)
router.get('/:id', auth, leaveController.getLeaveRequestById);

// @route   GET api/leave/pending
// @desc    Get all pending leave requests
// @access  Private (Admin/Manager)
router.get('/pending', auth, authorize('admin', 'manager'), leaveController.getPendingLeaveRequests);

// @route   GET api/leave
// @desc    Get all leave requests
// @access  Private (Admin/Manager)
router.get('/', auth, authorize('admin', 'manager'), leaveController.getAllLeaveRequests);

// @route   PUT api/leave/:id
// @desc    Approve or reject leave request
// @access  Private (Admin/Manager)
router.put('/:id', auth, authorize('admin', 'manager'), leaveController.updateLeaveRequestStatus);

// @route   DELETE api/leave/:id
// @desc    Delete leave request
// @access  Private (only if pending and created by current user)
router.delete('/:id', auth, leaveController.deleteLeaveRequest);

module.exports = router;
