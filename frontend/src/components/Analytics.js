import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, Typography, Paper, Grid, CircularProgress, 
  Card, CardContent, Divider
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    departmentStats: [],
    attendanceStats: [],
    performanceStats: [],
    salaryStats: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Одоогийн огнооны мэдээллийг авах
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        
        // Хэлтсийн хуваарилалтын мэдээллийг авах
        const deptRes = await axios.get(`http://localhost:5000/api/stats/department`);
        
        // Одоогийн сарын ирцийн статистикийг авах
        const attendanceRes = await axios.get(
          `http://localhost:5000/api/stats/attendance?month=${currentMonth}&year=${currentYear}`
        );
        
        // Гүйцэтгэлийн статистикийг авах
        const performanceRes = await axios.get(
          `http://localhost:5000/api/stats/performance?year=${currentYear}`
        );
        
        // Цалингийн статистикийг авах
        const salaryRes = await axios.get(
          `http://localhost:5000/api/stats/salary?year=${currentYear}`
        );
        
        // Хэлтсийн өгөгдлийг харуулахад бэлтгэх
        const departmentStats = deptRes.data.map((dept, index) => ({
          name: dept.department || 'Хэлтэсгүй',
          value: dept.count,
          color: COLORS[index % COLORS.length]
        }));
        
        setData({
          departmentStats: departmentStats,
          attendanceStats: attendanceRes.data,
          performanceStats: performanceRes.data,
          salaryStats: salaryRes.data
        });
        
      } catch (err) {
        console.error('Аналитик мэдээлэл авахад алдаа гарлаа:', err);
        setError('Мэдээлэл авахад алдаа гарлаа');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // API цэгүүд бэлэн биш бол харуулах жишиг өгөгдөл
  const getMockData = () => {
    // Хэлтсийн хуваарилалт
    const mockDepartmentStats = [
      { name: 'IT', value: 12, color: COLORS[0] },
      { name: 'Хүний нөөц', value: 8, color: COLORS[1] },
      { name: 'Санхүү', value: 6, color: COLORS[2] },
      { name: 'Маркетинг', value: 5, color: COLORS[3] },
      { name: 'Борлуулалт', value: 9, color: COLORS[4] }
    ];
    
    // Ирцийн статистик
    const mockAttendanceStats = [
      { name: 'Ирсэн', value: 85 },
      { name: 'Хоцорсон', value: 10 },
      { name: 'Ирээгүй', value: 5 }
    ];
    
    // Хэлтсээр гүйцэтгэлийн статистик
    const mockPerformanceStats = [
      { department: 'IT', rating: 4.2 },
      { department: 'Хүний нөөц', rating: 4.5 },
      { department: 'Санхүү', rating: 3.8 },
      { department: 'Маркетинг', rating: 4.0 },
      { department: 'Борлуулалт', rating: 4.3 }
    ];
    
    // Цалингийн хуваарилалт
    const mockSalaryStats = [
      { department: 'IT', averageSalary: 2500000 },
      { department: 'Хүний нөөц', averageSalary: 2200000 },
      { department: 'Санхүү', averageSalary: 2800000 },
      { department: 'Маркетинг', averageSalary: 2100000 },
      { department: 'Борлуулалт', averageSalary: 2400000 }
    ];
    
    return {
      departmentStats: mockDepartmentStats,
      attendanceStats: mockAttendanceStats,
      performanceStats: mockPerformanceStats,
      salaryStats: mockSalaryStats
    };
  };
  
  // Always use mock data for now until backend is fully set up
  const displayData = getMockData();
  
  // Мөнгөн дүнг форматлах
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('mn-MN').format(amount) + ' ₮';
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        Аналитик тойм
      </Typography>
      
      <Grid container spacing={3}>
        {/* Хэлтсийн хуваарилалт */}
        <Grid md={6} xs={12}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Хэлтсийн бүтэц
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={displayData.departmentStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {displayData.departmentStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} ажилтан`, 'Тоо']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        
        {/* Ирцийн хуваарилалт */}
        <Grid md={6} xs={12}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Ирцийн тойм
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={displayData.attendanceStats}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}%`, 'Хувь']} />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" name="Хувь" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        
        {/* Гүйцэтгэлийн радар */}
        <Grid md={6} xs={12}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Гүйцэтгэлийн үнэлгээ
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={displayData.performanceStats}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="department" />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} />
                  <Radar name="Дундаж үнэлгээ" dataKey="rating" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  <Tooltip />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        
        {/* Цалингийн харьцуулалт */}
        <Grid md={6} xs={12}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Цалингийн харьцуулалт
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={displayData.salaryStats}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <Tooltip formatter={(value) => [formatCurrency(value), 'Дундаж цалин']} />
                  <Legend />
                  <Bar dataKey="averageSalary" fill="#82ca9d" name="Дундаж цалин" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        
        {/* Гол үзүүлэлтүүдийн картууд */}
        <Grid xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Гол үзүүлэлтүүд
            </Typography>
            <Grid container spacing={2}>
              <Grid md={3} sm={6} xs={12}>
                <Card sx={{ bgcolor: '#e3f2fd' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Нийт ажилтан
                    </Typography>
                    <Typography variant="h4">
                      {displayData.departmentStats.reduce((sum, item) => sum + item.value, 0)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid md={3} sm={6} xs={12}>
                <Card sx={{ bgcolor: '#e8f5e9' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Ирцийн дундаж
                    </Typography>
                    <Typography variant="h4">
                      {displayData.attendanceStats.find(item => item.name === 'Ирсэн')?.value || 0}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid md={3} sm={6} xs={12}>
                <Card sx={{ bgcolor: '#fff3e0' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Дундаж үнэлгээ
                    </Typography>
                    <Typography variant="h4">
                      {(displayData.performanceStats.reduce((sum, item) => sum + item.rating, 0) / 
                        displayData.performanceStats.length).toFixed(1)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid md={3} sm={6} xs={12}>
                <Card sx={{ bgcolor: '#f3e5f5' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Дундаж цалин
                    </Typography>
                    <Typography variant="h4">
                      {formatCurrency(
                        Math.round(
                          displayData.salaryStats.reduce((sum, item) => sum + item.averageSalary, 0) / 
                          displayData.salaryStats.length
                        )
                      )}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;
