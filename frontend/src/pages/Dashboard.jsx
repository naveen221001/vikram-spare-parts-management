import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  AttachMoney as MoneyIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  Build as BuildIcon,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { apiService, dataUtils } from '../services/apiService';
import { useToast } from '../contexts/ToastContext';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showError } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const dashboardStats = await apiService.getDashboardStats();
      setStats(dashboardStats);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data');
      showError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStockLevelData = () => {
    if (!stats) return [];
    
    return [
      { name: 'Out of Stock', value: stats.stockLevelBreakdown.OUT_OF_STOCK, color: '#f44336' },
      { name: 'Low Stock', value: stats.stockLevelBreakdown.LOW_STOCK, color: '#ff9800' },
      { name: 'Medium Stock', value: stats.stockLevelBreakdown.MEDIUM_STOCK, color: '#2196f3' },
      { name: 'High Stock', value: stats.stockLevelBreakdown.HIGH_STOCK, color: '#4caf50' },
    ].filter(item => item.value > 0);
  };

  const getEquipmentData = () => {
    if (!stats || !stats.equipmentBreakdown) return [];
    
    return Object.entries(stats.equipmentBreakdown).map(([category, data]) => ({
      name: dataUtils.getEquipmentDisplayName(category),
      parts: data.totalParts,
      value: data.totalValue,
      critical: data.criticalParts,
    }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!stats) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        No data available
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Dashboard
      </Typography>

      {/* Key Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total Parts
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                    {stats.totalParts.toLocaleString()}
                  </Typography>
                </Box>
                <InventoryIcon sx={{ fontSize: 40, color: '#d32f2f', opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total Value
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                    {dataUtils.formatCurrency(stats.totalValue)}
                  </Typography>
                </Box>
                <MoneyIcon sx={{ fontSize: 40, color: '#4caf50', opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Critical Items
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 600, color: '#f44336' }}>
                    {stats.outOfStock + stats.lowStock}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {stats.outOfStock} out of stock
                  </Typography>
                </Box>
                <WarningIcon sx={{ fontSize: 40, color: '#f44336', opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    In Process
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                    {stats.inProcess}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Parts being ordered
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, color: '#2196f3', opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Stock Level Distribution */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Stock Level Distribution
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getStockLevelData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getStockLevelData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Equipment Breakdown */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Parts by Equipment
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getEquipmentData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="parts" fill="#d32f2f" name="Total Parts" />
                    <Bar dataKey="critical" fill="#f44336" name="Critical Parts" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity Table */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Recently Updated Parts
              </Typography>
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Part Name</TableCell>
                      <TableCell>Equipment</TableCell>
                      <TableCell align="center">Stock Level</TableCell>
                      <TableCell align="right">Current Stock</TableCell>
                      <TableCell align="right">Min Required</TableCell>
                      <TableCell align="right">Value</TableCell>
                      <TableCell>Last Updated</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.recentActivity.slice(0, 10).map((part) => (
                      <TableRow key={part.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {part.partName}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {part.partCode}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={dataUtils.getEquipmentDisplayName(part.equipmentCategory)}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={dataUtils.getStockLevelLabel(part.stockLevel)}
                            size="small"
                            sx={{
                              backgroundColor: dataUtils.getStockLevelColor(part.stockLevel),
                              color: 'white',
                              fontWeight: 500,
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {part.currentStock}
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min((part.currentStock / part.maxThreshold) * 100, 100)}
                              sx={{
                                height: 4,
                                borderRadius: 2,
                                backgroundColor: '#f5f5f5',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: dataUtils.getStockLevelColor(part.stockLevel),
                                }
                              }}
                            />
                          </Box>
                        </TableCell>
                        <TableCell align="right">{part.minRequired}</TableCell>
                        <TableCell align="right">
                          {dataUtils.formatCurrency(part.totalValue)}
                        </TableCell>
                        <TableCell>
                          {dataUtils.formatDate(part.lastUpdated)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Sync Information */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="caption" color="textSecondary">
          Last synced: {stats.lastSync ? new Date(stats.lastSync).toLocaleString() : 'Never'}
        </Typography>
      </Box>
    </Box>
  );
};

export default Dashboard;