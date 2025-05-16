import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Alert, CircularProgress, Grid, Card, CardContent,
  Divider, TablePagination, Chip
} from '@mui/material';
import {
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

const Salary = () => {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSalary, setCurrentSalary] = useState(null);
  const [salaryHistory, setSalaryHistory] = useState([]);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Mock data for when API fails
  const getMockSalaryData = () => {
    const today = new Date();
    
    // Current salary
    const mockCurrentSalary = {
      id: 1,
      user_id: user.id,
      base_salary: 1500000,
      bonus: 200000,
      deductions: 50000,
      effective_date: today.toISOString().split('T')[0],
      name: user.name,
      position: user.position || 'Менежер',
      department: user.department || 'Хүний нөөц'
    };
    
    // Historical salary records
    const threeMonthsAgo = new Date(today);
    threeMonthsAgo.setMonth(today.getMonth() - 3);
    
    const sixMonthsAgo = new Date(today);
    sixMonthsAgo.setMonth(today.getMonth() - 6);
    
    const mockSalaryHistory = [
      { ...mockCurrentSalary },
      {
        id: 2,
        user_id: user.id,
        base_salary: 1400000,
        bonus: 150000,
        deductions: 45000,
        effective_date: threeMonthsAgo.toISOString().split('T')[0],
        name: user.name,
        position: user.position || 'Менежер',
        department: user.department || 'Хүний нөөц'
      },
      {
        id: 3,
        user_id: user.id,
        base_salary: 1300000,
        bonus: 100000,
        deductions: 40000,
        effective_date: sixMonthsAgo.toISOString().split('T')[0],
        name: user.name,
        position: user.position || 'Менежер',
        department: user.department || 'Хүний нөөц'
      }
    ];
    
    return { mockCurrentSalary, mockSalaryHistory };
  };
  
  // Fetch salary data
  useEffect(() => {
    const fetchSalaryData = async () => {
      try {
        setLoading(true);
        
        // Get current salary
        const currentRes = await axios.get('/salary/me/current');
        setCurrentSalary(currentRes.data);
        
        // Get salary history
        const historyRes = await axios.get('/salary/me');
        setSalaryHistory(historyRes.data);
        
      } catch (err) {
        console.error('Цалингийн мэдээлэл ачааллахад алдаа гарлаа:', err);
        setError('Мэдээлэл ачааллахад алдаа гарлаа. Түр хугацаанд жишээ өгөгдөл харуулж байна.');
        
        // Use mock data when API fails
        const { mockCurrentSalary, mockSalaryHistory } = getMockSalaryData();
        setCurrentSalary(mockCurrentSalary);
        setSalaryHistory(mockSalaryHistory);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSalaryData();
  }, [user]);
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('mn-MN');
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    // Handle null, undefined, or NaN values
    if (amount === null || amount === undefined || isNaN(parseFloat(amount))) {
      return '0 ₮';
    }
    return new Intl.NumberFormat('mn-MN', { 
      style: 'currency', 
      currency: 'MNT',
      maximumFractionDigits: 0
    }).format(parseFloat(amount));
  };
  
  // Calculate net salary
  const calculateNetSalary = (salary) => {
    if (!salary) return 0;
    const baseSalary = parseFloat(salary.base_salary) || 0;
    const bonus = parseFloat(salary.bonus) || 0;
    const deductions = parseFloat(salary.deductions) || 0;
    return baseSalary + bonus - deductions;
  };
  
  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  if (loading && !currentSalary) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Цалингийн мэдээлэл
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {!currentSalary && !loading && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Цалингийн мэдээлэл бүртгэгдээгүй байна
        </Alert>
      )}
      
      {/* Current Salary Card */}
      {currentSalary && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <MoneyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Одоогийн цалин
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Үндсэн цалин
                  </Typography>
                  <Typography variant="h5">
                    {formatCurrency(currentSalary.base_salary)}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Хэрэгжүүлэх огноо
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(currentSalary.effective_date)}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Урамшуулал
                  </Typography>
                  <Typography variant="body1" color="success.main" sx={{ display: 'flex', alignItems: 'center' }}>
                    <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                    {formatCurrency(currentSalary.bonus || 0)}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Суутгал
                  </Typography>
                  <Typography variant="body1" color="error.main" sx={{ display: 'flex', alignItems: 'center' }}>
                    <TrendingDownIcon fontSize="small" sx={{ mr: 0.5 }} />
                    {formatCurrency(currentSalary.deductions || 0)}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Divider />
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body1" fontWeight="bold">
                    Нийт цалин:
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {formatCurrency(calculateNetSalary(currentSalary))}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
      
      {/* Salary History */}
      <Typography variant="h6" gutterBottom>
        Цалингийн түүх
      </Typography>
      
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell>Хэрэгжүүлэх огноо</TableCell>
                <TableCell>Үндсэн цалин</TableCell>
                <TableCell>Урамшуулал</TableCell>
                <TableCell>Суутгал</TableCell>
                <TableCell>Нийт цалин</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {salaryHistory
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((salary) => (
                  <TableRow hover key={salary.id}>
                    <TableCell>{formatDate(salary.effective_date)}</TableCell>
                    <TableCell>{formatCurrency(salary.base_salary)}</TableCell>
                    <TableCell>
                      {salary.bonus > 0 ? (
                        <Typography color="success.main" sx={{ display: 'flex', alignItems: 'center' }}>
                          <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                          {formatCurrency(salary.bonus)}
                        </Typography>
                      ) : (
                        formatCurrency(0)
                      )}
                    </TableCell>
                    <TableCell>
                      {salary.deductions > 0 ? (
                        <Typography color="error.main" sx={{ display: 'flex', alignItems: 'center' }}>
                          <TrendingDownIcon fontSize="small" sx={{ mr: 0.5 }} />
                          {formatCurrency(salary.deductions)}
                        </Typography>
                      ) : (
                        formatCurrency(0)
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="bold">
                        {formatCurrency(calculateNetSalary(salary))}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              
              {salaryHistory.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Цалингийн түүх хоосон байна
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={salaryHistory.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Хуудсанд:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
        />
      </Paper>
    </Box>
  );
};

export default Salary;
