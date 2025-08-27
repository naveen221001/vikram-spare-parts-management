import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  FileUpload as UploadIcon,
  Download as DownloadIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { apiService, dataUtils } from '../services/apiService';
import { useToast } from '../contexts/ToastContext';

const InventoryManagement = () => {
  const [spareParts, setSpareParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    equipment: 'ALL',
    stockLevel: 'ALL',
    status: 'ALL',
  });
  const [equipmentCategories, setEquipmentCategories] = useState([]);
  const [selectedPart, setSelectedPart] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 25,
  });

  const { showSuccess, showError, showInfo } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadSpareParts();
  }, [filters, paginationModel]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [categories] = await Promise.all([
        apiService.getEquipmentCategories(),
      ]);
      setEquipmentCategories(categories);
      await loadSpareParts();
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data');
      showError('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const loadSpareParts = async () => {
    try {
      const queryParams = {
        ...filters,
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
      };

      // Remove 'ALL' filters
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === 'ALL') {
          delete queryParams[key];
        }
      });

      const response = await apiService.getSpareParts(queryParams);
      setSpareParts(response.data || []);
    } catch (err) {
      console.error('Error loading spare parts:', err);
      showError('Failed to load spare parts');
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
    setPaginationModel(prev => ({ ...prev, page: 0 })); // Reset to first page
  };

  const handleRefresh = async () => {
    await loadSpareParts();
    showSuccess('Inventory data refreshed');
  };

  const handlePartDetails = (part) => {
    setSelectedPart(part);
    setDetailDialogOpen(true);
  };

  const handleFileUpload = async () => {
    if (!uploadFile) {
      showError('Please select a file to upload');
      return;
    }

    setUploading(true);
    try {
      const result = await apiService.syncExcelFile(uploadFile);
      showSuccess(`File uploaded successfully! ${result.totalParts} parts synced.`);
      setUploadDialogOpen(false);
      setUploadFile(null);
      await loadSpareParts();
    } catch (err) {
      console.error('Upload error:', err);
      showError('Failed to upload file');
    } finally {
      setUploading(false);
    }
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

  const columns = [
    {
      field: 'stockStatus',
      headerName: '',
      width: 50,
      sortable: false,
      filterable: false,
      renderCell: (params) => getStockStatusIcon(params.row.stockLevel),
    },
    {
      field: 'partName',
      headerName: 'Part Name',
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight={500}>
            {params.value}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {params.row.partCode}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'equipmentCategory',
      headerName: 'Equipment',
      width: 150,
      renderCell: (params) => (
        <Chip
          label={dataUtils.getEquipmentDisplayName(params.value)}
          size="small"
          variant="outlined"
          sx={{
            fontSize: '0.75rem',
            height: 24,
          }}
        />
      ),
    },
    {
      field: 'currentStock',
      headerName: 'Current Stock',
      width: 120,
      type: 'number',
      renderCell: (params) => (
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" fontWeight={500}>
            {params.value}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Min: {params.row.minRequired}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'stockLevel',
      headerName: 'Stock Level',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={dataUtils.getStockLevelLabel(params.value)}
          size="small"
          sx={{
            backgroundColor: dataUtils.getStockLevelColor(params.value),
            color: 'white',
            fontWeight: 500,
            fontSize: '0.75rem',
          }}
        />
      ),
    },
    {
      field: 'inProcess',
      headerName: 'In Process',
      width: 100,
      type: 'number',
    },
    {
      field: 'unitCost',
      headerName: 'Unit Cost',
      width: 120,
      renderCell: (params) => dataUtils.formatCurrency(params.value),
    },
    {
      field: 'totalValue',
      headerName: 'Total Value',
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={500}>
          {dataUtils.formatCurrency(params.value)}
        </Typography>
      ),
    },
    {
      field: 'supplier',
      headerName: 'Supplier',
      width: 120,
    },
    {
      field: 'lastUpdated',
      headerName: 'Last Updated',
      width: 120,
      renderCell: (params) => dataUtils.formatDate(params.value),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 80,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Tooltip title="View Details">
          <IconButton
            size="small"
            onClick={() => handlePartDetails(params.row)}
          >
            <ViewIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Inventory Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filters and Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                placeholder="Search parts..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                }}
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Equipment</InputLabel>
                <Select
                  value={filters.equipment}
                  onChange={(e) => handleFilterChange('equipment', e.target.value)}
                  label="Equipment"
                >
                  <MenuItem value="ALL">All Equipment</MenuItem>
                  {equipmentCategories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {dataUtils.getEquipmentDisplayName(category)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Stock Level</InputLabel>
                <Select
                  value={filters.stockLevel}
                  onChange={(e) => handleFilterChange('stockLevel', e.target.value)}
                  label="Stock Level"
                >
                  <MenuItem value="ALL">All Levels</MenuItem>
                  <MenuItem value="OUT_OF_STOCK">Out of Stock</MenuItem>
                  <MenuItem value="LOW_STOCK">Low Stock</MenuItem>
                  <MenuItem value="MEDIUM_STOCK">Medium Stock</MenuItem>
                  <MenuItem value="HIGH_STOCK">High Stock</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  label="Status"
                >
                  <MenuItem value="ALL">All Status</MenuItem>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                  <MenuItem value="Discontinued">Discontinued</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Tooltip title="Refresh Data">
                  <Button
                    variant="outlined"
                    onClick={handleRefresh}
                    startIcon={<RefreshIcon />}
                    size="small"
                  >
                    Refresh
                  </Button>
                </Tooltip>

                <Tooltip title="Upload Excel File">
                  <Button
                    variant="outlined"
                    onClick={() => setUploadDialogOpen(true)}
                    startIcon={<UploadIcon />}
                    size="small"
                  >
                    Upload
                  </Button>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Data Grid */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={spareParts}
              columns={columns}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[10, 25, 50, 100]}
              disableRowSelectionOnClick
              density="compact"
              sx={{
                border: 'none',
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#f8f9fa',
                  borderBottom: '2px solid #e0e0e0',
                },
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: 'rgba(211, 47, 47, 0.02)',
                },
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Part Details Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Part Details
        </DialogTitle>
        <DialogContent>
          {selectedPart && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Part Name
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {selectedPart.partName}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Part Code
                </Typography>
                <Typography variant="body1">
                  {selectedPart.partCode}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Equipment Category
                </Typography>
                <Chip
                  label={dataUtils.getEquipmentDisplayName(selectedPart.equipmentCategory)}
                  size="small"
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Stock Level
                </Typography>
                <Chip
                  label={dataUtils.getStockLevelLabel(selectedPart.stockLevel)}
                  size="small"
                  sx={{
                    backgroundColor: dataUtils.getStockLevelColor(selectedPart.stockLevel),
                    color: 'white',
                    fontWeight: 500,
                  }}
                />
              </Grid>

              <Divider sx={{ width: '100%', my: 2 }} />

              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" color="textSecondary">
                  Current Stock
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  {selectedPart.currentStock}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" color="textSecondary">
                  Minimum Required
                </Typography>
                <Typography variant="h6">
                  {selectedPart.minRequired}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" color="textSecondary">
                  Maximum Threshold
                </Typography>
                <Typography variant="h6">
                  {selectedPart.maxThreshold}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" color="textSecondary">
                  In Process
                </Typography>
                <Typography variant="h6">
                  {selectedPart.inProcess}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" color="textSecondary">
                  Unit Cost
                </Typography>
                <Typography variant="h6" color="primary">
                  {dataUtils.formatCurrency(selectedPart.unitCost)}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" color="textSecondary">
                  Total Value
                </Typography>
                <Typography variant="h6" color="primary" fontWeight={600}>
                  {dataUtils.formatCurrency(selectedPart.totalValue)}
                </Typography>
              </Grid>

              <Divider sx={{ width: '100%', my: 2 }} />

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Supplier
                </Typography>
                <Typography variant="body1">
                  {selectedPart.supplier}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Last Updated
                </Typography>
                <Typography variant="body1">
                  {dataUtils.formatDate(selectedPart.lastUpdated)}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">
                  Status
                </Typography>
                <Chip
                  label={selectedPart.status}
                  size="small"
                  color={selectedPart.status === 'Active' ? 'success' : 'default'}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog
        open={uploadDialogOpen}
        onClose={() => !uploading && setUploadDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Upload Excel File
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Select an Excel file to sync spare parts inventory data.
            </Typography>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setUploadFile(e.target.files[0])}
              style={{ width: '100%' }}
            />
            {uploadFile && (
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                Selected: {uploadFile.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setUploadDialogOpen(false)}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleFileUpload}
            variant="contained"
            disabled={!uploadFile || uploading}
            startIcon={uploading ? <CircularProgress size={20} /> : <UploadIcon />}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InventoryManagement;