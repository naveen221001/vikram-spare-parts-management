import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { ToastProvider } from './contexts/ToastContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import InventoryManagement from './pages/InventoryManagement';
import EquipmentDetails from './pages/EquipmentDetails';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

// Vikram Solar theme - Red, Grey, White
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#d32f2f', // Vikram Solar Red
      light: '#ff6659',
      dark: '#9a0007',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#616161', // Grey
      light: '#8e8e93',
      dark: '#373737',
      contrastText: '#ffffff',
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
    },
    error: {
      main: '#f44336',
    },
    warning: {
      main: '#ff9800',
    },
    info: {
      main: '#2196f3',
    },
    success: {
      main: '#4caf50',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
      color: '#d32f2f',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
      color: '#d32f2f',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
      color: '#212121',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      color: '#212121',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      color: '#212121',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      color: '#212121',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#d32f2f',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#fafafa',
          borderRight: '1px solid #e0e0e0',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
          borderRadius: 8,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
});

const drawerWidth = 280;

function App() {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ToastProvider>
        <Router>
          <Box sx={{ display: 'flex' }}>
            <Header 
              drawerWidth={drawerWidth} 
              onMenuClick={handleDrawerToggle}
            />
            <Sidebar 
              drawerWidth={drawerWidth}
              mobileOpen={mobileOpen}
              onDrawerToggle={handleDrawerToggle}
            />
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                p: 3,
                width: { sm: `calc(100% - ${drawerWidth}px)` },
                mt: 8, // Account for AppBar height
                backgroundColor: '#fafafa',
                minHeight: '100vh',
              }}
            >
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/inventory" element={<InventoryManagement />} />
                <Route path="/equipment/:category" element={<EquipmentDetails />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </Box>
          </Box>
        </Router>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;