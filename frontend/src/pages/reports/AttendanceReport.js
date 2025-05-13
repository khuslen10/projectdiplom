import React, { useState } from 'react';
import axios from 'axios';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, Alert, CircularProgress, Grid,
  FormControl, InputLabel, MenuItem, Select, TextField
} from '@mui/material';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { mn as mnLocale } from 'date-fns/locale';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AttendanceReport = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);
  
  // Filter states
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [department, setDepartment] = useState('');
  
  const months = [
    { value: 1, label: '1-р сар' },
    { value: 2, label: '2-р сар' },
    { value: 3, label: '3-р сар' },
    { value: 4, label: '4-р сар' },
    { value: 5, label: '5-р сар' },
    { value: 6, label: '6-р сар' },
    { value: 7, label: '7-р сар' },
    { value: 8, label: '8-р сар' },
    { value: 9, label: '9-р сар' },
    { value: 10, label: '10-р сар' },
    { value: 11, label: '11-р сар' },
    { value: 12, label: '12-р сар' }
  ];
  
  const departments = [
    { value: '', label: 'Бүх хэлтэс' },
    { value: 'IT', label: 'IT' },
    { value: 'Хүний нөөц', label: 'Хүний нөөц' },
    { value: 'Санхүү', label: 'Санхүү' },
    { value: 'Маркетинг', label: 'Маркетинг' }
  ];
  
  const handleMonthChange = (event) => {
    setMonth(event.target.value);
  };
  
  const handleYearChange = (event) => {
    setYear(event.target.value);
  };
  
  const handleDepartmentChange = (event) => {
    setDepartment(event.target.value);
  };
  
  const generateReport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let url = `http://localhost:5000/api/reports/attendance?month=${month}&year=${year}`;
      if (department) {
        url += `&department=${department}`;
      }
      
      console.log('Requesting report from:', url);
      const res = await axios.get(url);
      console.log('Report data received:', res.data);
      setReport(res.data);
      
    } catch (err) {
      console.error('Тайлан үүсгэхэд алдаа гарлаа:', err);
      setError('Тайлан үүсгэхэд алдаа гарлаа. Дахин оролдоно уу.');
    } finally {
      setLoading(false);
    }
  };
  
  const exportToPDF = () => {
    if (!report) return;
    
    // Create new document with UTF-8 support
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
      floatPrecision: 16 // or "smart", default is 16
    });
    
    // Helper function to transliterate Mongolian to Latin characters
    const transliterate = (text) => {
      if (!text) return '';
      // Simple transliteration map for Mongolian Cyrillic
      const map = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
        'ж': 'j', 'з': 'z', 'и': 'i', 'й': 'i', 'к': 'k', 'л': 'l', 'м': 'm',
        'н': 'n', 'о': 'o', 'ө': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't',
        'у': 'u', 'ү': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh',
        'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
        'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo',
        'Ж': 'J', 'З': 'Z', 'И': 'I', 'Й': 'I', 'К': 'K', 'Л': 'L', 'М': 'M',
        'Н': 'N', 'О': 'O', 'Ө': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T',
        'У': 'U', 'Ү': 'U', 'Ф': 'F', 'Х': 'H', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh',
        'Щ': 'Sch', 'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya'
      };
      
      return text.toString().split('').map(char => map[char] || char).join('');
    };
    
    // Use a simpler title with ASCII characters for safety
    doc.setFontSize(16);
    doc.text(`Attendance Report - ${year}/${month}`, 14, 15);
    
    // Add filters info with ASCII characters
    doc.setFontSize(10);
    doc.text(`Department: ${department || 'All departments'}`, 14, 25);
    doc.text(`Total employees: ${report.total_employees}`, 14, 30);
    
    // Create table with simplified column names in English
    const tableColumn = ["Name", "Position", "Department", "Present", "Late", "Absent", "Rate %"];
    const tableRows = [];
    
    report.report.forEach(item => {
      const rowData = [
        transliterate(item.name),
        transliterate(item.position),
        transliterate(item.department),
        item.present_days,
        item.late_days,
        item.absent_days,
        `${item.attendance_rate}%`
      ];
      tableRows.push(rowData);
    });
    
    // Use the imported autoTable function directly with UTF-8 encoding
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: 'grid',
      styles: { fontSize: 8, font: 'helvetica' },
      headStyles: { fillColor: [41, 128, 185] },
      tableLineWidth: 0.5,
      tableLineColor: [0, 0, 0]
    });
    
    // Use English in filename for compatibility
    doc.save(`Attendance_Report_${year}_${month}.pdf`);
  };
  
  const exportToExcel = () => {
    if (!report) return;
    
    const worksheet = XLSX.utils.json_to_sheet(report.report.map(item => ({
      'Нэр': item.name,
      'Имэйл': item.email,
      'Албан тушаал': item.position,
      'Хэлтэс': item.department,
      'Нийт өдөр': item.total_days,
      'Ирсэн': item.present_days,
      'Хоцорсон': item.late_days,
      'Ирээгүй': item.absent_days,
      'Хагас өдөр': item.half_days,
      'Бүртгэгдээгүй': item.missing_days,
      'Ирцийн хувь': `${item.attendance_rate}%`,
      'Дундаж ирсэн цаг': item.avg_check_in,
      'Дундаж явсан цаг': item.avg_check_out
    })));
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ирцийн тайлан");
    
    XLSX.writeFile(workbook, `Ирцийн_тайлан_${year}_${month}.xlsx`);
  };
  
  // Prepare chart data
  const getChartData = () => {
    if (!report) return [];
    
    return report.report.map(item => ({
      name: item.name,
      Ирсэн: item.present_days,
      Хоцорсон: item.late_days,
      Ирээгүй: item.absent_days,
      'Хагас өдөр': item.half_days
    }));
  };
  
  // Prepare pie chart data
  const getPieChartData = () => {
    if (!report) return [];
    
    let totalPresent = 0;
    let totalLate = 0;
    let totalAbsent = 0;
    let totalHalfDay = 0;
    
    report.report.forEach(item => {
      totalPresent += item.present_days;
      totalLate += item.late_days;
      totalAbsent += item.absent_days;
      totalHalfDay += item.half_days;
    });
    
    return [
      { name: 'Ирсэн', value: totalPresent },
      { name: 'Хоцорсон', value: totalLate },
      { name: 'Ирээгүй', value: totalAbsent },
      { name: 'Хагас өдөр', value: totalHalfDay }
    ];
  };
  
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Ирцийн тайлан
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Тайлангийн тохиргоо
        </Typography>
        
        <Grid container spacing={2} sx={{ alignItems: "center" }}>
          <Grid md={3} sm={6} xs={12}>
            <FormControl fullWidth>
              <InputLabel>Сар</InputLabel>
              <Select
                value={month}
                label="Сар"
                onChange={handleMonthChange}
              >
                {months.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid md={3} sm={6} xs={12}>
            <TextField
              fullWidth
              label="Жил"
              type="number"
              value={year}
              onChange={handleYearChange}
              InputProps={{ inputProps: { min: 2020, max: 2100 } }}
            />
          </Grid>
          
          <Grid md={3} sm={6} xs={12}>
            <FormControl fullWidth>
              <InputLabel>Хэлтэс</InputLabel>
              <Select
                value={department}
                label="Хэлтэс"
                onChange={handleDepartmentChange}
              >
                {departments.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid md={3} sm={6} xs={12}>
            <Button 
              variant="contained" 
              fullWidth
              onClick={generateReport}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Тайлан үүсгэх'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {report && (
        <>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">
                Тайлангийн үр дүн
              </Typography>
              
              <Box>
                <Button 
                  variant="outlined" 
                  sx={{ mr: 1 }}
                  onClick={exportToPDF}
                >
                  PDF татах
                </Button>
                <Button 
                  variant="outlined"
                  onClick={exportToExcel}
                >
                  Excel татах
                </Button>
              </Box>
            </Box>
            
            <Typography variant="body2" gutterBottom>
              Хэлтэс: {report.department}
            </Typography>
            <Typography variant="body2" gutterBottom>
              Хугацаа: {report.year} оны {report.month}-р сар
            </Typography>
            <Typography variant="body2" gutterBottom>
              Нийт ажилтан: {report.total_employees}
            </Typography>
            
            <Box sx={{ height: 300, mt: 3 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={getChartData()}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Ирсэн" fill="#0088FE" />
                  <Bar dataKey="Хоцорсон" fill="#FFBB28" />
                  <Bar dataKey="Ирээгүй" fill="#FF8042" />
                  <Bar dataKey="Хагас өдөр" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
            
            <Box sx={{ height: 300, mt: 3 }}>
              <Grid container>
                <Grid md={6} xs={12}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getPieChartData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getPieChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Grid>
                <Grid item md={6} xs={12}>
                  <Typography variant="subtitle1" align="center" gutterBottom>
                    Ирцийн харьцаа
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {getPieChartData().map((entry, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Box 
                          sx={{ 
                            width: 16, 
                            height: 16, 
                            backgroundColor: COLORS[index % COLORS.length],
                            mr: 1
                          }} 
                        />
                        <Typography variant="body2">
                          {entry.name}: {entry.value} өдөр
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Paper>
          
          <Paper sx={{ mb: 3 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Нэр</TableCell>
                    <TableCell>Албан тушаал</TableCell>
                    <TableCell>Хэлтэс</TableCell>
                    <TableCell align="center">Нийт өдөр</TableCell>
                    <TableCell align="center">Ирсэн</TableCell>
                    <TableCell align="center">Хоцорсон</TableCell>
                    <TableCell align="center">Ирээгүй</TableCell>
                    <TableCell align="center">Хагас өдөр</TableCell>
                    <TableCell align="center">Ирцийн хувь</TableCell>
                    <TableCell align="center">Дундаж ирсэн цаг</TableCell>
                    <TableCell align="center">Дундаж явсан цаг</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {report.report.map((item) => (
                    <TableRow key={item.user_id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.position}</TableCell>
                      <TableCell>{item.department}</TableCell>
                      <TableCell align="center">{item.total_days}</TableCell>
                      <TableCell align="center">{item.present_days}</TableCell>
                      <TableCell align="center">{item.late_days}</TableCell>
                      <TableCell align="center">{item.absent_days}</TableCell>
                      <TableCell align="center">{item.half_days}</TableCell>
                      <TableCell align="center">{item.attendance_rate}%</TableCell>
                      <TableCell align="center">{item.avg_check_in}</TableCell>
                      <TableCell align="center">{item.avg_check_out}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default AttendanceReport;
