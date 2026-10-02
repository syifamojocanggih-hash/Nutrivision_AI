const express = require('express');
const router = express.Router();
const path = require('path');

const fs = require('fs');

// Mengambil data raksasa dari data.js di backend sehingga tidak membebani frontend
let NUTRIVISION_DATA = null;
const candidateDataPaths = [
    path.join(__dirname, '../data/data.js'),
    path.join(__dirname, '../js/data.js'),
    path.join(__dirname, '../../frontend/js/data.js'),
    path.join(__dirname, '../../js/data.js')
];

for (const p of candidateDataPaths) {
    if (fs.existsSync(p)) {
        try {
            NUTRIVISION_DATA = require(p);
            console.log(`[Catalog Routes] NUTRIVISION_DATA loaded successfully from ${p}`);
            break;
        } catch (err) {
            console.warn(`[Catalog Routes] Failed to load data from ${p}:`, err.message);
        }
    }
}

if (!NUTRIVISION_DATA) {
    console.warn("[Catalog Routes] Warning: NUTRIVISION_DATA could not be loaded from candidate paths.");
}

/**
 * GET /api/catalog
 * Endpoint ini mengirimkan seluruh katalog nutrisi, taxonomy, dan preset scan ke frontend.
 */
router.get('/', (req, res) => {
    if (!NUTRIVISION_DATA) {
        return res.status(500).json({ success: false, message: 'Data katalog belum tersedia.' });
    }
    res.json({
        success: true,
        data: NUTRIVISION_DATA
    });
});

module.exports = router;
