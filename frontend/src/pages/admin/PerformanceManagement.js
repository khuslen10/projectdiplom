import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, Typography, Paper, Button, Alert, CircularProgress,
  Dialog, DialogActions, DialogContent, DialogTitle, TextField, 
  InputAdornment, IconButton, FormControl, InputLabel, Select, MenuItem,
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
  TablePagination, Grid, Chip, Tooltip, Rating
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

// Import our custom components
import PerformanceTable from '../../components/performance/PerformanceTable';
import PerformanceForm from '../../components/performance/PerformanceForm';
import PerformanceView from '../../components/performance/PerformanceView';
import PerformanceRating from '../../components/performance/PerformanceRating';
import ControlledRating from '../../components/performance/ControlledRating';

const PerformanceManagement = () => {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  
  // Dialog states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    user_id: '',
    review_period: '',
    performance_score: 3,
    strengths: '',
    areas_to_improve: '',
    goals: '',
    comments: ''
  });
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Performance score options
  const performanceScores = [
    { value: 1, label: 'Хангалтгүй' },
    { value: 2, label: 'Сайжруулах шаардлагатай' },
    { value: 3, label: 'Хангалттай' },
    { value: 4, label: 'Сайн' },
    { value: 5, label: 'Маш сайн' }
  ];
  
  // Status colors
  const statusColors = {
    pending: 'warning',
    acknowledged: 'success'
  };
  
  // Status translations
  const statusTranslations = {
    pending: 'Хүлээгдэж буй',
    acknowledged: 'Танилцсан'
  };
  
  // Fetch performance reviews and employees
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch performance reviews
        const reviewsRes = await axios.get('/performance');
        setReviews(reviewsRes.data);
        setFilteredReviews(reviewsRes.data);
        
        // Fetch employees
        const employeesRes = await axios.get('/users');
        setEmployees(employeesRes.data);
        
      } catch (err) {
        console.error('Мэдээлэл ачааллахад алдаа гарлаа:', err);
        setError('Мэдээлэл ачааллахад алдаа гарлаа. Дахин оролдоно уу.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Filter reviews when search term or selected employee changes
  useEffect(() => {
    let filtered = [...reviews];
    
    // Filter by search term
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(review => 
        review.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (review.department && review.department.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Filter by selected employee
    if (selectedEmployee) {
      filtered = filtered.filter(review => review.user_id === selectedEmployee);
    }
    
    setFilteredReviews(filtered);
    setPage(0);
  }, [searchTerm, selectedEmployee, reviews]);
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle employee selection change
  const handleEmployeeChange = (e) => {
    setSelectedEmployee(e.target.value);
  };
  
  // Reset filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedEmployee('');
  };
  
  // Handle dialog open/close
  const handleOpenAddDialog = () => {
    setFormData({
      user_id: '',
      review_period: '',
      performance_score: 3,
      strengths: '',
      areas_to_improve: '',
      goals: '',
      comments: ''
    });
    setOpenAddDialog(true);
  };
  
  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
  };
  
  const handleOpenEditDialog = (review) => {
    setSelectedReview(review);
    setFormData({
      user_id: review.user_id,
      review_period: review.review_period,
      performance_score: review.rating || review.performance_score || 0,
      strengths: review.strengths || '',
      areas_to_improve: review.areas_to_improve || '',
      goals: review.goals || '',
      comments: review.comments || ''
    });
    setOpenEditDialog(true);
  };
  
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedReview(null);
  };
  
  const handleOpenViewDialog = (review) => {
    setSelectedReview(review);
    setOpenViewDialog(true);
  };
  
  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setSelectedReview(null);
  };
  
  // Handle form change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  // Handle rating change
  const handleRatingChange = (newValue) => {
    setFormData({ ...formData, performance_score: newValue || 0 });
  };
  
  // Submit add review form
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Prepare data for API - convert performance_score to rating
      const apiData = {
        ...formData,
        rating: formData.performance_score
      };
      
      // Remove performance_score as it's not needed in the API
      delete apiData.performance_score;
      
      const res = await axios.post('/performance', apiData);
      
      // Get employee details
      const employee = employees.find(emp => emp.id === formData.user_id);
      
      // Add new review to the list
      const newReview = {
        id: res.data.reviewId,
        ...formData,
        user_name: employee ? employee.name : 'Тодорхойгүй',
        user_email: employee ? employee.email : 'Тодорхойгүй',
        department: employee ? employee.department : 'Тодорхойгүй',
        status: 'pending',
        created_at: new Date().toISOString(),
        reviewer_name: user.name
      };
      
      const updatedReviews = [...reviews, newReview];
      setReviews(updatedReviews);
      setFilteredReviews(updatedReviews);
      
      // Reset filters
      setSearchTerm('');
      setSelectedEmployee('');
      
      // Close dialog and show success message
      handleCloseAddDialog();
      setSuccess('Гүйцэтгэлийн үнэлгээ амжилттай үүсгэгдлээ');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
    } catch (err) {
      console.error('Гүйцэтгэлийн үнэлгээ үүсгэхэд алдаа гарлаа:', err);
      setError(err.response?.data?.message || 'Гүйцэтгэлийн үнэлгээ үүсгэхэд алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };
  
  // Submit edit review form
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Prepare data for API - convert performance_score to rating
      const apiData = {
        ...formData,
        rating: formData.performance_score
      };
      
      // Remove performance_score as it's not needed in the API
      delete apiData.performance_score;
      
      await axios.put(`/performance/${selectedReview.id}`, apiData);
      
      // Update review in the list
      const updatedReviews = reviews.map(review => {
        if (review.id === selectedReview.id) {
          return { ...review, ...formData };
        }
        return review;
      });
      
      setReviews(updatedReviews);
      setFilteredReviews(updatedReviews);
      
      // Reset filters
      setSearchTerm('');
      setSelectedEmployee('');
      
      // Close dialog and show success message
      handleCloseEditDialog();
      setSuccess('Гүйцэтгэлийн үнэлгээ амжилттай шинэчлэгдлээ');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
    } catch (err) {
      console.error('Гүйцэтгэлийн үнэлгээ шинэчлэхэд алдаа гарлаа:', err);
      setError(err.response?.data?.message || 'Гүйцэтгэлийн үнэлгээ шинэчлэхэд алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('mn-MN');
  };
  
  // Get performance score label
  const getScoreLabel = (score) => {
    const scoreOption = performanceScores.find(s => s.value === score);
    return scoreOption ? scoreOption.label : score;
  };
  
  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  if (loading && !reviews.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Гүйцэтгэлийн удирдлага
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}
      
      {/* Filters and Action Button */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            placeholder="Хайх..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{ width: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <FormControl sx={{ width: 250 }} size="small">
            <InputLabel>Ажилтан</InputLabel>
            <Select
              value={selectedEmployee}
              onChange={handleEmployeeChange}
              label="Ажилтан"
            >
              <MenuItem value="">
                <em>Бүгд</em>
              </MenuItem>
              {employees.map((employee) => (
                <MenuItem key={employee.id} value={employee.id}>
                  {employee.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Button 
            variant="outlined" 
            onClick={handleResetFilters}
          >
            Цэвэрлэх
          </Button>
        </Box>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
        >
          Шинэ үнэлгээ
        </Button>
      </Box>
      
      {/* Reviews Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell>Ажилтан</TableCell>
                <TableCell>Хэлтэс</TableCell>
                <TableCell>Үнэлгээний хугацаа</TableCell>
                <TableCell>Үнэлгээ</TableCell>
                <TableCell>Үнэлсэн огноо</TableCell>
                <TableCell>Төлөв</TableCell>
                <TableCell>Үйлдэл</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredReviews
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((review) => (
                  <TableRow hover key={review.id}>
                    <TableCell>{review.user_name}</TableCell>
                    <TableCell>{review.department || '-'}</TableCell>
                    <TableCell>{review.review_period}</TableCell>
                    <TableCell>
                      <PerformanceRating
                        value={review.rating || review.performance_score || 0}
                        readOnly={true}
                        getScoreLabel={(score) => getScoreLabel(score)}
                        size="small"
                        showLabel={true}
                      />
                    </TableCell>
                    <TableCell>{formatDate(review.created_at)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={statusTranslations[review.status] || review.status} 
                        color={statusColors[review.status] || 'default'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Дэлгэрэнгүй">
                        <IconButton 
                          size="small" 
                          color="primary" 
                          onClick={() => handleOpenViewDialog(review)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Засах">
                        <IconButton 
                          size="small" 
                          color="secondary" 
                          onClick={() => handleOpenEditDialog(review)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              
              {filteredReviews.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    {searchTerm || selectedEmployee ? 'Хайлтад тохирох үнэлгээ олдсонгүй' : 'Үнэлгээ байхгүй байна'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredReviews.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Хуудсанд:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
        />
      </Paper>
      
      {/* Add Review Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="md" fullWidth>
        <DialogTitle>Шинэ гүйцэтгэлийн үнэлгээ</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Ажилтан</InputLabel>
                  <Select
                    name="user_id"
                    value={formData.user_id}
                    onChange={handleChange}
                    label="Ажилтан"
                  >
                    {employees.map((employee) => (
                      <MenuItem key={employee.id} value={employee.id}>
                        {employee.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Үнэлгээний хугацаа"
                  name="review_period"
                  value={formData.review_period}
                  onChange={handleChange}
                  placeholder="Жишээ: 2025 Q1, 2024 Жилийн"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography component="legend">Гүйцэтгэлийн үнэлгээ</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Rating
                    name="performance_score"
                    value={formData.performance_score}
                    onChange={(event, newValue) => {
                      handleRatingChange(newValue);
                    }}
                  />
                  <Typography variant="body2" sx={{ ml: 2 }}>
                    {getScoreLabel(formData.performance_score)}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Давуу талууд"
                  name="strengths"
                  multiline
                  rows={3}
                  value={formData.strengths}
                  onChange={handleChange}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Сайжруулах талууд"
                  name="areas_to_improve"
                  multiline
                  rows={3}
                  value={formData.areas_to_improve}
                  onChange={handleChange}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Зорилтууд"
                  name="goals"
                  multiline
                  rows={3}
                  value={formData.goals}
                  onChange={handleChange}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Нэмэлт тайлбар"
                  name="comments"
                  multiline
                  rows={3}
                  value={formData.comments}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Цуцлах</Button>
          <Button 
            onClick={handleAddSubmit} 
            variant="contained" 
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Үүсгэх'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Review Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="md" fullWidth>
        <DialogTitle>Гүйцэтгэлийн үнэлгээ засах</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Ажилтан</InputLabel>
                  <Select
                    name="user_id"
                    value={formData.user_id}
                    onChange={handleChange}
                    label="Ажилтан"
                    disabled
                  >
                    {employees.map((employee) => (
                      <MenuItem key={employee.id} value={employee.id}>
                        {employee.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Үнэлгээний хугацаа"
                  name="review_period"
                  value={formData.review_period}
                  onChange={handleChange}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography component="legend">Гүйцэтгэлийн үнэлгээ</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Rating
                    name="performance_score"
                    value={formData.performance_score}
                    onChange={(event, newValue) => {
                      handleRatingChange(newValue);
                    }}
                  />
                  <Typography variant="body2" sx={{ ml: 2 }}>
                    {getScoreLabel(formData.performance_score)}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Давуу талууд"
                  name="strengths"
                  multiline
                  rows={3}
                  value={formData.strengths}
                  onChange={handleChange}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Сайжруулах талууд"
                  name="areas_to_improve"
                  multiline
                  rows={3}
                  value={formData.areas_to_improve}
                  onChange={handleChange}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Зорилтууд"
                  name="goals"
                  multiline
                  rows={3}
                  value={formData.goals}
                  onChange={handleChange}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Нэмэлт тайлбар"
                  name="comments"
                  multiline
                  rows={3}
                  value={formData.comments}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Цуцлах</Button>
          <Button 
            onClick={handleEditSubmit} 
            variant="contained" 
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Хадгалах'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* View Review Dialog */}
      {selectedReview && (
        <Dialog open={openViewDialog} onClose={handleCloseViewDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                Гүйцэтгэлийн үнэлгээний дэлгэрэнгүй
              </Typography>
              <Chip 
                label={statusTranslations[selectedReview.status] || selectedReview.status} 
                color={statusColors[selectedReview.status] || 'default'} 
              />
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Ажилтан:</Typography>
                  <Typography variant="body1">{selectedReview.user_name}</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Имэйл:</Typography>
                  <Typography variant="body1">{selectedReview.user_email}</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Хэлтэс:</Typography>
                  <Typography variant="body1">{selectedReview.department || 'Тодорхойгүй'}</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Үнэлгээний хугацаа:</Typography>
                  <Typography variant="body1">{selectedReview.review_period}</Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Гүйцэтгэлийн үнэлгээ:</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Rating value={selectedReview.rating || selectedReview.performance_score || 0} readOnly precision={1} />
                    <Typography variant="body1" sx={{ ml: 1 }}>
                      ({getScoreLabel(selectedReview.rating || selectedReview.performance_score || 0)})
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Давуу талууд:</Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {selectedReview.strengths || 'Тодорхойгүй'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Сайжруулах талууд:</Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {selectedReview.areas_to_improve || 'Тодорхойгүй'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Зорилтууд:</Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {selectedReview.goals || 'Тодорхойгүй'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Нэмэлт тайлбар:</Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {selectedReview.comments || 'Тодорхойгүй'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Үнэлсэн:</Typography>
                  <Typography variant="body1">{selectedReview.reviewer_name || user.name}</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Үнэлсэн огноо:</Typography>
                  <Typography variant="body1">{formatDate(selectedReview.created_at)}</Typography>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseViewDialog}>Хаах</Button>
            <Button 
              onClick={() => {
                handleCloseViewDialog();
                handleOpenEditDialog(selectedReview);
              }} 
              color="primary"
              variant="contained"
            >
              Засах
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default PerformanceManagement;
