import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Chip,
  Tooltip,
  Menu,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Sync as SyncIcon,
  Refresh as RefreshIcon,
  CloudSync as CloudSyncIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useToast } from '../contexts/ToastContext';
import { apiService } from '../services/apiService';

const Header = ({ drawerWidth, onMenuClick }) => {
  const [lastSync, setLastSync] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [healthStatus, setHealthStatus] = useState('unknown');
  
  const { showSuccess, showError } = useToast();

  // Check health status and last sync on mount
  useEffect(() => {
    checkHealthStatus();
    const interval = setInterval(checkHealthStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const checkHealthStatus = async () => {
    try {
      const health = await apiService.checkHealth();
      setHealthStatus('connected');
      setLastSync(health.lastSync);
    } catch (error) {
      setHealthStatus('disconnected');
      console.error('Health check failed:', error);
    }
  };

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
      const result = await apiService.refreshData();
      setLastSync(result.syncTime);
      showSuccess(`Data refreshed successfully! ${result.totalParts} parts loaded.`);
    } catch (error) {
      showError('Failed to refresh data. Please try again.');
      console.error('Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSettingsClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setAnchorEl(null);
  };

  const formatLastSync = (syncTime) => {
    if (!syncTime) return 'Never';
    
    const now = new Date();
    const sync = new Date(syncTime);
    const diffMs = now - sync;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const getHealthStatusColor = () => {
    switch (healthStatus) {
      case 'connected':
        return 'success';
      case 'disconnected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getHealthStatusText = () => {
    switch (healthStatus) {
      case 'connected':
        return 'Connected';
      case 'disconnected':
        return 'Disconnected';
      default:
        return 'Checking...';
    }
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Typography variant="h6" noWrap component="div">
            Spare Parts Management
          </Typography>
          
          <Box sx={{ ml: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              icon={<CloudSyncIcon />}
              label={getHealthStatusText()}
              color={getHealthStatusColor()}
              variant="outlined"
              size="small"
              sx={{ 
                color: 'white', 
                borderColor: 'rgba(255, 255, 255, 0.5)',
                '& .MuiChip-icon': {
                  color: 'white'
                }
              }}
            />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {lastSync && (
            <Tooltip title={`Last sync: ${new Date(lastSync).toLocaleString()}`}>
              <Chip
                icon={<SyncIcon />}
                label={`Synced ${formatLastSync(lastSync)}`}
                variant="outlined"
                size="small"
                sx={{ 
                  color: 'white', 
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  '& .MuiChip-icon': {
                    color: 'white'
                  }
                }}
              />
            </Tooltip>
          )}
          
          <Tooltip title="Refresh Data">
            <IconButton
              color="inherit"
              onClick={handleRefreshData}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                <RefreshIcon />
              )}
            </IconButton>
          </Tooltip>

          <Tooltip title="Settings">
            <IconButton
              color="inherit"
              onClick={handleSettingsClick}
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleSettingsClose}
            PaperProps={{
              sx: {
                mt: 1.5,
                '& .MuiMenuItem-root': {
                  px: 2,
                  py: 1,
                },
              },
            }}
          >
            <MenuItem onClick={() => {
              handleRefreshData();
              handleSettingsClose();
            }}>
              <RefreshIcon sx={{ mr: 1 }} />
              Refresh Data
            </MenuItem>
            <MenuItem onClick={() => {
              window.open('/api/health', '_blank');
              handleSettingsClose();
            }}>
              <CloudSyncIcon sx={{ mr: 1 }} />
              API Health
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;