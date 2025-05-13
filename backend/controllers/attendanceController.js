const Attendance = require('../models/Attendance');
const Changelog = require('../models/Changelog');
require('dotenv').config();

// Хоёр цэгийн хоорондох зайг Хаверсины томьёогоор тооцоолох
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Дэлхийн радиус км-ээр
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c * 1000; // Зай метрээр
  return distance;
};

// Ирц бүртгэх
exports.checkIn = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const userId = req.user.id;
    
    // Өнөөдөр аль хэдийн ирц бүртгүүлсэн эсэхийг шалгах
    const todayAttendance = await Attendance.getTodayByUserId(userId);
    const notCheckedOut = todayAttendance.find(a => !a.check_out);
    
    if (notCheckedOut) {
      return res.status(400).json({ 
        message: 'Та өнөөдөр аль хэдийн ирцээ бүртгүүлсэн байна. Эхлээд гарах бүртгэл хийнэ үү' 
      });
    }
    
    // Байршлыг баталгаажуулах
    const officeLat = parseFloat(process.env.OFFICE_LAT);
    const officeLng = parseFloat(process.env.OFFICE_LNG);
    const allowedRadius = parseFloat(process.env.ALLOWED_RADIUS);
    
    const distance = calculateDistance(latitude, longitude, officeLat, officeLng);
    
    if (distance > allowedRadius) {
      return res.status(400).json({ 
        message: `Та оффисын байршлаас хэт хол байна (${Math.round(distance)}м). Зөвшөөрөгдөх зай: ${allowedRadius}м`,
        distance: Math.round(distance),
        allowedRadius
      });
    }
    
    const locationString = `${latitude},${longitude}`;
    const attendanceId = await Attendance.checkIn(userId, locationString);
    
    // Өөрчлөлтийн түүхэнд бүртгэх
    await Changelog.create({
      title: 'Ирц бүртгэл',
      description: `${req.user.name} ирц бүртгүүллээ`,
      type: 'update',
      created_by: userId
    });
    
    res.status(201).json({
      message: 'Ирцийн бүртгэл амжилттай хийгдлээ',
      attendanceId,
      checkInTime: new Date()
    });
  } catch (error) {
    console.error('Ирцийн бүртгэлийн алдаа:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};

// Гарах бүртгэл
exports.checkOut = async (req, res) => {
  try {
    const { latitude, longitude, attendanceId } = req.body;
    const userId = req.user.id;
    
    // Байршлыг баталгаажуулах
    const officeLat = parseFloat(process.env.OFFICE_LAT);
    const officeLng = parseFloat(process.env.OFFICE_LNG);
    const allowedRadius = parseFloat(process.env.ALLOWED_RADIUS);
    
    const distance = calculateDistance(latitude, longitude, officeLat, officeLng);
    
    if (distance > allowedRadius) {
      return res.status(400).json({ 
        message: `Та оффисын байршлаас хэт хол байна (${Math.round(distance)}м). Зөвшөөрөгдөх зай: ${allowedRadius}м`,
        distance: Math.round(distance),
        allowedRadius
      });
    }
    
    // Гарах бүртгэл хийх
    const locationString = `${latitude},${longitude}`;
    const updated = await Attendance.checkOut(attendanceId, userId, locationString);
    
    if (!updated) {
      return res.status(400).json({ message: 'Гарах бүртгэл хийгдсэнгүй. Ирц бүртгэл олдсонгүй эсвэл аль хэдийн гарсан байна' });
    }
    
    // Өөрчлөлтийн түүхэнд бүртгэх
    await Changelog.create({
      title: 'Гарах бүртгэл',
      description: `${req.user.name} гарах бүртгэл хийлээ`,
      type: 'update',
      created_by: userId
    });
    
    res.json({
      message: 'Гарах бүртгэл амжилттай хийгдлээ',
      checkOutTime: new Date()
    });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};

// Одоогийн хэрэглэгчийн хамгийн сүүлийн ирцийг авах
exports.getLatestAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const attendance = await Attendance.getLatestByUserId(userId);
    res.json(attendance || {});
  } catch (error) {
    console.error('Get latest attendance error:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};

// Одоогийн хэрэглэгчийн ирцийн түүхийг авах
exports.getUserAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;
    const attendance = await Attendance.getByUserId(userId, startDate, endDate);
    res.json(attendance);
  } catch (error) {
    console.error('Get user attendance error:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};

// Тодорхой хэрэглэгчийн ирцийг авах (Зөвхөн Админ/Менежер)
exports.getAttendanceByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;
    const attendance = await Attendance.getByUserId(userId, startDate, endDate);
    res.json(attendance);
  } catch (error) {
    console.error('Get attendance by user id error:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};

// Бүх ирцийн бүртгэлийг авах (Зөвхөн Админ/Менежер)
exports.getAllAttendance = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const attendance = await Attendance.getAll(startDate, endDate);
    res.json(attendance);
  } catch (error) {
    console.error('Get all attendance error:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};

// Ирцийн төлөвийг шинэчлэх (Зөвхөн Админ/Менежер)
exports.updateAttendanceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    const updated = await Attendance.updateStatus(id, status, notes);
    
    if (!updated) {
      return res.status(400).json({ message: 'Ирцийн мэдээлэл шинэчлэгдсэнгүй' });
    }
    
    // Өөрчлөлтийн түүхэнд бүртгэх
    await Changelog.create({
      title: 'Ирцийн мэдээлэл шинэчлэгдсэн',
      description: `Ирцийн бүртгэл #${id} шинэчлэгдлээ - Төлөв: ${status}`,
      type: 'update',
      created_by: req.user.id
    });
    
    res.json({ message: 'Ирцийн мэдээлэл амжилттай шинэчлэгдлээ' });
  } catch (error) {
    console.error('Update attendance status error:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};

// Оффисын байршлын тохиргоог авах
exports.getOfficeLocation = async (req, res) => {
  try {
    res.json({
      latitude: parseFloat(process.env.OFFICE_LAT),
      longitude: parseFloat(process.env.OFFICE_LNG),
      allowedRadius: parseFloat(process.env.ALLOWED_RADIUS)
    });
  } catch (error) {
    console.error('Get office location error:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};

// Оффисын байршлын тохиргоог шинэчлэх (Зөвхөн Админ)
exports.updateOfficeLocation = async (req, res) => {
  try {
    const { latitude, longitude, allowedRadius } = req.body;
    
    // .env файлыг шинэчлэх функц
    const fs = require('fs');
    const path = require('path');
    const envPath = path.resolve(__dirname, '../.env');
    
    // .env файлын агуулгыг унших
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Байршлын тохиргоог шинэчлэх
    envContent = envContent.replace(/OFFICE_LAT=.*/g, `OFFICE_LAT=${latitude}`);
    envContent = envContent.replace(/OFFICE_LNG=.*/g, `OFFICE_LNG=${longitude}`);
    envContent = envContent.replace(/ALLOWED_RADIUS=.*/g, `ALLOWED_RADIUS=${allowedRadius}`);
    
    // Шинэчилсэн агуулгыг бичих
    fs.writeFileSync(envPath, envContent);
    
    // process.env-д шинэчлэх
    process.env.OFFICE_LAT = latitude.toString();
    process.env.OFFICE_LNG = longitude.toString();
    process.env.ALLOWED_RADIUS = allowedRadius.toString();
    
    // Өөрчлөлтийн түүхэнд бүртгэх
    await Changelog.create({
      title: 'Оффисын байршил шинэчлэгдсэн',
      description: `Оффисын байршил шинэчлэгдлээ: ${latitude}, ${longitude} (${allowedRadius}м радиус)`,
      type: 'update',
      created_by: req.user.id
    });
    
    res.json({ 
      message: 'Оффисын байршил амжилттай шинэчлэгдлээ',
      latitude,
      longitude,
      allowedRadius
    });
  } catch (error) {
    console.error('Update office location error:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};

// Ирцийн бүртгэлийг устгах (Зөвхөн Админ)
exports.deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Ирцийн бүртгэлийг устгах
    const deleted = await Attendance.delete(id);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Ирцийн бүртгэл олдсонгүй' });
    }
    
    // Өөрчлөлтийн түүхэнд бүртгэх
    await Changelog.create({
      title: 'Ирцийн бүртгэл устгагдсан',
      description: `Ирцийн бүртгэл #${id} устгагдлаа`,
      type: 'delete',
      created_by: req.user.id
    });
    
    res.json({ message: 'Ирцийн бүртгэл амжилттай устгагдлаа' });
  } catch (error) {
    console.error('Delete attendance error:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};
