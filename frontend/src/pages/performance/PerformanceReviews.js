import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, Alert, CircularProgress, Grid,
  Card, CardContent, Dialog, DialogActions, DialogContent, 
  DialogTitle, Rating, Chip, TablePagination, Divider
} from '@mui/material';
import {
  Star as StarIcon,
  Visibility as ViewIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

const PerformanceReviews = () => {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  
  // Хуудаслалт
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Төлвийн өнгө
  const statusColors = {
    draft: 'default',
    submitted: 'warning',
    acknowledged: 'success'
  };
  
  // Төлвийн орчуулга
  const statusTranslations = {
    draft: 'Ноорог',
    submitted: 'Илгээсэн',
    acknowledged: 'Баталгаажуулсан'
  };
  
  // Гүйцэтгэлийн үнэлгээг татах
  useEffect(() => {
    const fetchPerformanceReviews = async () => {
      try {
        setLoading(true);
        
        const res = await axios.get('/performance/me');
    
    // Convert rating to performance_score for frontend compatibility
    const reviewsWithPerformanceScore = res.data.map(review => ({
      ...review,
      performance_score: review.rating
    }));
    
    setReviews(reviewsWithPerformanceScore);
        
      } catch (err) {
        console.error('Гүйцэтгэлийн үнэлгээ ачааллахад алдаа гарлаа:', err);
        setError('Мэдээлэл ачааллахад алдаа гарлаа. Дахин оролдоно уу.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPerformanceReviews();
  }, []);
  
  // Харах харилцах цонхыг удирдах
  const handleViewReview = (review) => {
    setSelectedReview(review);
    setViewDialog(true);
  };
  
  const handleCloseViewDialog = () => {
    setViewDialog(false);
    setSelectedReview(null);
  };
  
  // Үнэлгээг баталгаажуулах
  const handleAcknowledge = async (id) => {
    try {
      setLoading(true);
      
      await axios.put(`/performance/${id}/acknowledge`);
      
      // Жагсаалт дахь үнэлгээний төлөвийг шинэчлэх
      const updatedReviews = reviews.map(review => {
        if (review.id === id) {
          return { ...review, status: 'acknowledged' };
        }
        return review;
      });
      
      setReviews(updatedReviews);
      
      // Хэрэв нээлттэй бол сонгосон үнэлгээг шинэчлэх
      if (selectedReview && selectedReview.id === id) {
        setSelectedReview({ ...selectedReview, status: 'acknowledged' });
      }
      
      setSuccess('Гүйцэтгэлийн үнэлгээ амжилттай баталгаажууллаа');
      
      // Амжилттай мессежийг 3 секундын дараа арилгах
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
    } catch (err) {
      console.error('Гүйцэтгэлийн үнэлгээ баталгаажуулахад алдаа гарлаа:', err);
      setError(err.response?.data?.message || 'Гүйцэтгэлийн үнэлгээ баталгаажуулахад алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };
  
  // Огноог форматлах
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('mn-MN');
  };
  
  // Хуудаслалтыг удирдах
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
        Гүйцэтгэлийн үнэлгээ
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
      
      {/* Performance Reviews Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell>Үнэлгээний хугацаа</TableCell>
                <TableCell>Үнэлсэн</TableCell>
                <TableCell>Үнэлгээ</TableCell>
                <TableCell>Төлөв</TableCell>
                <TableCell>Үүсгэсэн огноо</TableCell>
                <TableCell>Үйлдэл</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reviews
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((review) => (
                  <TableRow hover key={review.id}>
                    <TableCell>{review.review_period}</TableCell>
                    <TableCell>{review.reviewer_name}</TableCell>
                    <TableCell>
                      <Rating 
                        value={review.performance_score || review.rating} 
                        readOnly 
                        precision={0.5}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={statusTranslations[review.status] || review.status} 
                        color={statusColors[review.status] || 'default'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>{formatDate(review.created_at)}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        startIcon={<ViewIcon />}
                        onClick={() => handleViewReview(review)}
                      >
                        Харах
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              
              {reviews.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Гүйцэтгэлийн үнэлгээ байхгүй байна
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={reviews.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Хуудсанд:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
        />
      </Paper>
      
      {/* View Performance Review Dialog */}
      {selectedReview && (
        <Dialog open={viewDialog} onClose={handleCloseViewDialog} maxWidth="md" fullWidth>
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
                  <Typography variant="subtitle2">Үнэлгээний хугацаа:</Typography>
                  <Typography variant="body1">{selectedReview.review_period}</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Үнэлсэн:</Typography>
                  <Typography variant="body1">{selectedReview.reviewer_name}</Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Үнэлгээ:</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Rating 
                      value={selectedReview.performance_score || selectedReview.rating} 
                      readOnly 
                      precision={0.5}
                    />
                    <Typography variant="body1" sx={{ ml: 1 }}>
                      ({selectedReview.performance_score || selectedReview.rating}/5)
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Давуу талууд:</Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {selectedReview.strengths || 'Мэдээлэл оруулаагүй байна'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Сайжруулах талууд:</Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {selectedReview.areas_to_improve || 'Мэдээлэл оруулаагүй байна'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Зорилтууд:</Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {selectedReview.goals || 'Мэдээлэл оруулаагүй байна'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Нэмэлт тайлбар:</Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {selectedReview.comments || 'Мэдээлэл оруулаагүй байна'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Үүсгэсэн огноо:</Typography>
                  <Typography variant="body1">{formatDate(selectedReview.created_at)}</Typography>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseViewDialog}>Хаах</Button>
            
            {selectedReview.status === 'submitted' && (
              <Button 
                onClick={() => {
                  handleAcknowledge(selectedReview.id);
                }} 
                variant="contained"
                color="primary"
                startIcon={<CheckIcon />}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Баталгаажуулах'}
              </Button>
            )}
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default PerformanceReviews;
