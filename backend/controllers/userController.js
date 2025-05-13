const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Changelog = require('../models/Changelog');

// Бүх хэрэглэгчдийг авах
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.getAll();
    res.json(users);
  } catch (error) {
    console.error('Бүх хэрэглэгчдийг авахад алдаа гарлаа:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};

// Эрхээр хэрэглэгчдийг авах
exports.getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const users = await User.getByRole(role);
    res.json(users);
  } catch (error) {
    console.error('Эрхээр хэрэглэгчдийг авахад алдаа гарлаа:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};

// ID-гаар хэрэглэгчийг авах
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: 'Хэрэглэгч олдсонгүй' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('ID-гаар хэрэглэгчийг авахад алдаа гарлаа:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};

// Шинэ хэрэглэгч үүсгэх (Зөвхөн Админ)
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, position, department, phone, hire_date } = req.body;

    // Хэрэглэгч аль хэдийн бүртгэгдсэн эсэхийг шалгах
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Энэ имэйл хаяг бүртгэлтэй байна' });
    }

    // Нууц үгийг хашлах
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Хэрэглэгч үүсгэх
    const userId = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      position,
      department,
      phone,
      hire_date
    });

    // Өөрчлөлтийн түүхэнд бүртгэх
    await Changelog.create({
      title: 'Шинэ хэрэглэгч үүсгэсэн',
      description: `Админ ${req.user.name} нь ${name} нэртэй ${role} эрхтэй хэрэглэгч үүсгэлээ`,
      type: 'feature',
      created_by: req.user.id
    });

    res.status(201).json({
      message: 'Хэрэглэгч амжилттай үүсгэгдлээ',
      userId
    });
  } catch (error) {
    console.error('Хэрэглэгч үүсгэхэд алдаа гарлаа:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('ID-тай хэрэглэгчийг шинэчлэх хүсэлт:', id);
    console.log('Хүсэлтийн өгөгдөл:', req.body);
    
    const { name, email, role, position, department, phone, hire_date, profile_picture } = req.body;

    const user = await User.findById(id);
    if (!user) {
      console.log(`${id} ID-тай хэрэглэгч олдсонгүй`);
      return res.status(404).json({ message: 'Хэрэглэгч олдсонгүй' });
    }
    console.log('Хэрэглэгч олдлоо:', user);

    // Хэрэв имэйл өөрчлөгдөж байгаа бол шинэ имэйл ашиглагдаж байгаа эсэхийг шалгах
    if (email && email !== user.email) {
      const existingUser = await User.findByEmail(email);
      if (existingUser && existingUser.id !== parseInt(id)) {
        console.log(`${email} имэйл хаягийг өөр хэрэглэгч ашиглаж байна`);
        return res.status(400).json({ message: 'Энэ имэйл хаяг бүртгэлтэй байна' });
      }
    }
    
    // Одоогийн утгуудыг нөөц болгон шинэчлэх өгөгдлийг бэлтгэх
    const updateData = {
      name: name || user.name,
      email: email || user.email,
      role: role || user.role,
      position: position !== undefined ? position : user.position,
      department: department !== undefined ? department : user.department,
      phone: phone !== undefined ? phone : user.phone,
      hire_date: hire_date !== undefined ? hire_date : user.hire_date
    };
    
    // Only update profile_picture if it's provided
    if (profile_picture) {
      updateData.profile_picture = profile_picture;
    }
    
    console.log('Prepared update data:', updateData);

    // Update user
    try {
      const updated = await User.update(id, updateData);
      console.log('Update result:', updated);
      
      if (!updated) {
        console.log('User update failed - no rows affected');
        return res.status(400).json({ message: 'Хэрэглэгчийн мэдээлэл шинэчлэгдсэнгүй' });
      }
    } catch (updateError) {
      console.error('Error during database update:', updateError);
      return res.status(500).json({ message: 'Өгөгдлийн санд шинэчлэхэд алдаа гарлаа', error: updateError.message });
    }

    // Өөрчлөлтийн түүхэнд бүртгэх
    try {
      await Changelog.create({
        title: 'Хэрэглэгчийн мэдээлэл шинэчлэгдсэн',
        description: `${updateData.name} хэрэглэгчийн мэдээлэл шинэчлэгдлээ`,
        type: 'update',
        created_by: req.user.id
      });
      console.log('Changelog entry created successfully');
    } catch (changelogError) {
      // Don't fail the request if changelog creation fails
      console.error('Error creating changelog entry:', changelogError);
    }

    console.log('User updated successfully');
    res.json({ message: 'Хэрэглэгчийн мэдээлэл амжилттай шинэчлэгдлээ' });
  } catch (error) {
    console.error('Хэрэглэгчийг шинэчлэхэд алдаа гарлаа:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};

// Хэрэглэгчийг устгах (Зөвхөн Админ)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Хэрэглэгч олдсонгүй' });
    }
    
    // Өөрийгөө устгахаас сэргийлэх
    if (id === req.user.id.toString()) {
      return res.status(400).json({ message: 'Өөрийгөө устгах боломжгүй' });
    }
    
    // Хэрэглэгчийг устгах
    const deleted = await User.delete(id);
    
    if (!deleted) {
      return res.status(400).json({ message: 'Хэрэглэгч устгагдсангүй' });
    }
    
    // Өөрчлөлтийн түүхэнд бүртгэх
    await Changelog.create({
      title: 'Хэрэглэгч устгагдсан',
      description: `${user.name} хэрэглэгч системээс устгагдлаа`,
      type: 'update',
      created_by: req.user.id
    });
    
    res.json({ message: 'Хэрэглэгч амжилттай устгагдлаа' });
  } catch (error) {
    console.error('Хэрэглэгчийг устгахад алдаа гарлаа:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};

// Профайл зураг байршуулах
exports.uploadProfilePicture = async (req, res) => {
  try {
    console.log('Профайл зураг байршуулах хүсэлт хүлээн авлаа:', req.file);
    
    if (!req.file) {
      return res.status(400).json({ message: 'Зураг оруулаагүй байна' });
    }
    
    const userId = req.user.id;
    const profilePicture = req.file.filename;
    
    console.log(`${userId} ID-тай хэрэглэгчийн профайл зургийг боловсруулж байна: ${profilePicture}`);
    
    // Хэрэглэгчийн одоогийн профайл зургийг байгаа бол авах
    const user = await User.findById(userId);
    if (!user) {
      // Байршуулсан файлыг цэвэрлэх
      try {
        fs.unlinkSync(path.join(__dirname, '..', 'uploads', profilePicture));
      } catch (cleanupErr) {
        console.error('Хэрэглэгч олдоогүй болоход файлыг цэвэрлэхэд алдаа гарлаа:', cleanupErr);
      }
      return res.status(404).json({ message: 'Хэрэглэгч олдсонгүй' });
    }
    
    const oldProfilePicture = user.profile_picture;
    console.log('Хуучин профайл зураг:', oldProfilePicture);
    
    // Өгөгдлийн санд хэрэглэгчийн профайл зургийг шинэчлэх
    const updated = await User.updateProfilePicture(userId, profilePicture);
    
    if (!updated) {
      // Хэрэв шинэчлэлт амжилтгүй болвол байршуулсан файлыг устгах
      try {
        fs.unlinkSync(path.join(__dirname, '..', 'uploads', profilePicture));
      } catch (unlinkErr) {
        console.error('Шинэчлэлт амжилтгүй болсны дараа файл устгахад алдаа гарлаа:', unlinkErr);
      }
      return res.status(400).json({ message: 'Профайл зураг шинэчлэгдсэнгүй' });
    }
    
    // Хуучин профайл зургийг байгаа бол устгах
    if (oldProfilePicture) {
      const oldPicturePath = path.join(__dirname, '..', 'uploads', oldProfilePicture);
      console.log('Хуучин профайл зургийг устгахыг оролдож байна:', oldPicturePath);
      
      try {
        if (fs.existsSync(oldPicturePath)) {
          fs.unlinkSync(oldPicturePath);
          console.log('Хуучин профайл зураг амжилттай устгагдлаа');
        } else {
          console.log('Хуучин профайл зургийн файл олдсонгүй');
        }
      } catch (deleteErr) {
        console.error('Хуучин профайл зургийг устгахад алдаа гарлаа:', deleteErr);
        // Хуучин файл устгахад алдаа гарсан ч үргэлжлүүлэх
      }
    }
    
    // Өөрчлөлтийн түүхэнд бүртгэх
    await Changelog.create({
      title: 'Профайл зураг шинэчлэгдсэн',
      description: `${user.name} хэрэглэгч профайл зургаа шинэчиллээ`,
      type: 'update',
      created_by: userId
    });
    
    console.log('Профайл зураг амжилттай шинэчлэгдлээ');
    
    res.json({ 
      message: 'Профайл зураг амжилттай шинэчлэгдлээ',
      profilePicture
    });
  } catch (error) {
    console.error('Профайл зураг байршуулахад алдаа гарлаа:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};
