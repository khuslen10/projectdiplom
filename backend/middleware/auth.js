const jwt = require('jsonwebtoken');
require('dotenv').config();

const auth = (req, res, next) => {
  // Хедерээс токен авах
  const token = req.header('x-auth-token');

  // Токен байгаа эсэхийг шалгах
  if (!token) {
    return res.status(401).json({ message: 'Токен байхгүй байна, зөвшөөрөл татгалзагдлаа' });
  }

  // Токеныг баталгаажуулах
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Токен хүчингүй байна' });
  }
};

// Үүрэгт тулгуурласан зөвшөөрлийн мидлвэр
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Зөвшөөрөлгүй хандалт' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Энэ үйлдлийг гүйцэтгэх эрх хүрэлцэхгүй байна' });
    }
    
    next();
  };
};

module.exports = { auth, authorize };
