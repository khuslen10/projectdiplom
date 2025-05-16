import React from 'react';
import { Box, Rating, Typography } from '@mui/material';

/**
 * ControlledRating - A wrapper around Material UI's Rating component
 * that adds support for a label display
 * 
 * @param {Object} props - Component props
 * @param {number} props.value - The rating value (1-5)
 * @param {boolean} props.readOnly - Whether the rating is read-only
 * @param {Function} props.getScoreLabel - Function to get label text for a score
 * @param {Function} props.onChange - Handler for rating changes
 * @param {Object} props.sx - Additional styles
 */
const ControlledRating = ({ 
  value = 0, 
  readOnly = false, 
  getScoreLabel, 
  onChange,
  precision = 1,
  sx = {},
  ...props 
}) => {
  // Handle rating change if not readOnly
  const handleChange = (event, newValue) => {
    if (!readOnly && onChange) {
      onChange(newValue);
    }
  };

  // The label to display next to the rating
  const scoreLabel = getScoreLabel ? getScoreLabel(value) : '';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', ...sx }}>
      <Rating
        value={value}
        readOnly={readOnly}
        onChange={handleChange}
        precision={precision}
        {...props}
      />
      {scoreLabel && (
        <Typography variant="body2" sx={{ ml: 1 }}>
          {scoreLabel}
        </Typography>
      )}
    </Box>
  );
};

export default ControlledRating; 