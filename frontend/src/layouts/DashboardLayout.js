import React, { useState, useEffect, useContext } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { 
  AppBar, Box, Toolbar, IconButton, Typography, Drawer, List, ListItem, 
  ListItemIcon, ListItemText, Divider, Avatar, Menu, MenuItem, Tooltip,
  useTheme, useMediaQuery
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
  Assessment as AssessmentIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  ChevronLeft as ChevronLeftIcon,
  Rule as ApproveIcon
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { ColorModeContext } from '../App';

// Drawer width
const drawerWidth = 240;

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const colorMode = useContext(ColorModeContext);
  
  // Get stored drawer state from localStorage, default to open if no preference saved
  const storedDrawerState = localStorage.getItem('drawerOpen');
  const [open, setOpen] = useState(
    isMobile ? false : storedDrawerState !== null ? JSON.parse(storedDrawerState) : true
  );
  const [anchorEl, setAnchorEl] = useState(null);
  const [avatarError, setAvatarError] = useState(false);
  
  // Handle mobile drawer
  useEffect(() => {
    if (isMobile) {
      setOpen(false);
    }
  }, [isMobile]);
  
  // Persist drawer state in localStorage when it changes
  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem('drawerOpen', JSON.stringify(open));
    }
  }, [open, isMobile]);
  
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
  
  // Handle avatar image error
  const handleAvatarError = () => {
    setAvatarError(true);
  };
  
  // Helper function to check user roles
  const hasRole = (requiredRoles) => {
    if (!user || !user.role) return false;
    return requiredRoles.includes(user.role);
  };
  
  // Get avatar image source
  const getAvatarSrc = () => {
    if (avatarError) return null;
    
    const baseUrl = 'http://localhost:5000/uploads/';
    if (user?.profile?.image_path) {
      return `${baseUrl}${user.profile.image_path}`;
    }
    if (user?.profile_picture) {
      return `${baseUrl}${user.profile_picture}`;
    }
    return null;
  };
  
  // Menu items based on user role
  const menuItems = [
    { text: 'Хянах самбар', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Ирц бүртгэл', icon: <AttendanceIcon />, path: '/dashboard/attendance' },
    { text: 'Чөлөөний хүсэлт', icon: <LeaveIcon />, path: '/dashboard/leave' },
    { text: 'Гүйцэтгэлийн үнэлгээ', icon: <PerformanceIcon />, path: '/dashboard/performance' },
    { text: 'Цалингийн мэдээлэл', icon: <SalaryIcon />, path: '/dashboard/salary' },
  ];
  
  // Admin menu items
  const adminMenuItems = [
    { text: 'Хэрэглэгчийн удирдлага', icon: <UsersIcon />, path: '/dashboard/admin/users', roles: ['admin'] },
    { text: 'Ирцийн удирдлага', icon: <AttendanceIcon />, path: '/dashboard/admin/attendance', roles: ['admin', 'manager'] },
    { text: 'Ирцийн баталгаажуулалт', icon: <ApproveIcon />, path: '/dashboard/admin/approvals', roles: ['admin', 'manager'] },
    { text: 'Чөлөөний удирдлага', icon: <LeaveIcon />, path: '/dashboard/admin/leave', roles: ['admin', 'manager'] },
    { text: 'Гүйцэтгэлийн удирдлага', icon: <PerformanceIcon />, path: '/dashboard/admin/performance', roles: ['admin', 'manager'] },
    { text: 'Цалингийн удирдлага', icon: <SalaryIcon />, path: '/dashboard/admin/salary', roles: ['admin'] },
    { text: 'Тайлан', icon: <AssessmentIcon />, path: '/dashboard/reports', roles: ['admin', 'manager'] },
  ];
  
  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          transition: 'all 0.3s ease',
          borderRadius: 0
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={toggleDrawer}
            sx={{ mr: 2 }}
          >
            {open && !isMobile ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
          
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 600,
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(45deg, #3a7bd5 30%, #6c5ce7 90%)' 
                : 'none',
              WebkitBackgroundClip: theme.palette.mode === 'dark' ? 'text' : 'none',
              WebkitTextFillColor: theme.palette.mode === 'dark' ? 'transparent' : 'inherit',
            }}
          >
            Ажилтны удирдлагын систем
          </Typography>
          
          {/* Theme toggle */}
          <Tooltip title={theme.palette.mode === 'dark' ? 'Гэрэлтэй горим' : 'Харанхуй горим'}>
            <IconButton 
              color="inherit" 
              onClick={colorMode.toggleColorMode}
              sx={{ ml: 1 }}
            >
              {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
          
          {/* User profile */}
          <Tooltip title="Профайл">
            <IconButton 
              onClick={handleProfileMenuOpen} 
              sx={{ 
                p: 0,
                ml: 2,
                border: `2px solid ${theme.palette.primary.main}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                }
              }}
            >
              <Avatar 
                alt={user?.name || 'User'} 
                src={getAvatarSrc()}
                onError={handleAvatarError}
                sx={{ 
                  width: 38, 
                  height: 38,
                }}
              />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            PaperProps={{
              elevation: 3,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
                mt: 1.5,
                borderRadius: 0,
                minWidth: 180,
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
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
            <MenuItem 
              component={Link} 
              to="/dashboard/profile"
              onClick={handleProfileMenuClose}
              sx={{ 
                borderRadius: 0,
                py: 1, 
                mx: 1,
                my: 0.5, 
              }}
            >
              <ListItemIcon>
                <PersonIcon fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Профайл" 
                primaryTypographyProps={{ 
                  fontWeight: 500,
                  fontSize: '0.95rem'
                }} 
              />
            </MenuItem>
            <Divider sx={{ my: 1 }} />
            <MenuItem 
              onClick={handleLogout}
              sx={{ 
                borderRadius: 0,
                py: 1, 
                mx: 1,
                my: 0.5,
                '&:hover': {
                  bgcolor: theme => theme.palette.error.light + '20',
                  '& .MuiListItemIcon-root': {
                    color: 'error.main'
                  },
                  '& .MuiTypography-root': {
                    color: 'error.main',
                    fontWeight: 600,
                  }
                }
              }}
            >
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Гарах" 
                primaryTypographyProps={{ 
                  fontWeight: 500,
                  fontSize: '0.95rem'
                }} 
              />
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      
      {/* Drawer */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={open}
        onClose={isMobile ? toggleDrawer : undefined}
        sx={{
          width: open ? drawerWidth : 72,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
            width: open ? drawerWidth : 72,
            boxSizing: 'border-box',
            transition: theme.transitions.create(['width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            ...(isMobile ? {} : { position: 'relative' }),
            overflow: 'hidden',
          },
          transition: theme.transitions.create(['width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Toolbar />
        <Box sx={{ 
          overflow: 'hidden',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          '&:hover': {
            overflowY: 'auto',
          },
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: theme.palette.mode === 'dark' 
                       ? 'rgba(255,255,255,0.2)' 
                       : 'rgba(0,0,0,0.2)',
            borderRadius: '10px',
          },
        }}>
          <List sx={{ flex: 1 }}>
            {menuItems.map((item) => (
              <ListItem 
                key={item.text} 
                component={Link} 
                to={item.path}
                sx={{ 
                  borderRadius: 0,
                  mb: 0.5,
                  mx: 1,
                  px: open ? 2 : 1.5,
                  justifyContent: open ? 'initial' : 'center',
                  '& .MuiListItemText-root': {
                    opacity: open ? 1 : 0,
                    transition: 'opacity 0.3s ease'
                  },
                  '& .MuiListItemIcon-root': {
                    minWidth: 0,
                    mr: open ? 2 : 0,
                    justifyContent: 'center',
                  },
                  '&:hover': {
                    bgcolor: theme => theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.08)' 
                      : 'rgba(0, 0, 0, 0.04)',
                    '& .MuiListItemIcon-root': {
                      color: 'primary.main',
                    },
                  },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
          
          {/* Admin section */}
          {hasRole(['admin', 'manager']) && (
            <>
              <Divider sx={{ my: 1, mx: 2 }} />
              <List>
                {adminMenuItems
                  .filter(item => hasRole(item.roles))
                  .map((item) => (
                    <ListItem 
                      key={item.text} 
                      component={Link} 
                      to={item.path}
                      sx={{ 
                        borderRadius: 0,
                        mb: 0.5,
                        mx: 1,
                        px: open ? 2 : 1.5,
                        justifyContent: open ? 'initial' : 'center',
                        '& .MuiListItemText-root': {
                          opacity: open ? 1 : 0,
                          transition: 'opacity 0.3s ease'
                        },
                        '& .MuiListItemIcon-root': {
                          minWidth: 0,
                          mr: open ? 2 : 0,
                          justifyContent: 'center',
                        },
                        '&:hover': {
                          bgcolor: theme => theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.08)' 
                            : 'rgba(0, 0, 0, 0.04)',
                          '& .MuiListItemIcon-root': {
                            color: 'primary.main',
                          },
                        },
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
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3,
          width: { sm: `calc(100% - ${open ? drawerWidth : 72}px)` },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflow: 'hidden',
        }}
      >
        <Toolbar />
        <Box
          sx={{
            borderRadius: 0,
            overflow: 'hidden',
            boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
            bgcolor: 'background.paper',
            transition: 'all 0.3s ease',
            height: 'calc(100vh - 88px)',
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: theme.palette.mode === 'dark' 
                ? 'rgba(255,255,255,0.2)' 
                : 'rgba(0,0,0,0.1)',
              borderRadius: 0,
            },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
