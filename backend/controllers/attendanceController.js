const Attendance = require('../models/Attendance');
const Changelog = require('../models/Changelog');
const db = require('../config/db'); // Assuming your db connection is exported from here
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
    const { latitude, longitude, isRemote } = req.body;
    const userId = req.user.id;
    
    // Өнөөдөр аль хэдийн ирц бүртгүүлсэн эсэхийг шалгах
    const todayAttendance = await Attendance.getTodayByUserId(userId);
    const notCheckedOut = todayAttendance.find(a => !a.check_out);
    
    if (notCheckedOut) {
      return res.status(400).json({ 
        message: 'Та өнөөдөр аль хэдийн ирцээ бүртгүүлсэн байна. Эхлээд гарах бүртгэл хийнэ үү' 
      });
    }
    
    // Is this a remote check-in?
    const isRemoteCheckIn = isRemote === true || isRemote === 'true';
    
    // For in-office check-ins, verify location
    if (!isRemoteCheckIn) {
      // Байршлыг баталгаажуулах
      const officeLat = parseFloat(process.env.OFFICE_LAT);
      const officeLng = parseFloat(process.env.OFFICE_LNG);
      const allowedRadius = parseFloat(process.env.ALLOWED_RADIUS);
      
      const distance = calculateDistance(latitude, longitude, officeLat, officeLng);
      
      if (distance > allowedRadius) {
        return res.status(400).json({ 
          message: `Та оффисын байршлаас хэт хол байна (${Math.round(distance)}м). Зөвшөөрөгдөх зай: ${allowedRadius}м. Хэрэв та зайнаас ажиллаж байгаа бол "Зайнаас ирц бүртгэх" сонголтыг идэвхжүүлнэ үү.`,
          distance: Math.round(distance),
          allowedRadius
        });
      }
    }
    
    const locationString = `${latitude},${longitude}`;
    const attendanceId = await Attendance.checkIn(userId, locationString, isRemoteCheckIn);
    
    // Өөрчлөлтийн түүхэнд бүртгэх
    await Changelog.create({
      title: isRemoteCheckIn ? 'Зайнаас ирц бүртгэл' : 'Ирц бүртгэл',
      description: `${req.user.name} ${isRemoteCheckIn ? 'зайнаас' : ''} ирц бүртгүүллээ`,
      type: 'update',
      created_by: userId
    });
    
    const message = isRemoteCheckIn 
      ? 'Зайнаас ирц бүртгэл амжилттай хийгдлээ. Менежерийн зөвшөөрөл хүлээгдэж байна.'
      : 'Ирцийн бүртгэл амжилттай хийгдлээ';
    
    res.status(201).json({
      message,
      attendanceId,
      checkInTime: new Date(),
      requiresApproval: isRemoteCheckIn
    });
  } catch (error) {
    console.error('Ирцийн бүртгэлийн алдаа:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};

// Гарах бүртгэл
exports.checkOut = async (req, res) => {
  try {
    const { latitude, longitude, attendanceId, isRemote } = req.body;
    const userId = req.user.id;
    
    // Is this a remote check-out?
    const isRemoteCheckOut = isRemote === true || isRemote === 'true';
    
    // For in-office check-outs, verify location
    if (!isRemoteCheckOut) {
      // Байршлыг баталгаажуулах
      const officeLat = parseFloat(process.env.OFFICE_LAT);
      const officeLng = parseFloat(process.env.OFFICE_LNG);
      const allowedRadius = parseFloat(process.env.ALLOWED_RADIUS);
      
      const distance = calculateDistance(latitude, longitude, officeLat, officeLng);
      
      if (distance > allowedRadius) {
        return res.status(400).json({ 
          message: `Та оффисын байршлаас хэт хол байна (${Math.round(distance)}м). Зөвшөөрөгдөх зай: ${allowedRadius}м. Хэрэв та зайнаас ажиллаж байгаа бол "Зайнаас гарах бүртгэл" сонголтыг идэвхжүүлнэ үү.`,
          distance: Math.round(distance),
          allowedRadius
        });
      }
    }
    
    // Гарах бүртгэл хийх
    const locationString = `${latitude},${longitude}`;
    const updated = await Attendance.checkOut(attendanceId, userId, locationString, isRemoteCheckOut);
    
    if (!updated) {
      return res.status(400).json({ message: 'Гарах бүртгэл хийгдсэнгүй. Ирц бүртгэл олдсонгүй эсвэл аль хэдийн гарсан байна' });
    }
    
    // Өөрчлөлтийн түүхэнд бүртгэх
    await Changelog.create({
      title: isRemoteCheckOut ? 'Зайнаас гарах бүртгэл' : 'Гарах бүртгэл',
      description: `${req.user.name} ${isRemoteCheckOut ? 'зайнаас' : ''} гарах бүртгэл хийлээ`,
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

// Get pending approval attendance records (Manager/Admin only)
exports.getPendingApprovals = async (req, res) => {
  try {
    const pendingApprovals = await Attendance.getPendingApprovals();
    res.json(pendingApprovals);
  } catch (error) {
    console.error('Get pending approvals error:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};

// Approve or reject an attendance record (Manager/Admin only)
exports.approveAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, notes } = req.body;
    const managerId = req.user.id;
    
    if (!['approved', 'rejected'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Must be "approved" or "rejected"' });
    }
    
    const updated = await Attendance.updateApprovalStatus(id, action, managerId);
    
    if (!updated) {
      return res.status(400).json({ message: 'Ирцийн мэдээлэл шинэчлэгдсэнгүй' });
    }
    
    // Add notes if provided
    if (notes) {
      await Attendance.updateStatus(id, action === 'approved' ? 'present' : 'absent', notes);
    }
    
    // Өөрчлөлтийн түүхэнд бүртгэх
    await Changelog.create({
      title: `Ирцийн ${action === 'approved' ? 'зөвшөөрөл' : 'татгалзал'}`,
      description: `${req.user.name} ирцийн бүртгэл #${id}-г ${action === 'approved' ? 'зөвшөөрсөн' : 'татгалзсан'}`,
      type: 'update',
      created_by: managerId
    });
    
    res.json({ 
      message: `Ирцийн бүртгэл амжилттай ${action === 'approved' ? 'зөвшөөрөгдлөө' : 'татгалзагдлаа'}` 
    });
  } catch (error) {
    console.error('Approve attendance error:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};

// Get all pending approvals for the current user
exports.getUserPendingApprovals = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query(
      `SELECT * FROM attendance 
       WHERE user_id = ? AND approval_status = 'pending'
       ORDER BY check_in DESC`,
      [userId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Get user pending approvals error:', error);
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
    // Validate the input data
    const { latitude, longitude, allowedRadius } = req.body;
    
    if (latitude === undefined || longitude === undefined || allowedRadius === undefined) {
      return res.status(400).json({ 
        message: 'Бүх шаардлагатай мэдээллийг оруулна уу' 
      });
    }

    // Ensure all values are numeric
    const numLatitude = Number(latitude);
    const numLongitude = Number(longitude);
    const numAllowedRadius = Number(allowedRadius);

    if (isNaN(numLatitude) || isNaN(numLongitude) || isNaN(numAllowedRadius)) {
      return res.status(400).json({ 
        message: 'Тоон утга шаардана' 
      });
    }

    if (numAllowedRadius <= 0) {
      return res.status(400).json({ 
        message: 'Зөвшөөрөгдөх радиус нь 0-ээс их байх ёстой'        
      });
    }
    
    try {
      // .env файлыг шинэчлэх функц
      const fs = require('fs');
      const path = require('path');
      const envPath = path.resolve(__dirname, '../.env');
      
      // Check if .env file exists
      if (!fs.existsSync(envPath)) {
        console.error('.env file not found at path:', envPath);
        return res.status(500).json({ 
          message: 'Серверийн тохиргооны файл олдсонгүй' 
        });
      }
      
      // .env файлын агуулгыг унших
      let envContent = fs.readFileSync(envPath, 'utf8');
      
      // Check if env variables exist, add them if they don't
      if (!envContent.includes('OFFICE_LAT=')) {
        envContent += `\nOFFICE_LAT=${numLatitude}`;
      } else {
        envContent = envContent.replace(/OFFICE_LAT=.*/g, `OFFICE_LAT=${numLatitude}`);
      }
      
      if (!envContent.includes('OFFICE_LNG=')) {
        envContent += `\nOFFICE_LNG=${numLongitude}`;
      } else {
        envContent = envContent.replace(/OFFICE_LNG=.*/g, `OFFICE_LNG=${numLongitude}`);
      }
      
      if (!envContent.includes('ALLOWED_RADIUS=')) {
        envContent += `\nALLOWED_RADIUS=${numAllowedRadius}`;
      } else {
        envContent = envContent.replace(/ALLOWED_RADIUS=.*/g, `ALLOWED_RADIUS=${numAllowedRadius}`);
      }
      
      // Шинэчилсэн агуулгыг бичих
      fs.writeFileSync(envPath, envContent);
      
      // process.env-д шинэчлэх
      process.env.OFFICE_LAT = numLatitude.toString();
      process.env.OFFICE_LNG = numLongitude.toString();
      process.env.ALLOWED_RADIUS = numAllowedRadius.toString();
      
      // Өөрчлөлтийн түүхэнд бүртгэх
      await Changelog.create({
        title: 'Оффисын байршил шинэчлэгдсэн',
        description: `Оффисын байршил шинэчлэгдлээ: ${numLatitude}, ${numLongitude} (${numAllowedRadius}м радиус)`,
        type: 'update',
        created_by: req.user.id
      });
      
      return res.json({ 
        message: 'Оффисын байршил амжилттай шинэчлэгдлээ',
        latitude: numLatitude,
        longitude: numLongitude,
        allowedRadius: numAllowedRadius
      });
    } catch (fsError) {
      console.error('File system error:', fsError);
      return res.status(500).json({ 
        message: 'Файл шинэчлэх үед алдаа гарлаа', 
        error: fsError.message 
      });
    }
  } catch (error) {
    console.error('Update office location error:', error);
    return res.status(500).json({ 
      message: 'Серверийн алдаа', 
      error: error.message 
    });
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
