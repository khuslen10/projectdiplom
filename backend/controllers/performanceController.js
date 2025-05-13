const PerformanceReview = require('../models/Performance');
const Changelog = require('../models/Changelog');

// Шинэ гүйцэтгэлийн үнэлгээ үүсгэх
exports.createPerformanceReview = async (req, res) => {
  try {
    const { user_id, review_period, rating, strengths, areas_to_improve, goals, comments } = req.body;
    const reviewer_id = req.user.id;
    
    // Шаардлагатай талбаруудыг шалгах
    if (!user_id) {
      return res.status(400).json({ message: 'Ажилтны ID заавал шаардлагатай' });
    }
    
    if (!review_period) {
      return res.status(400).json({ message: 'Үнэлгээний хугацаа заавал шаардлагатай' });
    }
    
    // Гүйцэтгэлийн үнэлгээ үүсгэх
    const reviewId = await PerformanceReview.create({
      user_id,
      reviewer_id,
      review_period,
      rating: rating || 0,
      strengths: strengths || '',
      areas_to_improve: areas_to_improve || '',
      goals: goals || '',
      comments: comments || ''
    });
    
    // Өөрчлөлтийн түүхэнд бүртгэх
    await Changelog.create({
      title: 'Гүйцэтгэлийн үнэлгээ үүсгэсэн',
      description: `${req.user.name} нь ажилтанд гүйцэтгэлийн үнэлгээ үүсгэлээ`,
      type: 'feature',
      created_by: reviewer_id
    });
    
    res.status(201).json({
      message: 'Гүйцэтгэлийн үнэлгээ амжилттай үүсгэгдлээ',
      reviewId
    });
  } catch (error) {
    console.error('Гүйцэтгэлийн үнэлгээ үүсгэхэд алдаа гарлаа:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};

// ID-гаар гүйцэтгэлийн үнэлгээг авах
exports.getPerformanceReviewById = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await PerformanceReview.getById(id);
    
    if (!review) {
      return res.status(404).json({ message: 'Гүйцэтгэлийн үнэлгээ олдсонгүй' });
    }
    
    // Хэрэглэгч энэ үнэлгээг харах эрхтэй эсэхийг шалгах
    if (
      req.user.role !== 'admin' && 
      review.user_id !== req.user.id && 
      review.reviewer_id !== req.user.id
    ) {
      return res.status(403).json({ message: 'Энэ үнэлгээг харах эрх хүрэлцэхгүй байна' });
    }
    
    res.json(review);
  } catch (error) {
    console.error('ID-гаар гүйцэтгэлийн үнэлгээг авахад алдаа гарлаа:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};

// Одоогийн хэрэглэгчийн гүйцэтгэлийн үнэлгээг авах
exports.getUserPerformanceReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const reviews = await PerformanceReview.getByUserId(userId);
    res.json(reviews);
  } catch (error) {
    console.error('Хэрэглэгчийн гүйцэтгэлийн үнэлгээг авахад алдаа гарлаа:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};

// Одоогийн хэрэглэгчийн үүсгэсэн үнэлгээг авах (үнэлгээ өгөгч болгон)
exports.getReviewsByReviewer = async (req, res) => {
  try {
    const reviewerId = req.user.id;
    const reviews = await PerformanceReview.getByReviewerId(reviewerId);
    res.json(reviews);
  } catch (error) {
    console.error('Үнэлгээ өгөгчийн үнэлгээг авахад алдаа гарлаа:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};

// Бүх гүйцэтгэлийн үнэлгээг авах (Зөвхөн Админ/Менежер)
exports.getAllPerformanceReviews = async (req, res) => {
  try {
    const reviews = await PerformanceReview.getAll();
    res.json(reviews);
  } catch (error) {
    console.error('Бүх гүйцэтгэлийн үнэлгээг авахад алдаа гарлаа:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};

// Гүйцэтгэлийн үнэлгээг шинэчлэх (зөвхөн үнэлгээ өгөгч эсвэл админ)
exports.updatePerformanceReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, strengths, areas_to_improve, goals, comments, status } = req.body;
    
    // Үнэлгээ байгаа эсэхийг шалгах
    const review = await PerformanceReview.getById(id);
    if (!review) {
      return res.status(404).json({ message: 'Гүйцэтгэлийн үнэлгээ олдсонгүй' });
    }
    
    // Хэрэглэгч энэ үнэлгээг шинэчлэх эрхтэй эсэхийг шалгах
    if (req.user.role !== 'admin' && review.reviewer_id !== req.user.id) {
      return res.status(403).json({ message: 'Энэ үнэлгээг шинэчлэх эрх хүрэлцэхгүй байна' });
    }
    
    // Үнэлгээг шинэчлэх
    const updated = await PerformanceReview.update(id, {
      rating,
      strengths,
      areas_to_improve,
      goals,
      comments,
      status
    });
    
    if (!updated) {
      return res.status(400).json({ message: 'Гүйцэтгэлийн үнэлгээ шинэчлэгдсэнгүй' });
    }
    
    // Өөрчлөлтийн түүхэнд бүртгэх
    await Changelog.create({
      title: 'Гүйцэтгэлийн үнэлгээ шинэчлэгдсэн',
      description: `${req.user.name} нь гүйцэтгэлийн үнэлгээг шинэчиллээ`,
      type: 'update',
      created_by: req.user.id
    });
    
    res.json({ message: 'Гүйцэтгэлийн үнэлгээ амжилттай шинэчлэгдлээ' });
  } catch (error) {
    console.error('Гүйцэтгэлийн үнэлгээг шинэчлэхэд алдаа гарлаа:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};

// Гүйцэтгэлийн үнэлгээг баталгаажуулах (үнэлгээ авч буй ажилтнаар)
exports.acknowledgePerformanceReview = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Үнэлгээ байгаа эсэхийг шалгах
    const review = await PerformanceReview.getById(id);
    if (!review) {
      return res.status(404).json({ message: 'Гүйцэтгэлийн үнэлгээ олдсонгүй' });
    }
    
    // Хэрэглэгч үнэлгээ авч буй хүн мөн эсэхийг шалгах
    if (review.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Энэ үнэлгээг баталгаажуулах эрх хүрэлцэхгүй байна' });
    }
    
    // Төлөвийг баталгаажуулсан болгож шинэчлэх
    const updated = await PerformanceReview.updateStatus(id, 'acknowledged');
    
    if (!updated) {
      return res.status(400).json({ message: 'Гүйцэтгэлийн үнэлгээ баталгаажуулагдсангүй' });
    }
    
    // Өөрчлөлтийн түүхэнд бүртгэх
    await Changelog.create({
      title: 'Гүйцэтгэлийн үнэлгээ баталгаажуулсан',
      description: `${req.user.name} нь гүйцэтгэлийн үнэлгээг баталгаажууллаа`,
      type: 'update',
      created_by: req.user.id
    });
    
    res.json({ message: 'Гүйцэтгэлийн үнэлгээ амжилттай баталгаажууллаа' });
  } catch (error) {
    console.error('Гүйцэтгэлийн үнэлгээг баталгаажуулахад алдаа гарлаа:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};

// Гүйцэтгэлийн үнэлгээг устгах (зөвхөн ноорог төлөвтэй ба үнэлгээ өгөгчийн үүсгэсэн бол)
exports.deletePerformanceReview = async (req, res) => {
  try {
    const { id } = req.params;
    const reviewerId = req.user.id;
    
    // Үнэлгээг устгах
    const deleted = await PerformanceReview.delete(id, reviewerId);
    
    if (!deleted) {
      return res.status(400).json({ 
        message: 'Гүйцэтгэлийн үнэлгээ устгагдсангүй. Зөвхөн өөрийн үүсгэсэн ноорог төлөвтэй үнэлгээг устгах боломжтой' 
      });
    }
    
    // Өөрчлөлтийн түүхэнд бүртгэх
    await Changelog.create({
      title: 'Гүйцэтгэлийн үнэлгээ устгагдсан',
      description: `${req.user.name} нь гүйцэтгэлийн үнэлгээг устгалаа`,
      type: 'update',
      created_by: reviewerId
    });
    
    res.json({ message: 'Гүйцэтгэлийн үнэлгээ амжилттай устгагдлаа' });
  } catch (error) {
    console.error('Гүйцэтгэлийн үнэлгээг устгахад алдаа гарлаа:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};
