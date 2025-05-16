import React from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, IconButton, Chip, TablePagination, Box
} from '@mui/material';
import {
  Edit as EditIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import PerformanceRating from './PerformanceRating';

const PerformanceTable = ({
  filteredReviews,
  page,
  rowsPerPage,
  handleOpenViewDialog,
  handleOpenEditDialog,
  formatDate,
  getScoreLabel,
  statusColors,
  statusTranslations,
  loading,
  handleChangePage,
  handleChangeRowsPerPage
}) => {
  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', mt: 3 }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Ажилтан</TableCell>
              <TableCell>Хэлтэс</TableCell>
              <TableCell>Үнэлгээний хугацаа</TableCell>
              <TableCell>Үнэлгээ</TableCell>
              <TableCell>Үүсгэсэн огноо</TableCell>
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
                      value={Number(review.performance_score || review.rating || 0)}
                      readOnly={true}
                      getScoreLabel={getScoreLabel}
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
                    <Box>
                      <IconButton 
                        size="small" 
                        color="primary" 
                        onClick={() => handleOpenViewDialog(review)}
                        disabled={loading}
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="warning" 
                        onClick={() => handleOpenEditDialog(review)}
                        disabled={loading}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={filteredReviews.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Хуудсанд:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
      />
    </Paper>
  );
};

export default PerformanceTable;
