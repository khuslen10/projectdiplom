const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { auth, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage for profile images
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)){
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    // Create unique filename with timestamp and original extension
    const ext = path.extname(file.originalname);
    cb(null, `profile-${Date.now()}-${Math.round(Math.random() * 1000000000)}${ext}`);
  }
});

// Filter allowed file types
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

// Configure upload middleware
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

// @route   GET api/profile/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', auth, profileController.getProfile);

// @route   GET api/profile/:userId
// @desc    Get profile by user ID
// @access  Private (Admin/Manager)
router.get('/:userId', auth, authorize('admin', 'manager'), profileController.getProfile);

// @route   PUT api/profile/me
// @desc    Update current user's profile
// @access  Private
router.put('/me', auth, profileController.updateProfile);

// @route   PUT api/profile/:userId
// @desc    Update profile by user ID
// @access  Private (Admin only)
router.put('/:userId', auth, authorize('admin'), profileController.updateProfile);

// @route   POST api/profile/me/image
// @desc    Upload profile image for current user
// @access  Private
router.post('/me/image', auth, upload.single('image'), profileController.uploadProfileImage);

// @route   POST api/profile/:userId/image
// @desc    Upload profile image for a user
// @access  Private (Admin only)
router.post('/:userId/image', auth, authorize('admin'), upload.single('image'), profileController.uploadProfileImage);

// @route   DELETE api/profile/:userId
// @desc    Delete profile
// @access  Private (Admin only)
router.delete('/:userId', auth, authorize('admin'), profileController.deleteProfile);

module.exports = router;
