const express = require('express');
const router = express.Router();
const path = require('path');

// Mengambil data raksasa dari data.js di backend sehingga tidak membebani frontend
let NUTRIVISION_DATA = null;
try {
    NUTRIVISION_DATA = require(path.join(__dirname, '../../js/data.js'));
} catch (err) {
    console.error("Gagal memuat NUTRIVISION_DATA:", err);
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
