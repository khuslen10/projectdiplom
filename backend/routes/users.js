const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const userController = require('../controllers/userController');
const { auth, authorize } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function(req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Зөвхөн зураг оруулах боломжтой!'));
    }
  }
});

// @route   GET api/users
// @desc    Get all users
// @access  Private (Admin/Manager)
router.get('/', auth, authorize('admin', 'manager'), userController.getAllUsers);

// @route   GET api/users/role/:role
// @desc    Get users by role
// @access  Private (Admin/Manager)
router.get('/role/:role', auth, authorize('admin', 'manager'), userController.getUsersByRole);

// @route   GET api/users/:id
// @desc    Get user by ID
// @access  Private (Admin/Manager or self)
router.get('/:id', auth, userController.getUserById);

// @route   POST api/users
// @desc    Create a new user
// @access  Private (Admin only)
router.post('/', auth, authorize('admin'), userController.createUser);

// @route   PUT api/users/:id
// @desc    Update user
// @access  Private (Admin or self)
router.put('/:id', auth, userController.updateUser);

// @route   DELETE api/users/:id
// @desc    Delete user
// @access  Private (Admin only)
router.delete('/:id', auth, authorize('admin'), userController.deleteUser);

// @route   POST api/users/profile-picture
// @desc    Upload profile picture
// @access  Private
router.post('/profile-picture', auth, upload.single('profilePicture'), userController.uploadProfilePicture);

module.exports = router;
