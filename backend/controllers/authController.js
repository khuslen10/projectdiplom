const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Changelog = require('../models/Changelog');
require('dotenv').config();

// Шинэ хэрэглэгч бүртгэх
exports.register = async (req, res) => {
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
      title: 'Шинэ хэрэглэгч бүртгэгдлээ',
      description: `${name} нэртэй ${role} эрхтэй хэрэглэгч бүртгэгдлээ`,
      type: 'feature',
      created_by: req.user ? req.user.id : null
    });

    // Амжилттай болсныг буцаах
    res.status(201).json({
      message: 'Хэрэглэгч амжилттай бүртгэгдлээ',
      userId
    });
  } catch (error) {
    console.error('Бүртгэлийн алдаа:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};

// Хэрэглэгч нэвтрэх
exports.login = async (req, res) => {
  try {
    console.log('Нэвтрэх хүсэлтийн өгөгдөл:', req.body);
    const { email, password } = req.body;
    console.log('Нэвтрэх оролдлого:', { email });

    if (!email || !password) {
      console.log('Хүсэлтэнд имэйл эсвэл нууц үг байхгүй байна');
      return res.status(400).json({ message: 'Имэйл хаяг болон нууц үг оруулна уу' });
    }

    // Хэрэглэгч байгаа эсэхийг шалгах
    const user = await User.findByEmail(email);
    console.log('Хэрэглэгч олдсон:', user ? 'Тийм' : 'Үгүй');
    if (!user) {
      console.log('Энэ имэйлтэй хэрэглэгч олдсонгүй:', email);
      return res.status(400).json({ message: 'Буруу мэдээлэл оруулсан байна' });
    }

    // Нууц үгийг шалгах
    console.log('Хэрэглэгчийн нууц үгийг шалгаж байна:', email);
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Нууц үг таарч байна:', isMatch ? 'Тийм' : 'Үгүй');
    if (!isMatch) {
      console.log('Хэрэглэгчийн нууц үг таарсангүй:', email);
      return res.status(400).json({ message: 'Буруу мэдээлэл оруулсан байна' });
    }

    // JWT токен үүсгэх
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      message: 'Амжилттай нэвтэрлээ',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        position: user.position,
        department: user.department
      }
    });
  } catch (error) {
    console.error('Нэвтрэх алдаа:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};

// Одоогийн хэрэглэгчийг авах
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Хэрэглэгч олдсонгүй' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      position: user.position,
      department: user.department,
      phone: user.phone,
      hire_date: user.hire_date
    });
  } catch (error) {
    console.error('Одоогийн хэрэглэгчийг авахад алдаа гарлаа:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};

// Нууц үг солих
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Нууц үгтэй хэрэглэгчийг авах
    const user = await User.findByEmail(req.user.email);
    
    // Одоогийн нууц үгийг шалгах
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Одоогийн нууц үг буруу байна' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Нууц үгийг шинэчлэх
    await User.updatePassword(req.user.id, hashedPassword);
    
    res.json({ message: 'Нууц үг амжилттай шинэчлэгдлээ' });
  } catch (error) {
    console.error('Нууц үг солиход алдаа гарлаа:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};
