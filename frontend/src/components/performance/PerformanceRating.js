import React from 'react';
import { Box, Typography, Rating } from '@mui/material';
import { Star as StarIcon } from '@mui/icons-material';

/**
 * A controlled Rating component for performance reviews
 */
const PerformanceRating = ({ 
  value, 
  onChange, 
  readOnly = false, 
  getScoreLabel,
  showLabel = true,
  size = 'medium'
}) => {
  // Ensure value is always defined (0 if null or undefined) and is a number
  const safeValue = Number(value || 0);
  
  // Handle rating change with a safe value
  const handleChange = (event, newValue) => {
    if (onChange) {
      onChange(newValue || 0);
    }
  };
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Rating
        value={safeValue}
        onChange={readOnly ? undefined : handleChange}
        readOnly={readOnly}
        precision={0.5}
        size={size}
        icon={<StarIcon fontSize={size} />}
        emptyIcon={<StarIcon fontSize={size} style={{ opacity: 0.55 }} />}
      />
      {showLabel && (
        <Typography variant="body2" sx={{ ml: readOnly ? 1 : 2 }}>
          {getScoreLabel ? 
            (readOnly ? `(${getScoreLabel(safeValue)})` : getScoreLabel(safeValue)) : 
            `(${safeValue.toFixed(1)})`
          }
        </Typography>
      )}
    </Box>
  );
};

export default PerformanceRating;
