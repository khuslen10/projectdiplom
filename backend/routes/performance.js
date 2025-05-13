const express = require('express');
const router = express.Router();
const performanceController = require('../controllers/performanceController');
const { auth, authorize } = require('../middleware/auth');

// @route   POST api/performance
// @desc    Create a new performance review
// @access  Private (Admin/Manager)
router.post('/', auth, authorize('admin', 'manager'), performanceController.createPerformanceReview);

// @route   GET api/performance/me
// @desc    Get performance reviews for current user
// @access  Private
router.get('/me', auth, performanceController.getUserPerformanceReviews);

// @route   GET api/performance/reviewer
// @desc    Get reviews created by current user (as reviewer)
// @access  Private
router.get('/reviewer', auth, performanceController.getReviewsByReviewer);

// @route   GET api/performance/:id
// @desc    Get performance review by ID
// @access  Private (Admin/Manager, reviewer or reviewee)
router.get('/:id', auth, performanceController.getPerformanceReviewById);

// @route   GET api/performance
// @desc    Get all performance reviews
// @access  Private (Admin/Manager)
router.get('/', auth, authorize('admin', 'manager'), performanceController.getAllPerformanceReviews);

// @route   PUT api/performance/:id
// @desc    Update performance review
// @access  Private (Admin or reviewer)
router.put('/:id', auth, performanceController.updatePerformanceReview);

// @route   PUT api/performance/:id/acknowledge
// @desc    Acknowledge performance review
// @access  Private (reviewee only)
router.put('/:id/acknowledge', auth, performanceController.acknowledgePerformanceReview);

// @route   DELETE api/performance/:id
// @desc    Delete performance review
// @access  Private (only if in draft status and by reviewer)
router.delete('/:id', auth, performanceController.deletePerformanceReview);

module.exports = router;
