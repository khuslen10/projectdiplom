import React from 'react';
import { Rating, Box, Typography } from '@mui/material';

/**
 * A controlled Rating component that ensures the value is always defined
 * This prevents the warning about switching between controlled and uncontrolled states
 */
const ControlledRating = ({ value, onChange, label, getScoreLabel, readOnly = false }) => {
  // Ensure value is always defined (0 if null or undefined)
  const safeValue = value || 0;
  
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
        precision={1}
      />
      {getScoreLabel && (
        <Typography variant={readOnly ? "body1" : "body2"} sx={{ ml: readOnly ? 1 : 2 }}>
          {getScoreLabel(safeValue)}
        </Typography>
      )}
    </Box>
  );
};

export default ControlledRating;
