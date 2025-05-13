const express = require('express');
const router = express.Router();
const changelogController = require('../controllers/changelogController');
const { auth, authorize } = require('../middleware/auth');

// @route   POST api/changelog
// @desc    Create a new changelog entry
// @access  Private (Admin/Manager)
router.post('/', auth, authorize('admin', 'manager'), changelogController.createChangelog);

// @route   GET api/changelog/:id
// @desc    Get changelog entry by ID
// @access  Private
router.get('/:id', auth, changelogController.getChangelogById);

// @route   GET api/changelog
// @desc    Get all changelog entries
// @access  Private
router.get('/', auth, changelogController.getAllChangelogs);

// @route   DELETE api/changelog/:id
// @desc    Delete changelog entry
// @access  Private (Admin only)
router.delete('/:id', auth, authorize('admin'), changelogController.deleteChangelog);

module.exports = router;
