import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  Build as BuildIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  AcUnit as HailIcon,
  Engineering as MLTIcon,
  Thermostat as ThermalIcon,
  WaterDrop as DampIcon,
  Science as PCTIcon,
  Category as CommonIcon,
} from '@mui/icons-material';

const menuItems = [
  {
    title: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/',
  },
  {
    title: 'Inventory Management',
    icon: <InventoryIcon />,
    path: '/inventory',
  },
];

const equipmentItems = [
  {
    title: 'Hail Tester',
    icon: <HailIcon />,
    path: '/equipment/HAIL_TESTER',
    category: 'HAIL_TESTER',
  },
  {
    title: 'MLT Tester',
    icon: <MLTIcon />,
    path: '/equipment/MLT_TESTER',
    category: 'MLT_TESTER',
  },
  {
    title: 'Thermal Cycling',
    icon: <ThermalIcon />,
    path: '/equipment/THERMAL_CYCLING',
    category: 'THERMAL_CYCLING',
  },
  {
    title: 'Damp Heat',
    icon: <DampIcon />,
    path: '/equipment/DAMP_HEAT',
    category: 'DAMP_HEAT',
  },
  {
    title: 'PCT',
    icon: <PCTIcon />,
    path: '/equipment/PCT',
    category: 'PCT',
  },
  {
    title: 'Common Parts',
    icon: <CommonIcon />,
    path: '/equipment/COMMON_PARTS',
    category: 'COMMON_PARTS',
  },
];

const bottomMenuItems = [
  {
    title: 'Reports',
    icon: <AssessmentIcon />,
    path: '/reports',
  },
  {
    title: 'Settings',
    icon: <SettingsIcon />,
    path: '/settings',
  },
];

const Sidebar = ({ drawerWidth, mobileOpen, onDrawerToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleItemClick = (path) => {
    navigate(path);
    if (mobileOpen) {
      onDrawerToggle();
    }
  };

  const isActiveItem = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 3, textAlign: 'center', backgroundColor: '#f5f5f5' }}>
        <Avatar 
          sx={{ 
            width: 60, 
            height: 60, 
            backgroundColor: '#d32f2f', 
            mx: 'auto',
            mb: 1,
            fontSize: '1.5rem',
            fontWeight: 'bold'
          }}
        >
          VS
        </Avatar>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#d32f2f' }}>
          Vikram Solar
        </Typography>
        <Typography variant="body2" color="text.secondary">
          R&D Lab
        </Typography>
      </Box>

      <Divider />

      {/* Main Navigation */}
      <List sx={{ px: 1, py: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => handleItemClick(item.path)}
              selected={isActiveItem(item.path)}
              sx={{
                borderRadius: 2,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(211, 47, 47, 0.1)',
                  color: '#d32f2f',
                  '& .MuiListItemIcon-root': {
                    color: '#d32f2f',
                  },
                },
                '&:hover': {
                  backgroundColor: 'rgba(211, 47, 47, 0.05)',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.title}
                primaryTypographyProps={{
                  fontSize: '0.9rem',
                  fontWeight: isActiveItem(item.path) ? 600 : 400,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      {/* Equipment Section */}
      <Box sx={{ px: 2, py: 1 }}>
        <Typography 
          variant="overline" 
          sx={{ 
            color: 'text.secondary', 
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: 1
          }}
        >
          Equipment
        </Typography>
      </Box>

      <List sx={{ px: 1, pb: 2, flexGrow: 1 }}>
        {equipmentItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => handleItemClick(item.path)}
              selected={isActiveItem(item.path)}
              sx={{
                borderRadius: 2,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(211, 47, 47, 0.1)',
                  color: '#d32f2f',
                  '& .MuiListItemIcon-root': {
                    color: '#d32f2f',
                  },
                },
                '&:hover': {
                  backgroundColor: 'rgba(211, 47, 47, 0.05)',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.title}
                primaryTypographyProps={{
                  fontSize: '0.85rem',
                  fontWeight: isActiveItem(item.path) ? 600 : 400,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      {/* Bottom Navigation */}
      <List sx={{ px: 1, py: 2 }}>
        {bottomMenuItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => handleItemClick(item.path)}
              selected={isActiveItem(item.path)}
              sx={{
                borderRadius: 2,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(211, 47, 47, 0.1)',
                  color: '#d32f2f',
                  '& .MuiListItemIcon-root': {
                    color: '#d32f2f',
                  },
                },
                '&:hover': {
                  backgroundColor: 'rgba(211, 47, 47, 0.05)',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.title}
                primaryTypographyProps={{
                  fontSize: '0.9rem',
                  fontWeight: isActiveItem(item.path) ? 600 : 400,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Footer */}
      <Box sx={{ p: 2, textAlign: 'center', borderTop: '1px solid #e0e0e0' }}>
        <Chip
          label="v1.0.0"
          size="small"
          variant="outlined"
          sx={{ 
            fontSize: '0.7rem',
            color: 'text.secondary',
            borderColor: 'rgba(0, 0, 0, 0.12)'
          }}
        />
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            backgroundColor: '#fafafa',
          },
        }}
      >
        {drawerContent}
      </Drawer>
      
      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            backgroundColor: '#fafafa',
            borderRight: '1px solid #e0e0e0',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;