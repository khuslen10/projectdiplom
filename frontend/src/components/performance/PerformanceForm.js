import React from 'react';
import { 
  Box, Typography, Grid, TextField, FormControl, 
  InputLabel, Select, MenuItem, Button, CircularProgress 
} from '@mui/material';
import PerformanceRating from './PerformanceRating';

const PerformanceForm = ({
  formData,
  handleChange,
  handleSubmit,
  handleRatingChange,
  employees,
  getScoreLabel,
  loading,
  isEdit = false,
  onCancel
}) => {
  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        <Grid sx={{ width: { xs: '100%', sm: '50%' }, p: 1 }}>
          <FormControl fullWidth required>
            <InputLabel>Ажилтан</InputLabel>
            <Select
              name="user_id"
              value={formData.user_id}
              onChange={handleChange}
              label="Ажилтан"
              disabled={isEdit}
            >
              {employees.map((employee) => (
                <MenuItem key={employee.id} value={employee.id}>
                  {employee.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid sx={{ width: { xs: '100%', sm: '50%' }, p: 1 }}>
          <TextField
            fullWidth
            required
            label="Үнэлгээний хугацаа"
            name="review_period"
            value={formData.review_period}
            onChange={handleChange}
            placeholder="Жишээ: 2023 Q1"
          />
        </Grid>
        
        <Grid sx={{ width: '100%', p: 1 }}>
          <Typography component="legend">Гүйцэтгэлийн үнэлгээ</Typography>
          <PerformanceRating
            value={formData.performance_score}
            onChange={handleRatingChange}
            getScoreLabel={getScoreLabel}
          />
        </Grid>
        
        <Grid sx={{ width: '100%', p: 1 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Давуу талууд"
            name="strengths"
            value={formData.strengths}
            onChange={handleChange}
            placeholder="Ажилтны давуу талуудыг бичнэ үү"
          />
        </Grid>
        
        <Grid sx={{ width: '100%', p: 1 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Сайжруулах талууд"
            name="areas_to_improve"
            value={formData.areas_to_improve}
            onChange={handleChange}
            placeholder="Ажилтны сайжруулах шаардлагатай талуудыг бичнэ үү"
          />
        </Grid>
        
        <Grid sx={{ width: '100%', p: 1 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Зорилтууд"
            name="goals"
            value={formData.goals}
            onChange={handleChange}
            placeholder="Дараагийн хугацаанд хүрэх зорилтуудыг бичнэ үү"
          />
        </Grid>
        
        <Grid sx={{ width: '100%', p: 1 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Нэмэлт тайлбар"
            name="comments"
            value={formData.comments}
            onChange={handleChange}
            placeholder="Нэмэлт тайлбар, санал зөвлөмж бичнэ үү"
          />
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button onClick={onCancel} disabled={loading}>
          Цуцлах
        </Button>
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : isEdit ? 'Хадгалах' : 'Үүсгэх'}
        </Button>
      </Box>
    </Box>
  );
};

export default PerformanceForm;
