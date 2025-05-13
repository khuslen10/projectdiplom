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
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const SalaryReport = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);
  
  // Filter states
  const [month, setMonth] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [department, setDepartment] = useState('');
  
  const months = [
    { value: '', label: 'Бүх сар' },
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
      
      let url = `http://localhost:5000/api/reports/salary?year=${year}`;
      if (month) {
        url += `&month=${month}`;
      }
      if (department) {
        url += `&department=${department}`;
      }
      
      const res = await axios.get(url);
      setReport(res.data);
      
    } catch (err) {
      console.error('Тайлан үүсгэхэд алдаа гарлаа:', err);
      setError('Тайлан үүсгэхэд алдаа гарлаа. Дахин оролдоно уу.');
    } finally {
      setLoading(false);
    }
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('mn-MN').format(amount) + ' ₮';
  };
  
  const exportToPDF = () => {
    if (!report) return;
    
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
      floatPrecision: 16 // or "smart", default is 16
    });
    
    const transliterate = (text) => {
      if (!text) return '';
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
    
    doc.setFontSize(16);
    const title = month 
      ? `Salary Report - ${year}/${month}` 
      : `Salary Report - ${year}`;
    doc.text(title, 14, 15);
    
    doc.setFontSize(10);
    doc.text(`Department: ${department ? transliterate(department) : 'All departments'}`, 14, 25);
    doc.text(`Total employees: ${report.total_employees}`, 14, 30);
    doc.text(`Total salary expense: ${formatCurrency(report.total_net_salary)}`, 14, 35);
    
    const tableColumn = ["Name", "Position", "Department", "Base Salary", "Bonus", "Deductions", "Net Salary"];
    const tableRows = [];
    
    report.report.forEach(item => {
      const rowData = [
        transliterate(item.name),
        transliterate(item.position),
        transliterate(item.department),
        formatCurrency(item.base_salary),
        formatCurrency(item.bonus),
        formatCurrency(item.deductions),
        formatCurrency(item.net_salary)
      ];
      tableRows.push(rowData);
    });
    
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      styles: { fontSize: 8, font: 'helvetica' },
      headStyles: { fillColor: [41, 128, 185] },
      tableLineWidth: 0.5,
      tableLineColor: [0, 0, 0]
    });
    
    const fileName = month 
      ? `Salary_Report_${year}_${month}.pdf` 
      : `Salary_Report_${year}.pdf`;
    doc.save(fileName);
  };
  
  const exportToExcel = () => {
    if (!report) return;
    
    const worksheet = XLSX.utils.json_to_sheet(report.report.map(item => ({
      'Нэр': item.name,
      'Имэйл': item.email,
      'Албан тушаал': item.position,
      'Хэлтэс': item.department,
      'Үндсэн цалин': item.base_salary,
      'Урамшуулал': item.bonus,
      'Суутгал': item.deductions,
      'Нийт цалин': item.net_salary
    })));
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Цалингийн тайлан");
    
    const fileName = month 
      ? `Цалингийн_тайлан_${year}_${month}.xlsx` 
      : `Цалингийн_тайлан_${year}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };
  
  // Prepare chart data
  const getChartData = () => {
    if (!report) return [];
    
    return report.report.map(item => ({
      name: item.name,
      'Үндсэн цалин': item.base_salary,
      'Урамшуулал': item.bonus,
      'Суутгал': item.deductions
    }));
  };
  
  // Prepare pie chart data
  const getPieChartData = () => {
    if (!report) return [];
    
    // Group by department and calculate total salary
    const departmentData = {};
    
    report.report.forEach(item => {
      if (!departmentData[item.department]) {
        departmentData[item.department] = 0;
      }
      
      departmentData[item.department] += item.net_salary;
    });
    
    return Object.keys(departmentData).map(dept => ({
      name: dept,
      value: departmentData[dept]
    }));
  };
  
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Цалингийн тайлан
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
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
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
          
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Жил"
              type="number"
              value={year}
              onChange={handleYearChange}
              InputProps={{ inputProps: { min: 2020, max: 2100 } }}
            />
          </Grid>
          
          <Grid item xs={12} sm={3}>
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
          
          <Grid item xs={12} sm={3}>
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
              Хугацаа: {report.year} {report.month ? `оны ${report.month}-р сар` : 'он'}
            </Typography>
            <Typography variant="body2" gutterBottom>
              Нийт ажилтан: {report.total_employees}
            </Typography>
            
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Нийт үндсэн цалин
                  </Typography>
                  <Typography variant="h6">
                    {formatCurrency(report.total_base_salary)}
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e9' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Нийт урамшуулал
                  </Typography>
                  <Typography variant="h6">
                    {formatCurrency(report.total_bonus)}
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Нийт суутгал
                  </Typography>
                  <Typography variant="h6">
                    {formatCurrency(report.total_deductions)}
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e8eaf6' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Нийт цалингийн зардал
                  </Typography>
                  <Typography variant="h6">
                    {formatCurrency(report.total_net_salary)}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
            
            <Box sx={{ height: 300, mt: 3 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={getChartData()}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="Үндсэн цалин" fill="#0088FE" />
                  <Bar dataKey="Урамшуулал" fill="#00C49F" />
                  <Bar dataKey="Суутгал" fill="#FF8042" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
            
            <Box sx={{ height: 300, mt: 3 }}>
              <Grid container>
                <Grid item xs={12} md={6}>
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
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" align="center" gutterBottom>
                    Хэлтсүүдийн цалингийн харьцаа
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
                          {entry.name}: {formatCurrency(entry.value)}
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
                    <TableCell align="right">Үндсэн цалин</TableCell>
                    <TableCell align="right">Урамшуулал</TableCell>
                    <TableCell align="right">Суутгал</TableCell>
                    <TableCell align="right">Нийт цалин</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {report.report.map((item) => (
                    <TableRow key={item.user_id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.position}</TableCell>
                      <TableCell>{item.department}</TableCell>
                      <TableCell align="right">{formatCurrency(item.base_salary)}</TableCell>
                      <TableCell align="right">{formatCurrency(item.bonus)}</TableCell>
                      <TableCell align="right">{formatCurrency(item.deductions)}</TableCell>
                      <TableCell align="right">{formatCurrency(item.net_salary)}</TableCell>
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

export default SalaryReport;
