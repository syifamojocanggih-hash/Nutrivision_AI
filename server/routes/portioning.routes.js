const express = require('express');
const router = express.Router();
const db = require('../database/connection');

// Konstanta ukuran UI di Frontend (Fixed Reference)
const UI_CIRCLE_DIAMETER_PX = 800;

/**
 * POST /api/portioning/calculate-nutrition
 * Menghitung estimasi berat makanan dan nutrisi berdasarkan total piksel.
 */
router.post('/calculate-nutrition', async (req, res) => {
    try {
        const { plate_type, plate_diameter_cm, detected_foods } = req.body;

        if (!plate_diameter_cm || !detected_foods || !Array.isArray(detected_foods)) {
            return res.status(400).json({
                success: false,
                message: 'Payload request tidak valid. Pastikan plate_diameter_cm dan detected_foods tersedia.'
            });
        }

        // 1. Hitung Rasio Matematika (Gunakan reference_diameter_px jika dikirim client, default 800px)
        const referencePx = parseFloat(req.body.reference_diameter_px || req.body.image_width) || UI_CIRCLE_DIAMETER_PX;
        const cm_per_pixel = plate_diameter_cm / referencePx;
        const cm2_per_pixel = cm_per_pixel * cm_per_pixel;

        const results = [];
        let total_nutrition = { calories: 0, protein: 0, fat: 0, weight_g: 0 };

        for (const food of detected_foods) {
            const { food_name, total_pixels, polygon_xyn, confidence } = food;

            // 2. Hitung luas makanan 2D aktual (cm²)
            const food_area_cm2 = total_pixels * cm2_per_pixel;

            // 3. Query ke database MySQL Lokal (Tabel: foods)
            let nutritionData = null;
            try {
                const sql = "SELECT * FROM foods WHERE LOWER(name) LIKE ? LIMIT 1";
                const queryName = `%${food_name.toLowerCase()}%`;
                const rows = await db.query(sql, [queryName]);
                if (rows && rows.length > 0) {
                    nutritionData = rows[0];
                }
            } catch (err) {
                console.warn("MySQL query error in portioning:", err.message);
            }

            if (!nutritionData) {
                console.warn(`Data nutrisi tidak ditemukan untuk makanan: ${food_name}. Menggunakan nilai default.`);
                // Fallback otomatis jika tabel belum ada atau koneksi gagal
                nutritionData = {
                    name: food_name,
                    calories: 150, // asumsi per 100g
                    protein: 10,
                    fat: 5,
                    density_g_per_cm2: 1.0 
                };
            }

            // 4. Hitung berat aktual makanan berdasarkan densitas (g/cm²)
            // MySQL 'foods' tabel mungkin belum punya kolom density, fallback ke 1.2
            const density = nutritionData.density_g_per_cm2 || 1.2;
            const estimated_grams = food_area_cm2 * density;

            // 5. Hitung nutrisi final berdasarkan basis per 100 gram
            const cals_per_100g = nutritionData.calories || 0;
            const prot_per_100g = nutritionData.protein || 0;
            const fat_per_100g = nutritionData.fat || 0;

            const calories = (estimated_grams / 100) * cals_per_100g;
            const protein = (estimated_grams / 100) * prot_per_100g;
            const fat = (estimated_grams / 100) * fat_per_100g;

            // Akumulasi total
            total_nutrition.calories += calories;
            total_nutrition.protein += protein;
            total_nutrition.fat += fat;
            total_nutrition.weight_g += estimated_grams;

            results.push({
                food_name,
                plate_type,
                total_pixels,
                confidence: confidence || 0.90, // default to 90% if missing
                food_area_cm2: parseFloat(food_area_cm2.toFixed(2)),
                density_used: density,
                estimated_grams: parseFloat(estimated_grams.toFixed(2)),
                polygon_xyn: polygon_xyn || [],

                nutrition: {
                    calories: parseFloat(calories.toFixed(2)),
                    protein: parseFloat(protein.toFixed(2)),
                    fat: parseFloat(fat.toFixed(2))
                }
            });
        }

        // Kembalikan response sukses
        res.json({
            success: true,
            summary: {
                total_items_detected: detected_foods.length,
                total_estimated_weight_g: parseFloat(total_nutrition.weight_g.toFixed(2)),
                total_calories: parseFloat(total_nutrition.calories.toFixed(2)),
                total_protein_g: parseFloat(total_nutrition.protein.toFixed(2)),
                total_fat_g: parseFloat(total_nutrition.fat.toFixed(2))
            },
            foods: results
        });

    } catch (error) {
        console.error('Error in /calculate-nutrition:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan pada server saat menghitung nutrisi porsi.',
            error: error.message
        });
    }
});

module.exports = router;
