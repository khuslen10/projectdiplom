import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Alert, CircularProgress, Grid, Card, CardContent,
  Divider, TablePagination, Chip
} from '@mui/material';
import {
  Timeline, TimelineItem, TimelineSeparator, TimelineConnector, 
  TimelineContent, TimelineDot, TimelineOppositeContent
} from '@mui/lab';
import {
  History as HistoryIcon,
  Add as AddIcon,
  Build as BuildIcon,
  BugReport as BugIcon
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

const Changelog = () => {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [changelogs, setChangelogs] = useState([]);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Type colors and icons
  const typeConfig = {
    feature: { color: 'success', icon: <AddIcon />, label: 'Шинэ боломж' },
    update: { color: 'primary', icon: <BuildIcon />, label: 'Шинэчлэл' },
    fix: { color: 'error', icon: <BugIcon />, label: 'Засвар' }
  };
  
  // Fetch changelog data
  useEffect(() => {
    const fetchChangelogs = async () => {
      try {
        setLoading(true);
        
        const res = await axios.get('/changelog');
        setChangelogs(res.data);
        
      } catch (err) {
        console.error('Өөрчлөлтийн түүх ачааллахад алдаа гарлаа:', err);
        setError('Мэдээлэл ачааллахад алдаа гарлаа. Дахин оролдоно уу.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchChangelogs();
  }, []);
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('mn-MN');
  };
  
  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' });
  };
  
  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  if (loading && !changelogs.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Өөрчлөлтийн түүх
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {/* Timeline View */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <HistoryIcon sx={{ mr: 1 }} />
          Сүүлийн өөрчлөлтүүд
        </Typography>
        
        <Timeline position="alternate">
          {changelogs.slice(0, 5).map((log) => (
            <TimelineItem key={log.id}>
              <TimelineOppositeContent color="text.secondary">
                {formatDate(log.created_at)}, {formatTime(log.created_at)}
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot color={typeConfig[log.type]?.color || 'grey'}>
                  {typeConfig[log.type]?.icon || <HistoryIcon />}
                </TimelineDot>
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <Paper elevation={3} sx={{ p: 2 }}>
                  <Typography variant="h6" component="span">
                    {log.title}
                  </Typography>
                  <Typography>{log.description}</Typography>
                  {log.creator_name && (
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Үүсгэсэн: {log.creator_name}
                    </Typography>
                  )}
                </Paper>
              </TimelineContent>
            </TimelineItem>
          ))}
          
          {changelogs.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="body1">
                Өөрчлөлтийн түүх хоосон байна
              </Typography>
            </Box>
          )}
        </Timeline>
      </Paper>
      
      {/* Table View */}
      <Typography variant="h6" gutterBottom>
        Бүх өөрчлөлтүүд
      </Typography>
      
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell>Огноо</TableCell>
                <TableCell>Гарчиг</TableCell>
                <TableCell>Төрөл</TableCell>
                <TableCell>Тайлбар</TableCell>
                <TableCell>Үүсгэсэн</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {changelogs
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((log) => (
                  <TableRow hover key={log.id}>
                    <TableCell>{formatDate(log.created_at)}</TableCell>
                    <TableCell>{log.title}</TableCell>
                    <TableCell>
                      <Chip 
                        label={typeConfig[log.type]?.label || log.type} 
                        color={typeConfig[log.type]?.color || 'default'} 
                        size="small" 
                        icon={typeConfig[log.type]?.icon}
                      />
                    </TableCell>
                    <TableCell>{log.description}</TableCell>
                    <TableCell>{log.creator_name || 'Систем'}</TableCell>
                  </TableRow>
                ))}
              
              {changelogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Өөрчлөлтийн түүх хоосон байна
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={changelogs.length}
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

export default Changelog;
