import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add timestamp to prevent caching
    config.params = {
      ...config.params,
      _t: Date.now(),
    };
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error Response:', error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('API Network Error:', error.request);
    } else {
      // Something else happened
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // Health check
  async checkHealth() {
    const response = await api.get('/health');
    return response.data;
  },

  // Dashboard statistics
  async getDashboardStats() {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  // Spare parts endpoints
  async getSpareParts(filters = {}) {
    const response = await api.get('/spare-parts', { params: filters });
    return response.data;
  },

  async getSparePartById(id) {
    const response = await api.get(`/spare-parts/${id}`);
    return response.data;
  },

  // Equipment categories
  async getEquipmentCategories() {
    const response = await api.get('/equipment-categories');
    return response.data;
  },

  // File sync
  async syncExcelFile(file) {
    const formData = new FormData();
    formData.append('excel', file);
    
    const response = await api.post('/sync-excel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async refreshData() {
    const response = await api.post('/refresh-data');
    return response.data;
  },
};

// Utility functions for data processing
export const dataUtils = {
  // Format currency
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  },

  // Format date
  formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    }).format(new Date(dateString));
  },

  // Get stock level color
  getStockLevelColor(stockLevel) {
    switch (stockLevel) {
      case 'OUT_OF_STOCK':
        return '#f44336'; // Red
      case 'LOW_STOCK':
        return '#ff9800'; // Orange
      case 'MEDIUM_STOCK':
        return '#2196f3'; // Blue
      case 'HIGH_STOCK':
        return '#4caf50'; // Green
      default:
        return '#757575'; // Grey
    }
  },

  // Get stock level label
  getStockLevelLabel(stockLevel) {
    switch (stockLevel) {
      case 'OUT_OF_STOCK':
        return 'Out of Stock';
      case 'LOW_STOCK':
        return 'Low Stock';
      case 'MEDIUM_STOCK':
        return 'Medium Stock';
      case 'HIGH_STOCK':
        return 'High Stock';
      default:
        return 'Unknown';
    }
  },

  // Get equipment category display name
  getEquipmentDisplayName(category) {
    switch (category) {
      case 'HAIL_TESTER':
        return 'Hail Tester';
      case 'MLT_TESTER':
        return 'MLT Tester';
      case 'THERMAL_CYCLING':
        return 'Thermal Cycling';
      case 'DAMP_HEAT':
        return 'Damp Heat';
      case 'PCT':
        return 'PCT';
      case 'COMMON_PARTS':
        return 'Common Parts';
      default:
        return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  },

  // Calculate stock status
  calculateStockStatus(currentStock, minRequired, maxThreshold) {
    const percentage = (currentStock / maxThreshold) * 100;
    
    if (currentStock === 0) return { status: 'critical', percentage: 0 };
    if (currentStock <= minRequired) return { status: 'low', percentage };
    if (currentStock <= minRequired * 1.5) return { status: 'medium', percentage };
    return { status: 'good', percentage: Math.min(percentage, 100) };
  },

  // Filter and sort spare parts
  filterSpareParts(spareParts, filters) {
    let filtered = [...spareParts];

    // Equipment filter
    if (filters.equipment && filters.equipment !== 'ALL') {
      filtered = filtered.filter(part => part.equipmentCategory === filters.equipment);
    }

    // Stock level filter
    if (filters.stockLevel && filters.stockLevel !== 'ALL') {
      filtered = filtered.filter(part => part.stockLevel === filters.stockLevel);
    }

    // Status filter
    if (filters.status && filters.status !== 'ALL') {
      filtered = filtered.filter(part => part.status === filters.status);
    }

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(part => 
        part.partName.toLowerCase().includes(searchTerm) ||
        part.partCode.toLowerCase().includes(searchTerm) ||
        part.supplier.toLowerCase().includes(searchTerm)
      );
    }

    // Sort
    if (filters.sortBy) {
      const sortField = filters.sortBy;
      const sortOrder = filters.sortOrder === 'desc' ? -1 : 1;

      filtered.sort((a, b) => {
        let aVal = a[sortField];
        let bVal = b[sortField];

        // Handle different data types
        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }

        if (aVal < bVal) return -1 * sortOrder;
        if (aVal > bVal) return 1 * sortOrder;
        return 0;
      });
    }

    return filtered;
  },
};

export default api;