import { createTheme, responsiveFontSizes } from '@mui/material/styles';

// Modern color palette
const primaryColor = '#3a7bd5';
const secondaryColor = '#6c5ce7';
const successColor = '#00b894';
const errorColor = '#ff7675';
const warningColor = '#fdcb6e';
const infoColor = '#0984e3';
const lightBackground = '#f8fafc';
const darkBackground = '#1a202c';
const lightPaper = '#ffffff';
const darkPaper = '#2d3748';

// Create theme function that supports light/dark mode
const createAppTheme = (mode = 'light') => {
  let theme = createTheme({
    palette: {
      mode,
      primary: {
        main: primaryColor,
        light: '#83a4d4',
        dark: '#2657a1',
        contrastText: '#ffffff',
      },
      secondary: {
        main: secondaryColor,
        light: '#a29bfe',
        dark: '#5641d6',
        contrastText: '#ffffff',
      },
      success: {
        main: successColor,
        light: '#55efc4',
        dark: '#00a382',
      },
      error: {
        main: errorColor,
        light: '#fab1a0',
        dark: '#d63031',
      },
      warning: {
        main: warningColor,
        light: '#ffeaa7',
        dark: '#f39c12',
      },
      info: {
        main: infoColor,
        light: '#74b9ff',
        dark: '#0652a0',
      },
      background: {
        default: mode === 'light' ? lightBackground : darkBackground,
        paper: mode === 'light' ? lightPaper : darkPaper,
      },
      text: {
        primary: mode === 'light' ? 'rgba(0, 0, 0, 0.87)' : 'rgba(255, 255, 255, 0.95)',
        secondary: mode === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.8)',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Noto Sans Mongolian", sans-serif',
      h1: {
        fontSize: '2.5rem',
        fontWeight: 700,
        lineHeight: 1.2,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 600,
        lineHeight: 1.3,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
        lineHeight: 1.3,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 600,
        lineHeight: 1.5,
      },
      subtitle1: {
        fontSize: '1rem',
        fontWeight: 500,
      },
      subtitle2: {
        fontSize: '0.875rem',
        fontWeight: 500,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.5,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.5,
      },
      button: {
        fontWeight: 600,
        textTransform: 'none',
      },
    },
    shape: {
      borderRadius: 0,
    },
    shadows: [
      'none',
      '0px 2px 4px rgba(0, 0, 0, 0.05)',
      '0px 4px 8px rgba(0, 0, 0, 0.05)',
      '0px 8px 16px rgba(0, 0, 0, 0.05)',
      '0px 16px 24px rgba(0, 0, 0, 0.05)',
      '0px 24px 32px rgba(0, 0, 0, 0.05)',
      '0px 32px 40px rgba(0, 0, 0, 0.05)',
      // ... rest of shadows from default theme
      ...Array(18).fill('none'),
    ],
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 0,
            padding: '8px 20px',
            fontWeight: 600,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
            },
          },
          containedPrimary: {
            background: `linear-gradient(to right, ${primaryColor}, #3a7bd5)`,
          },
          containedSecondary: {
            background: `linear-gradient(to right, ${secondaryColor}, #6c5ce7)`,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 0,
            },
            '& .MuiInputBase-input': {
              color: mode === 'dark' ? 'rgba(255, 255, 255, 0.95)' : 'inherit',
            },
            '& .MuiFormLabel-root': {
              color: mode === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'inherit',
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'inherit',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 0,
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden',
          },
        },
      },
      MuiCardHeader: {
        styleOverrides: {
          root: {
            padding: 20,
          },
        },
      },
      MuiCardContent: {
        styleOverrides: {
          root: {
            padding: 20,
            '&:last-child': {
              paddingBottom: 20,
            },
          },
        },
      },
      MuiTable: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-head': {
              fontWeight: 600,
              backgroundColor: mode === 'light' ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.05)',
            },
            '& .MuiTableRow-root': {
              '&:hover': {
                backgroundColor: mode === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.05)',
              },
            },
            '& .MuiTableCell-root': {
              borderBottom: mode === 'light' ? '1px solid rgba(0, 0, 0, 0.05)' : '1px solid rgba(255, 255, 255, 0.1)',
            },
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: 'none',
            boxShadow: mode === 'light' ? '4px 0px 16px rgba(0, 0, 0, 0.05)' : '4px 0px 16px rgba(0, 0, 0, 0.2)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)',
            backgroundColor: mode === 'light' ? lightPaper : darkPaper,
            color: mode === 'light' ? 'rgba(0, 0, 0, 0.87)' : 'rgba(255, 255, 255, 0.87)',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 0,
            boxShadow: '0px 16px 40px rgba(0, 0, 0, 0.1)',
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            borderRadius: 0,
            marginBottom: 4,
            '&.Mui-selected': {
              backgroundColor: mode === 'light' ? 'rgba(58, 123, 213, 0.1)' : 'rgba(58, 123, 213, 0.2)',
              '&:hover': {
                backgroundColor: mode === 'light' ? 'rgba(58, 123, 213, 0.15)' : 'rgba(58, 123, 213, 0.25)',
              },
            },
            '&:hover': {
              backgroundColor: mode === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.05)',
            },
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            minWidth: 40,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 0,
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: mode === 'light' ? 'rgba(0, 0, 0, 0.75)' : 'rgba(255, 255, 255, 0.75)',
            color: mode === 'light' ? '#fff' : '#000',
            borderRadius: 0,
            padding: '8px 12px',
            fontSize: '0.75rem',
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 0,
          },
        },
      },
      MuiTypography: {
        styleOverrides: {
          root: {
            color: mode === 'dark' ? 'rgba(255, 255, 255, 0.95)' : 'inherit',
          },
        },
      },
    },
  });

  // Make fonts responsive
  theme = responsiveFontSizes(theme);

  return theme;
};

// Default export for light theme
const theme = createAppTheme('light');

export { createAppTheme };
export default theme; 