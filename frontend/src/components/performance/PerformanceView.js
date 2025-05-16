import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import PerformanceRating from './PerformanceRating';

const PerformanceView = ({
  review,
  formatDate,
  getScoreLabel,
  user
}) => {
  if (!review) return null;
  
  return (
    <Box sx={{ p: 1 }}>
      <Grid container spacing={2}>
        <Grid sx={{ width: { xs: '100%', sm: '50%' }, p: 1 }}>
          <Typography variant="subtitle2">Ажилтан:</Typography>
          <Typography variant="body1">{review.user_name}</Typography>
        </Grid>
        
        <Grid sx={{ width: { xs: '100%', sm: '50%' }, p: 1 }}>
          <Typography variant="subtitle2">Имэйл:</Typography>
          <Typography variant="body1">{review.user_email}</Typography>
        </Grid>
        
        <Grid sx={{ width: { xs: '100%', sm: '50%' }, p: 1 }}>
          <Typography variant="subtitle2">Хэлтэс:</Typography>
          <Typography variant="body1">{review.department || 'Тодорхойгүй'}</Typography>
        </Grid>
        
        <Grid sx={{ width: { xs: '100%', sm: '50%' }, p: 1 }}>
          <Typography variant="subtitle2">Үнэлгээний хугацаа:</Typography>
          <Typography variant="body1">{review.review_period}</Typography>
        </Grid>
        
        <Grid sx={{ width: '100%', p: 1 }}>
          <Typography variant="subtitle2">Гүйцэтгэлийн үнэлгээ:</Typography>
          <PerformanceRating
            value={review.performance_score}
            readOnly={true}
            getScoreLabel={getScoreLabel}
          />
        </Grid>
        
        <Grid sx={{ width: '100%', p: 1 }}>
          <Typography variant="subtitle2">Давуу талууд:</Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
            {review.strengths || 'Тодорхойгүй'}
          </Typography>
        </Grid>
        
        <Grid sx={{ width: '100%', p: 1 }}>
          <Typography variant="subtitle2">Сайжруулах талууд:</Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
            {review.areas_to_improve || 'Тодорхойгүй'}
          </Typography>
        </Grid>
        
        <Grid sx={{ width: '100%', p: 1 }}>
          <Typography variant="subtitle2">Зорилтууд:</Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
            {review.goals || 'Тодорхойгүй'}
          </Typography>
        </Grid>
        
        <Grid sx={{ width: '100%', p: 1 }}>
          <Typography variant="subtitle2">Нэмэлт тайлбар:</Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
            {review.comments || 'Тодорхойгүй'}
          </Typography>
        </Grid>
        
        <Grid sx={{ width: { xs: '100%', sm: '50%' }, p: 1 }}>
          <Typography variant="subtitle2">Үнэлсэн:</Typography>
          <Typography variant="body1">{review.reviewer_name || user.name}</Typography>
        </Grid>
        
        <Grid sx={{ width: { xs: '100%', sm: '50%' }, p: 1 }}>
          <Typography variant="subtitle2">Үнэлсэн огноо:</Typography>
          <Typography variant="body1">{formatDate(review.created_at)}</Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PerformanceView;
