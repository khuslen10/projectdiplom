import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, Typography, Paper, Grid, CircularProgress, 
  Rating, Divider, Card, CardContent, LinearProgress,
  Chip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

const PerformanceStats = ({ userId }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentReviews, setRecentReviews] = useState([]);
  
  // Fetch performance statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // If no userId is provided, use the current user's ID
        const targetUserId = userId || user.id;
        
        // Fetch performance stats
        const statsRes = await axios.get(`/performance/stats/${targetUserId}`);
        setStats(statsRes.data);
        
        // Fetch recent reviews
        const reviewsRes = await axios.get(`/performance/user/${targetUserId}?limit=3`);
        setRecentReviews(reviewsRes.data);
        
      } catch (err) {
        console.error('Гүйцэтгэлийн статистик ачааллахад алдаа гарлаа:', err);
        setError('Мэдээлэл ачааллахад алдаа гарлаа. Дахин оролдоно уу.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [userId, user.id]);
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('mn-MN');
  };
  
  // Get trend icon based on ratings
  const getTrendIcon = (reviews) => {
    if (!reviews || reviews.length < 2) return <TrendingFlatIcon />;
    
    const sortedReviews = [...reviews].sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );
    
    const latestRating = sortedReviews[0].rating;
    const previousRating = sortedReviews[1].rating;
    
    if (latestRating > previousRating) {
      return <TrendingUpIcon color="success" />;
    } else if (latestRating < previousRating) {
      return <TrendingDownIcon color="error" />;
    } else {
      return <TrendingFlatIcon color="info" />;
    }
  };
  
  // Get performance level label
  const getPerformanceLevel = (rating) => {
    if (!rating) return 'Тодорхойгүй';
    
    if (rating >= 4.5) return 'Онцлох';
    if (rating >= 3.5) return 'Сайн';
    if (rating >= 2.5) return 'Хангалттай';
    if (rating >= 1.5) return 'Сайжруулах шаардлагатай';
    return 'Хангалтгүй';
  };
  
  // Calculate completion percentage
  const getCompletionPercentage = () => {
    if (!stats) return 0;
    
    const { total_reviews, acknowledged_reviews } = stats;
    if (!total_reviews) return 100;
    
    return Math.round((acknowledged_reviews / total_reviews) * 100);
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
      <Paper sx={{ p: 3, bgcolor: '#fff9f9' }}>
        <Typography color="error">{error}</Typography>
      </Paper>
    );
  }
  
  return (
    <Box>
      {stats && (
        <Grid container spacing={3}>
          {/* Summary Card */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Гүйцэтгэлийн үнэлгээний дүгнэлт
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Дундаж үнэлгээ
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Rating 
                        value={stats.average_rating || 0} 
                        precision={0.5} 
                        readOnly 
                      />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        ({stats.average_rating?.toFixed(1) || 0}/5)
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Chip 
                    label={getPerformanceLevel(stats.average_rating)} 
                    color={stats.average_rating >= 3.5 ? "success" : 
                           stats.average_rating >= 2.5 ? "primary" : "warning"}
                  />
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Нийт үнэлгээ
                    </Typography>
                    <Typography variant="h6">
                      {stats.total_reviews || 0}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Баталгаажуулсан
                    </Typography>
                    <Typography variant="h6">
                      {stats.acknowledged_reviews || 0}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Баталгаажуулалтын хувь: {getCompletionPercentage()}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={getCompletionPercentage()} 
                      sx={{ height: 8, borderRadius: 1 }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Trend Card */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Гүйцэтгэлийн чиг хандлага
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body1" sx={{ mr: 1 }}>
                    Сүүлийн үнэлгээний чиг хандлага:
                  </Typography>
                  {getTrendIcon(recentReviews)}
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Хамгийн өндөр үнэлгээ
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Rating value={stats.highest_rating || 0} readOnly size="small" />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        ({stats.highest_rating || 0})
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Хамгийн бага үнэлгээ
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Rating value={stats.lowest_rating || 0} readOnly size="small" />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        ({stats.lowest_rating || 0})
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Recent Reviews */}
          {recentReviews.length > 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Сүүлийн үнэлгээнүүд
                </Typography>
                
                <Grid container spacing={2}>
                  {recentReviews.map((review) => (
                    <Grid item xs={12} sm={4} key={review.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle2">
                            {review.review_period}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', my: 1 }}>
                            <Rating value={review.rating} precision={0.5} readOnly size="small" />
                            <Typography variant="body2" sx={{ ml: 1 }}>
                              ({review.rating}/5)
                            </Typography>
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary">
                            Үнэлсэн: {review.reviewer_name}
                          </Typography>
                          
                          <Typography variant="body2" color="text.secondary">
                            Огноо: {formatDate(review.created_at)}
                          </Typography>
                          
                          <Chip 
                            size="small"
                            label={review.status === 'draft' ? 'Ноорог' : 
                                  review.status === 'submitted' ? 'Илгээсэн' : 'Баталгаажуулсан'}
                            color={review.status === 'acknowledged' ? 'success' : 
                                  review.status === 'submitted' ? 'warning' : 'default'}
                            sx={{ mt: 1 }}
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
};

export default PerformanceStats;
