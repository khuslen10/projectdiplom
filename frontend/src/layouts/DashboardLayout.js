import React, { useState } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { 
  AppBar, Box, Toolbar, IconButton, Typography, Drawer, List, ListItem, 
  ListItemIcon, ListItemText, Divider, Avatar, Menu, MenuItem, Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  EventNote as AttendanceIcon,
  EventAvailable as LeaveIcon,
  Assessment as PerformanceIcon,
  AttachMoney as SalaryIcon,
  History as ChangelogIcon,
  People as UsersIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

// Drawer width
const drawerWidth = 240;

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  
  // Handle drawer toggle
  const toggleDrawer = () => {
    setOpen(!open);
  };
  
  // Handle profile menu
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Menu items based on user role
  const menuItems = [
    { text: 'Хянах самбар', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Профайл', icon: <PersonIcon />, path: '/dashboard/profile' },
    { text: 'Ирц бүртгэл', icon: <AttendanceIcon />, path: '/dashboard/attendance' },
    { text: 'Чөлөөний хүсэлт', icon: <LeaveIcon />, path: '/dashboard/leave' },
    { text: 'Гүйцэтгэлийн үнэлгээ', icon: <PerformanceIcon />, path: '/dashboard/performance' },
    { text: 'Цалингийн мэдээлэл', icon: <SalaryIcon />, path: '/dashboard/salary' },
    // Changelog removed from navigation menu
  ];
  
  // Admin menu items
  const adminMenuItems = [
    { text: 'Хэрэглэгчийн удирдлага', icon: <UsersIcon />, path: '/dashboard/admin/users', roles: ['admin'] },
    { text: 'Ирцийн удирдлага', icon: <AttendanceIcon />, path: '/dashboard/admin/attendance', roles: ['admin', 'manager'] },
    { text: 'Чөлөөний удирдлага', icon: <LeaveIcon />, path: '/dashboard/admin/leave', roles: ['admin', 'manager'] },
    { text: 'Гүйцэтгэлийн удирдлага', icon: <PerformanceIcon />, path: '/dashboard/admin/performance', roles: ['admin', 'manager'] },
    { text: 'Цалингийн удирдлага', icon: <SalaryIcon />, path: '/dashboard/admin/salary', roles: ['admin'] },
    { text: 'Тайлан', icon: <AssessmentIcon />, path: '/dashboard/reports', roles: ['admin', 'manager'] },
  ];
  
  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={toggleDrawer}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Ажилтны удирдлагын систем
          </Typography>
          
          {/* User profile */}
          <Tooltip title="Профайл">
            <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0 }}>
              <Avatar alt={user?.name} src="/static/images/avatar/1.jpg" />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 1.5,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem component={Link} to="/dashboard/profile">
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              Профайл
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Гарах
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      
      {/* Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
            width: drawerWidth, 
            boxSizing: 'border-box',
            ...(open ? {} : { transform: 'translateX(-180px)', width: '60px' })
          },
          transition: 'all 0.3s ease',
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              <ListItem 
                key={item.text} 
                component={Link} 
                to={item.path}
                sx={{ 
                  pl: open ? 2 : 1.5,
                  '& .MuiListItemText-root': {
                    opacity: open ? 1 : 0,
                    transition: 'opacity 0.3s ease'
                  },
                  cursor: 'pointer'
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
          
          {/* Admin section */}
          {(user?.role === 'admin' || user?.role === 'manager') && (
            <>
              <Divider />
              <List>
                {adminMenuItems
                  .filter(item => item.roles.includes(user?.role))
                  .map((item) => (
                    <ListItem 
                      key={item.text} 
                      component={Link} 
                      to={item.path}
                      sx={{ 
                        pl: open ? 2 : 1.5,
                        '& .MuiListItemText-root': {
                          opacity: open ? 1 : 0,
                          transition: 'opacity 0.3s ease'
                        },
                        cursor: 'pointer'
                      }}
                    >
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.text} />
                    </ListItem>
                  ))
                }
              </List>
            </>
          )}
        </Box>
      </Drawer>
      
      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayout;
