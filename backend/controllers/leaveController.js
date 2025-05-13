const LeaveRequest = require('../models/LeaveRequest');
const Changelog = require('../models/Changelog');

// Шинэ чөлөөний хүсэлт үүсгэх
exports.createLeaveRequest = async (req, res) => {
  try {
    const { start_date, end_date, type, reason } = req.body;
    const user_id = req.user.id;
    
    // Чөлөөний хүсэлт үүсгэх
    const leaveId = await LeaveRequest.create({
      user_id,
      start_date,
      end_date,
      type,
      reason
    });
    
    // Өөрчлөлтийн түүхэнд бүртгэх
    await Changelog.create({
      title: 'Чөлөөний хүсэлт үүсгэсэн',
      description: `${req.user.name} ${start_date}-аас ${end_date} хүртэл ${type} төрлийн чөлөө авах хүсэлт гаргалаа`,
      type: 'feature',
      created_by: user_id
    });
    
    res.status(201).json({
      message: 'Чөлөөний хүсэлт амжилттай үүсгэгдлээ',
      leaveId
    });
  } catch (error) {
    console.error('Create leave request error:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};

// ID-гаар чөлөөний хүсэлтийг авах
exports.getLeaveRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const leaveRequest = await LeaveRequest.getById(id);
    
    if (!leaveRequest) {
      return res.status(404).json({ message: 'Чөлөөний хүсэлт олдсонгүй' });
    }
    
    // Хэрэглэгч энэ чөлөөний хүсэлтийг харах эрхтэй эсэхийг шалгах
    if (
      req.user.role !== 'admin' && 
      req.user.role !== 'manager' && 
      leaveRequest.user_id !== req.user.id
    ) {
      return res.status(403).json({ message: 'Энэ хүсэлтийг харах эрх хүрэлцэхгүй байна' });
    }
    
    res.json(leaveRequest);
  } catch (error) {
    console.error('Get leave request by id error:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};

// Одоогийн хэрэглэгчийн чөлөөний хүсэлтүүдийг авах
exports.getUserLeaveRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const leaveRequests = await LeaveRequest.getByUserId(userId);
    res.json(leaveRequests);
  } catch (error) {
    console.error('Get user leave requests error:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};

// Бүх хүлээгдэж буй чөлөөний хүсэлтүүдийг авах (Зөвхөн Админ/Менежер)
exports.getPendingLeaveRequests = async (req, res) => {
  try {
    const pendingRequests = await LeaveRequest.getPending();
    res.json(pendingRequests);
  } catch (error) {
    console.error('Get pending leave requests error:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};

// Бүх чөлөөний хүсэлтүүдийг авах (Зөвхөн Админ/Менежер)
exports.getAllLeaveRequests = async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.getAll();
    res.json(leaveRequests);
  } catch (error) {
    console.error('Get all leave requests error:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};

// Чөлөөний хүсэлтийг зөвшөөрөх эсвэл татгалзах (Зөвхөн Админ/Менежер)
exports.updateLeaveRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const approvedBy = req.user.id;
    
    // Чөлөөний хүсэлт байгаа эсэхийг шалгах
    const leaveRequest = await LeaveRequest.getById(id);
    if (!leaveRequest) {
      return res.status(404).json({ message: 'Чөлөөний хүсэлт олдсонгүй' });
    }
    
    // Төлөвийг шинэчлэх
    const updated = await LeaveRequest.updateStatus(id, status, approvedBy);
    
    if (!updated) {
      return res.status(400).json({ message: 'Чөлөөний хүсэлтийн төлөв шинэчлэгдсэнгүй' });
    }
    
    // Өөрчлөлтийн түүхэнд бүртгэх
    const statusText = status === 'approved' ? 'зөвшөөрсөн' : 'татгалзсан';
    await Changelog.create({
      title: 'Чөлөөний хүсэлтийн төлөв шинэчлэгдсэн',
      description: `${req.user.name} нь ${leaveRequest.user_name}-ийн чөлөөний хүсэлтийг ${statusText}`,
      type: 'update',
      created_by: approvedBy
    });
    
    res.json({ 
      message: `Чөлөөний хүсэлт амжилттай ${statusText}` 
    });
  } catch (error) {
    console.error('Update leave request status error:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};

// Чөлөөний хүсэлтийг устгах (зөвхөн хүлээгдэж буй ба одоогийн хэрэглэгчийн үүсгэсэн бол)
exports.deleteLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Чөлөөний хүсэлтийг устгах
    const deleted = await LeaveRequest.delete(id, userId);
    
    if (!deleted) {
      return res.status(400).json({ 
        message: 'Чөлөөний хүсэлт устгагдсангүй. Зөвхөн өөрийн үүсгэсэн хүлээгдэж буй хүсэлтийг устгах боломжтой' 
      });
    }
    
    // Өөрчлөлтийн түүхэнд бүртгэх
    await Changelog.create({
      title: 'Чөлөөний хүсэлт устгагдсан',
      description: `${req.user.name} өөрийн чөлөөний хүсэлтийг устгалаа`,
      type: 'update',
      created_by: userId
    });
    
    res.json({ message: 'Чөлөөний хүсэлт амжилттай устгагдлаа' });
  } catch (error) {
    console.error('Delete leave request error:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};
