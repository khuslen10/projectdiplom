import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab, Paper } from '@mui/material';
import AttendanceReport from './AttendanceReport';
import PerformanceReport from './PerformanceReport';
import SalaryReport from './SalaryReport';
import { useAuth } from '../../hooks/useAuth';

// TabPanel component for tabs
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Reports = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Check if user has access to reports
  if (user?.role !== 'admin' && user?.role !== 'manager') {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" color="error">
          Хандах эрхгүй
        </Typography>
        <Typography variant="body1">
          Энэ хуудсанд зөвхөн админ болон менежер эрхтэй хэрэглэгч хандах боломжтой.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Тайлан, статистик
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Ирцийн тайлан" />
          <Tab label="Гүйцэтгэлийн тайлан" />
          <Tab label="Цалингийн тайлан" />
        </Tabs>
      </Paper>

      <TabPanel value={tabValue} index={0}>
        <AttendanceReport />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <PerformanceReport />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <SalaryReport />
      </TabPanel>
    </Box>
  );
};

export default Reports;
