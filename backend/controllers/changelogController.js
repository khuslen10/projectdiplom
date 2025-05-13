const Changelog = require('../models/Changelog');

// Шинэ өөрчлөлтийн бүртгэл үүсгэх
exports.createChangelog = async (req, res) => {
  try {
    const { title, description, type } = req.body;
    const created_by = req.user.id;
    
    // Өөрчлөлтийн бүртгэл үүсгэх
    const changelogId = await Changelog.create({
      title,
      description,
      type,
      created_by
    });
    
    res.status(201).json({
      message: 'Өөрчлөлтийн бүртгэл амжилттай үүсгэгдлээ',
      changelogId
    });
  } catch (error) {
    console.error('Өөрчлөлтийн бүртгэл үүсгэхэд алдаа гарлаа:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};

// ID-гаар өөрчлөлтийн бүртгэл авах
exports.getChangelogById = async (req, res) => {
  try {
    const { id } = req.params;
    const changelog = await Changelog.getById(id);
    
    if (!changelog) {
      return res.status(404).json({ message: 'Өөрчлөлтийн бүртгэл олдсонгүй' });
    }
    
    res.json(changelog);
  } catch (error) {
    console.error('ID-гаар өөрчлөлтийн бүртгэл авахад алдаа гарлаа:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};

// Бүх өөрчлөлтийн бүртгэлүүдийг авах
exports.getAllChangelogs = async (req, res) => {
  try {
    const changelogs = await Changelog.getAll();
    res.json(changelogs);
  } catch (error) {
    console.error('Бүх өөрчлөлтийн бүртгэлүүдийг авахад алдаа гарлаа:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};

// Өөрчлөлтийн бүртгэл устгах (Зөвхөн админ)
exports.deleteChangelog = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Өөрчлөлтийн бүртгэл байгаа эсэхийг шалгах
    const changelog = await Changelog.getById(id);
    if (!changelog) {
      return res.status(404).json({ message: 'Өөрчлөлтийн бүртгэл олдсонгүй' });
    }
    
    // Өөрчлөлтийн бүртгэлийг устгах
    const deleted = await Changelog.delete(id);
    
    if (!deleted) {
      return res.status(400).json({ message: 'Өөрчлөлтийн бүртгэл устгагдсангүй' });
    }
    
    res.json({ message: 'Өөрчлөлтийн бүртгэл амжилттай устгагдлаа' });
  } catch (error) {
    console.error('Өөрчлөлтийн бүртгэл устгахад алдаа гарлаа:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};
