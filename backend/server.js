const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const attendanceRoutes = require('./routes/attendance');
const leaveRoutes = require('./routes/leave');
const performanceRoutes = require('./routes/performance');
const salaryRoutes = require('./routes/salary');
const changelogRoutes = require('./routes/changelog');
const reportRoutes = require('./routes/reports');
const statsRoutes = require('./routes/stats');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/salary', salaryRoutes);
app.use('/api/changelog', changelogRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/stats', statsRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Ажилтны удирдлагын систем API ажиллаж байна');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Сервер ${PORT} портод ажиллаж эхэллээ`);
});
