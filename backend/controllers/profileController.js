const fs = require('fs');
const path = require('path');
const Profile = require('../models/Profile');
const User = require('../models/User');
const Changelog = require('../models/Changelog');

// Get profile by user ID
exports.getProfile = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    console.log('Getting profile for user ID:', userId);
    
    // Get profile from database
    console.log('Getting profile from database for user ID:', userId);
    const profile = await Profile.findByUserId(userId);
    console.log('Database query result:', profile ? [profile] : []);
    
    if (!profile) {
      return res.status(404).json({ message: 'Профайл олдсонгүй' });
    }
    
    console.log('Profile found:', profile);
    res.json(profile);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const { first_name, last_name, phone, address } = req.body;
    
    // Check if profile exists
    let profile = await Profile.findByUserId(userId);
    
    if (profile) {
      // Update existing profile
      const updated = await Profile.update(userId, {
        first_name,
        last_name,
        phone,
        address
      });
      
      if (!updated) {
        return res.status(400).json({ message: 'Профайл шинэчлэгдсэнгүй' });
      }
    } else {
      // Create new profile
      await Profile.create({
        user_id: userId,
        first_name,
        last_name,
        phone,
        address
      });
    }
    
    // Get updated profile
    profile = await Profile.findByUserId(userId);
    
    // Update changelog
    await Changelog.create({
      title: 'Профайл шинэчлэгдсэн',
      description: `Хэрэглэгч профайлын мэдээллээ шинэчиллээ`,
      type: 'update',
      created_by: req.user.id
    });
    
    res.json({
      message: 'Профайл амжилттай шинэчлэгдлээ',
      profile
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};

// Upload profile image
exports.uploadProfileImage = async (req, res) => {
  try {
    console.log('Profile image upload request received:', req.file);
    
    if (!req.file) {
      return res.status(400).json({ message: 'Зураг оруулаагүй байна' });
    }
    
    const userId = req.params.userId || req.user.id;
    const imagePath = req.file.filename;
    
    console.log(`Processing profile image for user ${userId}: ${imagePath}`);
    
    // Get current profile to check for existing image
    const profile = await Profile.findByUserId(userId);
    const oldImagePath = profile ? profile.image_path : null;
    console.log('Old profile image:', oldImagePath);
    
    // Update profile image in database
    const updated = await Profile.updateImage(userId, imagePath);
    
    if (!updated) {
      // If update fails, remove uploaded file
      try {
        fs.unlinkSync(path.join(__dirname, '..', 'uploads', imagePath));
      } catch (unlinkErr) {
        console.error('Failed to clean up file after failed update:', unlinkErr);
      }
      return res.status(400).json({ message: 'Профайл зураг шинэчлэгдсэнгүй' });
    }
    
    // Also update the user's profile_picture field to match profile.image_path
    try {
      const userUpdated = await User.update(userId, { profile_picture: imagePath });
      console.log('User profile_picture updated:', userUpdated);
    } catch (userUpdateErr) {
      console.error('Error updating user profile_picture:', userUpdateErr);
      // Continue even if user update fails
    }
    
    // Delete old image file if it exists
    if (oldImagePath) {
      const oldImageFullPath = path.join(__dirname, '..', 'uploads', oldImagePath);
      console.log('Trying to delete old image file:', oldImageFullPath);
      
      try {
        if (fs.existsSync(oldImageFullPath)) {
          fs.unlinkSync(oldImageFullPath);
          console.log('Old profile image deleted successfully');
        } else {
          console.log('Old profile image file not found');
        }
      } catch (deleteErr) {
        console.error('Error deleting old profile image:', deleteErr);
        // Continue even if old file deletion fails
      }
    }
    
    // Update changelog
    await Changelog.create({
      title: 'Профайл зураг шинэчлэгдсэн',
      description: `Хэрэглэгч профайл зургаа шинэчиллээ`,
      type: 'update',
      created_by: req.user.id
    });
    
    console.log('Profile image updated successfully');
    
    res.json({ 
      message: 'Профайл зураг амжилттай шинэчлэгдлээ',
      imagePath
    });
  } catch (error) {
    console.error('Profile image upload error:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};

// Delete profile
exports.deleteProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Хэрэглэгч олдсонгүй' });
    }
    
    // Check if profile exists
    const profile = await Profile.findByUserId(userId);
    if (!profile) {
      return res.status(404).json({ message: 'Профайл олдсонгүй' });
    }
    
    // Delete profile image if exists
    if (profile.image_path) {
      const imagePath = path.join(__dirname, '..', 'uploads', profile.image_path);
      
      try {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      } catch (unlinkErr) {
        console.error('Error deleting profile image:', unlinkErr);
      }
    }
    
    // Delete profile from database
    const deleted = await Profile.delete(userId);
    
    if (!deleted) {
      return res.status(400).json({ message: 'Профайл устгагдсангүй' });
    }
    
    // Update changelog
    await Changelog.create({
      title: 'Профайл устгагдсан',
      description: `${user.name} хэрэглэгчийн профайл устгагдлаа`,
      type: 'delete',
      created_by: req.user.id
    });
    
    res.json({ message: 'Профайл амжилттай устгагдлаа' });
  } catch (error) {
    console.error('Delete profile error:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};
