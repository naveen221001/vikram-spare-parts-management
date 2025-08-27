const express = require('express');
const cors = require('cors');
const multer = require('multer');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, dataDir)
    },
    filename: function (req, file, cb) {
        cb(null, 'Spare_Parts_Inventory.xlsx')
    }
});
const upload = multer({ storage: storage });

// In-memory store for spare parts data
let sparePartsData = [];
let lastSyncTime = null;

// Function to read Excel file and parse data
function readExcelData() {
    try {
        const filePath = path.join(dataDir, 'Spare_Parts_Inventory.xlsx');
        
        if (!fs.existsSync(filePath)) {
            console.log('Excel file not found, using empty data');
            return [];
        }

        const workbook = xlsx.readFile(filePath);
        const sheetName = 'Spare_Parts_Inventory';
        
        if (!workbook.Sheets[sheetName]) {
            console.log(`Sheet "${sheetName}" not found, using first sheet`);
            const firstSheetName = workbook.SheetNames[0];
            if (!firstSheetName) {
                return [];
            }
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = xlsx.utils.sheet_to_json(worksheet);
            return processSparePartsData(jsonData);
        }

        const worksheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(worksheet);
        return processSparePartsData(jsonData);
    } catch (error) {
        console.error('Error reading Excel file:', error);
        return [];
    }
}

// Function to process and standardize spare parts data
function processSparePartsData(rawData) {
    return rawData.map(item => ({
        id: item.Part_Code || `${item.Equipment_Category}-${Math.random().toString(36).substr(2, 9)}`,
        equipmentCategory: item.Equipment_Category || 'UNKNOWN',
        partName: item.Part_Name || 'Unknown Part',
        partCode: item.Part_Code || 'N/A',
        currentStock: parseInt(item.Current_Stock) || 0,
        minRequired: parseInt(item.Minimum_Required) || 0,
        maxThreshold: parseInt(item.Maximum_Threshold) || 0,
        inProcess: parseInt(item.In_Process) || 0,
        unitCost: parseFloat(item.Unit_Cost) || 0,
        supplier: item.Supplier || 'Unknown',
        lastUpdated: item.Last_Updated || new Date().toISOString().split('T')[0],
        status: item.Status || 'Active',
        stockLevel: getStockLevel(parseInt(item.Current_Stock) || 0, parseInt(item.Minimum_Required) || 0),
        totalValue: (parseInt(item.Current_Stock) || 0) * (parseFloat(item.Unit_Cost) || 0)
    }));
}

// Function to determine stock level status
function getStockLevel(currentStock, minRequired) {
    if (currentStock === 0) return 'OUT_OF_STOCK';
    if (currentStock <= minRequired) return 'LOW_STOCK';
    if (currentStock <= minRequired * 1.5) return 'MEDIUM_STOCK';
    return 'HIGH_STOCK';
}

// Initialize data on server start
sparePartsData = readExcelData();
lastSyncTime = new Date().toISOString();

// Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        dataCount: sparePartsData.length,
        lastSync: lastSyncTime
    });
});

// Get all spare parts with filtering and pagination
app.get('/api/spare-parts', (req, res) => {
    try {
        let filteredData = [...sparePartsData];
        
        // Filter by equipment category
        if (req.query.equipment) {
            filteredData = filteredData.filter(item => 
                item.equipmentCategory === req.query.equipment
            );
        }
        
        // Filter by stock level
        if (req.query.stockLevel) {
            filteredData = filteredData.filter(item => 
                item.stockLevel === req.query.stockLevel
            );
        }
        
        // Filter by status
        if (req.query.status) {
            filteredData = filteredData.filter(item => 
                item.status === req.query.status
            );
        }
        
        // Search by part name
        if (req.query.search) {
            const searchTerm = req.query.search.toLowerCase();
            filteredData = filteredData.filter(item => 
                item.partName.toLowerCase().includes(searchTerm) ||
                item.partCode.toLowerCase().includes(searchTerm)
            );
        }
        
        // Sort by specified field
        if (req.query.sortBy) {
            const sortField = req.query.sortBy;
            const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
            
            filteredData.sort((a, b) => {
                if (a[sortField] < b[sortField]) return -1 * sortOrder;
                if (a[sortField] > b[sortField]) return 1 * sortOrder;
                return 0;
            });
        }
        
        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        
        const paginatedData = filteredData.slice(startIndex, endIndex);
        
        res.json({
            data: paginatedData,
            total: filteredData.length,
            page: page,
            limit: limit,
            totalPages: Math.ceil(filteredData.length / limit),
            lastSync: lastSyncTime
        });
    } catch (error) {
        console.error('Error fetching spare parts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get dashboard statistics
app.get('/api/dashboard/stats', (req, res) => {
    try {
        const stats = {
            totalParts: sparePartsData.length,
            totalValue: sparePartsData.reduce((sum, item) => sum + item.totalValue, 0),
            outOfStock: sparePartsData.filter(item => item.stockLevel === 'OUT_OF_STOCK').length,
            lowStock: sparePartsData.filter(item => item.stockLevel === 'LOW_STOCK').length,
            inProcess: sparePartsData.reduce((sum, item) => sum + item.inProcess, 0),
            equipmentBreakdown: {},
            stockLevelBreakdown: {
                OUT_OF_STOCK: 0,
                LOW_STOCK: 0,
                MEDIUM_STOCK: 0,
                HIGH_STOCK: 0
            },
            recentActivity: sparePartsData
                .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
                .slice(0, 10),
            lastSync: lastSyncTime
        };
        
        // Calculate equipment breakdown
        sparePartsData.forEach(item => {
            if (!stats.equipmentBreakdown[item.equipmentCategory]) {
                stats.equipmentBreakdown[item.equipmentCategory] = {
                    totalParts: 0,
                    totalValue: 0,
                    criticalParts: 0
                };
            }
            
            stats.equipmentBreakdown[item.equipmentCategory].totalParts++;
            stats.equipmentBreakdown[item.equipmentCategory].totalValue += item.totalValue;
            
            if (item.stockLevel === 'OUT_OF_STOCK' || item.stockLevel === 'LOW_STOCK') {
                stats.equipmentBreakdown[item.equipmentCategory].criticalParts++;
            }
            
            // Update stock level breakdown
            stats.stockLevelBreakdown[item.stockLevel]++;
        });
        
        res.json(stats);
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get specific spare part by ID
app.get('/api/spare-parts/:id', (req, res) => {
    try {
        const part = sparePartsData.find(item => item.id === req.params.id);
        
        if (!part) {
            return res.status(404).json({ error: 'Spare part not found' });
        }
        
        res.json(part);
    } catch (error) {
        console.error('Error fetching spare part:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Sync data from uploaded Excel file
app.post('/api/sync-excel', upload.single('excel'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No Excel file provided' });
        }
        
        // Read and process the new Excel data
        const newData = readExcelData();
        sparePartsData = newData;
        lastSyncTime = new Date().toISOString();
        
        console.log(`Data synced successfully. Total parts: ${sparePartsData.length}`);
        
        res.json({
            message: 'Excel data synced successfully',
            totalParts: sparePartsData.length,
            syncTime: lastSyncTime
        });
    } catch (error) {
        console.error('Error syncing Excel data:', error);
        res.status(500).json({ error: 'Error syncing Excel data' });
    }
});

// Manual refresh of data (for GitHub Actions webhook)
app.post('/api/refresh-data', (req, res) => {
    try {
        const newData = readExcelData();
        sparePartsData = newData;
        lastSyncTime = new Date().toISOString();
        
        console.log(`Data refreshed successfully. Total parts: ${sparePartsData.length}`);
        
        res.json({
            message: 'Data refreshed successfully',
            totalParts: sparePartsData.length,
            syncTime: lastSyncTime
        });
    } catch (error) {
        console.error('Error refreshing data:', error);
        res.status(500).json({ error: 'Error refreshing data' });
    }
});

// Get equipment categories
app.get('/api/equipment-categories', (req, res) => {
    try {
        const categories = [...new Set(sparePartsData.map(item => item.equipmentCategory))]
            .filter(category => category && category !== 'UNKNOWN')
            .sort();
        
        res.json(categories);
    } catch (error) {
        console.error('Error fetching equipment categories:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Initial data loaded: ${sparePartsData.length} spare parts`);
});

module.exports = app;