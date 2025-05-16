import React, { useState } from 'react';
import axios from 'axios';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, Alert, CircularProgress, Grid,
  FormControl, InputLabel, MenuItem, Select, TextField, Rating, Chip,
  FormControlLabel, Checkbox
} from '@mui/material';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const PerformanceReport = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);
  
  // Filter states
  const [year, setYear] = useState(new Date().getFullYear());
  const [department, setDepartment] = useState('');
  const [hideUnratedEmployees, setHideUnratedEmployees] = useState(false);
  
  const departments = [
    { value: '', label: 'Бүх хэлтэс' },
    { value: 'IT', label: 'IT' },
    { value: 'Хүний нөөц', label: 'Хүний нөөц' },
    { value: 'Санхүү', label: 'Санхүү' },
    { value: 'Маркетинг', label: 'Маркетинг' }
  ];
  
  const handleYearChange = (event) => {
    setYear(event.target.value);
  };
  
  const handleDepartmentChange = (event) => {
    setDepartment(event.target.value);
  };
  
  const handleHideUnratedChange = (event) => {
    setHideUnratedEmployees(event.target.checked);
    // Force re-render by setting a new report object with the same data
    if (report) {
      setReport({...report});
    }
  };
  
  const generateReport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let url = `http://localhost:5000/api/reports/performance?year=${year}`;
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
    doc.text(`Performance Report - ${year}`, 14, 15);
    
    // Add filters info with ASCII characters
    doc.setFontSize(10);
    doc.text(`Department: ${department ? transliterate(department) : 'All departments'}`, 14, 25);
    const employeesText = hideUnratedEmployees 
      ? `Total employees: ${getFilteredReportData().length} (Rated only)` 
      : `Total employees: ${report.total_employees}`;
    doc.text(employeesText, 14, 30);
    
    // Create table with simplified column names in English
    const tableColumn = ["Name", "Position", "Department", "Review Count", "Average Rating"];
    const tableRows = [];
    
    getFilteredReportData().forEach(item => {
      const rowData = [
        transliterate(item.name),
        transliterate(item.position),
        transliterate(item.department),
        item.review_count,
        item.avg_rating === 'N/A' ? '—' : item.avg_rating
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
    doc.save(`Performance_Report_${year}.pdf`);
  };
  
  const exportToExcel = () => {
    if (!report) return;
    
    const worksheet = XLSX.utils.json_to_sheet(getFilteredReportData().map(item => ({
      'Нэр': item.name,
      'Имэйл': item.email,
      'Албан тушаал': item.position,
      'Хэлтэс': item.department,
      'Үнэлгээний тоо': item.review_count,
      'Дундаж үнэлгээ': item.avg_rating === 'N/A' ? 'Үнэлгээгүй' : item.avg_rating,
      'Сүүлийн үнэлгээний огноо': item.latest_review ? new Date(item.latest_review.created_at).toLocaleDateString('mn-MN') : '—'
    })));
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Гүйцэтгэлийн тайлан");
    
    XLSX.writeFile(workbook, `Гүйцэтгэлийн_тайлан_${year}.xlsx`);
  };
  
  // Get filtered report data
  const getFilteredReportData = () => {
    if (!report) return [];
    
    return hideUnratedEmployees 
      ? report.report.filter(item => item.review_count > 0)
      : report.report;
  };
  
  // Prepare chart data
  const getChartData = () => {
    if (!report) return [];
    
    return getFilteredReportData()
      .filter(item => item.avg_rating !== 'N/A')
      .map(item => ({
        name: item.name,
        'Дундаж үнэлгээ': parseFloat(item.avg_rating)
      }));
  };
  
  // Prepare radar chart data
  const getRadarChartData = () => {
    if (!report) return [];
    
    // Group by department and calculate average rating
    const departmentData = {};
    
    getFilteredReportData().forEach(item => {
      if (item.avg_rating !== 'N/A') {
        if (!departmentData[item.department]) {
          departmentData[item.department] = {
            total: 0,
            count: 0
          };
        }
        
        departmentData[item.department].total += parseFloat(item.avg_rating);
        departmentData[item.department].count += 1;
      }
    });
    
    return Object.keys(departmentData).map(dept => ({
      subject: dept,
      A: departmentData[dept].total / departmentData[dept].count,
      fullMark: 5
    }));
  };
  
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Гүйцэтгэлийн тайлан
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
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Жил"
              type="number"
              value={year}
              onChange={handleYearChange}
              InputProps={{ inputProps: { min: 2020, max: 2100 } }}
            />
          </Grid>
          
          <Grid item xs={12} sm={4}>
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
          
          <Grid item xs={12} sm={4}>
            <Button 
              variant="contained" 
              fullWidth
              onClick={generateReport}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Тайлан үүсгэх'}
            </Button>
          </Grid>
          
          {report && (
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={hideUnratedEmployees}
                    onChange={handleHideUnratedChange}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography 
                      variant="body1" 
                      fontWeight={hideUnratedEmployees ? 'bold' : 'normal'}
                      color={hideUnratedEmployees ? 'primary' : 'inherit'}
                    >
                      Үнэлгээгүй ажилтнуудыг харуулахгүй
                    </Typography>
                    {hideUnratedEmployees && (
                      <Chip 
                        size="small" 
                        color="primary" 
                        label={`${report.report.length - getFilteredReportData().length} ажилтан нуугдсан`} 
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Box>
                }
                sx={{ 
                  py: 1,
                  px: 2,
                  mt: 1,
                  border: hideUnratedEmployees ? '1px solid' : 'none',
                  borderColor: 'primary.main',
                  borderRadius: 1,
                  bgcolor: hideUnratedEmployees ? 'action.hover' : 'transparent'
                }}
              />
            </Grid>
          )}
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
              Хугацаа: {report.year} он
            </Typography>
            <Typography variant="body2" gutterBottom>
              Нийт ажилтан: {hideUnratedEmployees 
                ? `${getFilteredReportData().length} (Зөвхөн үнэлгээтэй)` 
                : report.total_employees}
            </Typography>
            
            <Box sx={{ height: 300, mt: 3 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={getChartData()}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Дундаж үнэлгээ" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
            
            {getRadarChartData().length > 0 && (
              <Box sx={{ height: 300, mt: 3 }}>
                <Typography variant="subtitle1" align="center" gutterBottom>
                  Хэлтсүүдийн дундаж үнэлгээ
                </Typography>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={getRadarChartData()}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 5]} />
                    <Radar name="Дундаж үнэлгээ" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Paper>
          
          <Paper sx={{ mb: 3 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Нэр</TableCell>
                    <TableCell>Албан тушаал</TableCell>
                    <TableCell>Хэлтэс</TableCell>
                    <TableCell align="center">Үнэлгээний тоо</TableCell>
                    <TableCell align="center">Дундаж үнэлгээ</TableCell>
                    <TableCell align="center">Сүүлийн үнэлгээ</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getFilteredReportData().map((item) => (
                    <TableRow key={item.user_id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.position}</TableCell>
                      <TableCell>{item.department}</TableCell>
                      <TableCell align="center">{item.review_count}</TableCell>
                      <TableCell align="center">
                        {item.avg_rating !== 'N/A' ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Rating 
                              value={parseFloat(item.avg_rating)} 
                              precision={0.1} 
                              readOnly 
                            />
                            <Typography variant="body2" sx={{ ml: 1 }}>
                              ({item.avg_rating})
                            </Typography>
                          </Box>
                        ) : (
                          'Үнэлгээгүй'
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {item.latest_review ? (
                          <Box>
                            <Chip 
                              label={`${item.latest_review.rating}/5`} 
                              color={
                                item.latest_review.rating >= 4 ? 'success' : 
                                item.latest_review.rating >= 3 ? 'info' : 
                                item.latest_review.rating >= 2 ? 'warning' : 'error'
                              }
                              size="small"
                              sx={{ mb: 1 }}
                            />
                            <Typography variant="caption" display="block">
                              {new Date(item.latest_review.created_at).toLocaleDateString('mn-MN')}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">—</Typography>
                        )}
                      </TableCell>
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

export default PerformanceReport;
