const Salary = require('../models/Salary');
const Changelog = require('../models/Changelog');

// Шинэ цалингийн бүртгэл үүсгэх (Зөвхөн Админ/Менежер)
exports.createSalary = async (req, res) => {
  try {
    const { user_id, base_salary, bonus, deductions, effective_date } = req.body;
    
    // Цалингийн бүртгэл үүсгэх
    const salaryId = await Salary.create({
      user_id,
      base_salary,
      bonus,
      deductions,
      effective_date
    });
    
    // Өөрчлөлтийн бүртгэлд бүртгэх
    await Changelog.create({
      title: 'Цалингийн бүртгэл үүсгэсэн',
      description: `${req.user.name} нь ажилтны цалингийн бүртгэл үүсгэлээ`,
      type: 'feature',
      created_by: req.user.id
    });
    
    res.status(201).json({
      message: 'Цалингийн бүртгэл амжилттай үүсгэгдлээ',
      salaryId
    });
  } catch (error) {
    console.error('Цалингийн бүртгэл үүсгэхэд алдаа гарлаа:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};

// ID-гаар цалингийн бүртгэл авах (Админ/Менежер эсвэл эзэмшигч)
exports.getSalaryById = async (req, res) => {
  try {
    const { id } = req.params;
    const salary = await Salary.getById(id);
    
    if (!salary) {
      return res.status(404).json({ message: 'Цалингийн бүртгэл олдсонгүй' });
    }
    
    // Хэрэглэгч энэ цалингийн бүртгэлийг харах эрхтэй эсэхийг шалгах
    if (req.user.role !== 'admin' && req.user.role !== 'manager' && salary.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Энэ цалингийн бүртгэлийг харах эрх хүрэлцэхгүй байна' });
    }
    
    res.json(salary);
  } catch (error) {
    console.error('ID-гаар цалингийн бүртгэл авахад алдаа гарлаа:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};

// Одоогийн хэрэглэгчийн цалингийн түүхийг авах
exports.getUserSalary = async (req, res) => {
  try {
    const userId = req.user.id;
    const salaryHistory = await Salary.getByUserId(userId);
    res.json(salaryHistory);
  } catch (error) {
    console.error('Хэрэглэгчийн цалингийн мэдээлэл авахад алдаа гарлаа:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};

// Одоогийн хэрэглэгчийн идэвхтэй цалингийн мэдээллийг авах
exports.getCurrentUserSalary = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentSalary = await Salary.getCurrentByUserId(userId);
    
    if (!currentSalary) {
      return res.status(404).json({ message: 'Цалингийн бүртгэл олдсонгүй' });
    }
    
    res.json(currentSalary);
  } catch (error) {
    console.error('Одоогийн хэрэглэгчийн цалингийн мэдээлэл авахад алдаа гарлаа:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};

// Тодорхой хэрэглэгчийн цалингийн түүхийг авах (Зөвхөн Админ/Менежер)
exports.getSalaryByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const salaryHistory = await Salary.getByUserId(userId);
    res.json(salaryHistory);
  } catch (error) {
    console.error('Хэрэглэгчийн ID-гаар цалингийн мэдээлэл авахад алдаа гарлаа:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};

// Бүх цалингийн бүртгэлүүдийг авах (Зөвхөн Админ/Менежер)
exports.getAllSalaries = async (req, res) => {
  try {
    const salaries = await Salary.getAll();
    res.json(salaries);
  } catch (error) {
    console.error('Бүх цалингийн бүртгэлүүдийг авахад алдаа гарлаа:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};

// Цалингийн бүртгэл шинэчлэх (Зөвхөн Админ/Менежер)
exports.updateSalary = async (req, res) => {
  try {
    const { id } = req.params;
    const { base_salary, bonus, deductions, effective_date } = req.body;
    
    // Цалингийн бүртгэл байгаа эсэхийг шалгах
    const salary = await Salary.getById(id);
    if (!salary) {
      return res.status(404).json({ message: 'Цалингийн бүртгэл олдсонгүй' });
    }
    
    // Цалингийн бүртгэлийг шинэчлэх
    const updated = await Salary.update(id, {
      base_salary,
      bonus,
      deductions,
      effective_date
    });
    
    if (!updated) {
      return res.status(400).json({ message: 'Цалингийн бүртгэл шинэчлэгдсэнгүй' });
    }
    
    // Өөрчлөлтийн бүртгэлд бүртгэх
    await Changelog.create({
      title: 'Цалингийн бүртгэл шинэчлэгдсэн',
      description: `${req.user.name} нь цалингийн бүртгэлийг шинэчиллээ`,
      type: 'update',
      created_by: req.user.id
    });
    
    res.json({ message: 'Цалингийн бүртгэл амжилттай шинэчлэгдлээ' });
  } catch (error) {
    console.error('Цалингийн бүртгэл шинэчлэхэд алдаа гарлаа:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};

// Цалингийн бүртгэл устгах (Зөвхөн Админ)
exports.deleteSalary = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Цалингийн бүртгэл байгаа эсэхийг шалгах
    const salary = await Salary.getById(id);
    if (!salary) {
      return res.status(404).json({ message: 'Цалингийн бүртгэл олдсонгүй' });
    }
    
    // Цалингийн бүртгэлийг устгах
    const deleted = await Salary.delete(id);
    
    if (!deleted) {
      return res.status(400).json({ message: 'Цалингийн бүртгэл устгагдсангүй' });
    }
    
    // Өөрчлөлтийн бүртгэлд бүртгэх
    await Changelog.create({
      title: 'Цалингийн бүртгэл устгагдсан',
      description: `${req.user.name} нь цалингийн бүртгэлийг устгалаа`,
      type: 'update',
      created_by: req.user.id
    });
    
    res.json({ message: 'Цалингийн бүртгэл амжилттай устгагдлаа' });
  } catch (error) {
    console.error('Цалингийн бүртгэл устгахад алдаа гарлаа:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};
