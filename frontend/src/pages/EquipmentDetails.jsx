import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { apiService, dataUtils } from '../services/apiService';
import { useToast } from '../contexts/ToastContext';

const EquipmentDetails = () => {
  const { category } = useParams();
  const [equipmentData, setEquipmentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    if (category) {
      loadEquipmentData();
    }
  }, [category]);

  const loadEquipmentData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getSpareParts({
        equipment: category,
        limit: 1000, // Get all parts for this equipment
      });

      setEquipmentData(response.data || []);
      calculateStats(response.data || []);
    } catch (err) {
      console.error('Error loading equipment data:', err);
      setError('Failed to load equipment data');
      showError('Failed to load equipment details');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    if (!data || data.length === 0) {
      setStats(null);
      return;
    }

    const stats = {
      totalParts: data.length,
      totalValue: data.reduce((sum, part) => sum + part.totalValue, 0),
      outOfStock: data.filter(part => part.stockLevel === 'OUT_OF_STOCK').length,
      lowStock: data.filter(part => part.stockLevel === 'LOW_STOCK').length,
      mediumStock: data.filter(part => part.stockLevel === 'MEDIUM_STOCK').length,
      highStock: data.filter(part => part.stockLevel === 'HIGH_STOCK').length,
      inProcess: data.reduce((sum, part) => sum + part.inProcess, 0),
      criticalParts: data.filter(part => 
        part.stockLevel === 'OUT_OF_STOCK' || part.stockLevel === 'LOW_STOCK'
      ),
      mostExpensive: data.reduce((max, part) => 
        part.totalValue > max.totalValue ? part : max, data[0]
      ),
      leastStock: data.reduce((min, part) => 
        part.currentStock < min.currentStock ? part : min, data[0]
      ),
    };

    setStats(stats);
  };

  const getStockLevelData = () => {
    if (!stats) return [];
    
    return [
      { name: 'Out of Stock', value: stats.outOfStock, color: '#f44336' },
      { name: 'Low Stock', value: stats.lowStock, color: '#ff9800' },
      { name: 'Medium Stock', value: stats.mediumStock, color: '#2196f3' },
      { name: 'High Stock', value: stats.highStock, color: '#4caf50' },
    ].filter(item => item.value > 0);
  };

  const getValueDistributionData = () => {
    if (!equipmentData || equipmentData.length === 0) return [];
    
    // Sort by total value and take top 10
    const sortedParts = [...equipmentData]
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 10);

    return sortedParts.map(part => ({
      name: part.partName.length > 15 ? 
        part.partName.substring(0, 15) + '...' : 
        part.partName,
      value: part.totalValue,
      stock: part.currentStock,
    }));
  };

  const getStockStatusIcon = (stockLevel) => {
    switch (stockLevel) {
      case 'OUT_OF_STOCK':
        return <ErrorIcon sx={{ color: '#f44336', fontSize: 20 }} />;
      case 'LOW_STOCK':
        return <WarningIcon sx={{ color: '#ff9800', fontSize: 20 }} />;
      case 'MEDIUM_STOCK':
        return <InfoIcon sx={{ color: '#2196f3', fontSize: 20 }} />;
      case 'HIGH_STOCK':
        return <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 20 }} />;
      default:
        return null;
    }
  };

  const handleRefresh = async () => {
    await loadEquipmentData();
    showSuccess('Equipment data refreshed');
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

  if (!equipmentData || equipmentData.length === 0) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          {dataUtils.getEquipmentDisplayName(category)}
        </Typography>
        <Alert severity="info">
          No spare parts found for this equipment category.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          {dataUtils.getEquipmentDisplayName(category)}
        </Typography>
        <Tooltip title="Refresh Data">
          <IconButton onClick={handleRefresh} color="primary">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Summary Cards */}
      {stats && (
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
                      {stats.totalParts}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h2" sx={{ fontSize: '2rem', opacity: 0.3 }}>
                      📦
                    </Typography>
                  </Box>
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
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h2" sx={{ fontSize: '2rem', opacity: 0.3 }}>
                      💰
                    </Typography>
                  </Box>
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
      )}

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
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
                      label={({ name, value, percent }) => 
                        `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getStockLevelData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Top Parts by Value
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getValueDistributionData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                    />
                    <YAxis />
                    <RechartsTooltip 
                      formatter={(value, name) => [
                        name === 'value' ? dataUtils.formatCurrency(value) : value,
                        name === 'value' ? 'Value' : 'Stock'
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="value" fill="#d32f2f" name="Total Value" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Critical Parts Alert */}
      {stats && stats.criticalParts.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            {stats.criticalParts.length} Critical Parts Require Attention
          </Typography>
          <Typography variant="body2">
            The following parts are either out of stock or running low:
          </Typography>
          <Box sx={{ mt: 1 }}>
            {stats.criticalParts.slice(0, 3).map((part, index) => (
              <Chip
                key={part.id}
                label={`${part.partName} (${part.currentStock})`}
                size="small"
                sx={{ mr: 1, mb: 0.5 }}
                color="warning"
                variant="outlined"
              />
            ))}
            {stats.criticalParts.length > 3 && (
              <Chip
                label={`+${stats.criticalParts.length - 3} more`}
                size="small"
                color="warning"
                variant="outlined"
              />
            )}
          </Box>
        </Alert>
      )}

      {/* Parts Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            All Parts ({equipmentData.length})
          </Typography>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width={50}></TableCell>
                  <TableCell>Part Name</TableCell>
                  <TableCell align="center">Stock Level</TableCell>
                  <TableCell align="right">Current Stock</TableCell>
                  <TableCell align="right">Min Required</TableCell>
                  <TableCell align="right">In Process</TableCell>
                  <TableCell align="right">Unit Cost</TableCell>
                  <TableCell align="right">Total Value</TableCell>
                  <TableCell>Supplier</TableCell>
                  <TableCell>Last Updated</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {equipmentData.map((part) => (
                  <TableRow 
                    key={part.id} 
                    hover
                    sx={{
                      backgroundColor: part.stockLevel === 'OUT_OF_STOCK' 
                        ? 'rgba(244, 67, 54, 0.05)' 
                        : part.stockLevel === 'LOW_STOCK'
                        ? 'rgba(255, 152, 0, 0.05)'
                        : 'inherit'
                    }}
                  >
                    <TableCell>
                      {getStockStatusIcon(part.stockLevel)}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {part.partName}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {part.partCode}
                      </Typography>
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
                      {part.inProcess > 0 ? (
                        <Chip
                          label={part.inProcess}
                          size="small"
                          color="info"
                          variant="outlined"
                        />
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {dataUtils.formatCurrency(part.unitCost)}
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={500}>
                        {dataUtils.formatCurrency(part.totalValue)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {part.supplier}
                      </Typography>
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
    </Box>
  );
};

export default EquipmentDetails;