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

            // Basis data nutrisi standar pangan lokal Indonesia (per 100 gram) untuk pelengkap deteksi CV
const STANDARD_FOODS_MAP = {
    "nasi putih": { calories: 130, protein: 2.7, carbs: 28.2, fat: 0.3, density_g_per_cm2: 1.3 },
    "nasi": { calories: 130, protein: 2.7, carbs: 28.2, fat: 0.3, density_g_per_cm2: 1.3 },
    "nasi merah": { calories: 111, protein: 2.6, carbs: 23.0, fat: 0.9, density_g_per_cm2: 1.25 },
    "bubur": { calories: 72, protein: 1.5, carbs: 15.0, fat: 0.2, density_g_per_cm2: 1.1 },
    "bubur gabus": { calories: 95, protein: 8.5, carbs: 14.0, fat: 0.8, density_g_per_cm2: 1.1 },
    "kentang rebus": { calories: 87, protein: 1.9, carbs: 20.0, fat: 0.1, density_g_per_cm2: 1.1 },
    "kentang": { calories: 87, protein: 1.9, carbs: 20.0, fat: 0.1, density_g_per_cm2: 1.1 },
    "ubi jalar rebus": { calories: 86, protein: 1.6, carbs: 20.1, fat: 0.1, density_g_per_cm2: 1.1 },
    "ubi jalar": { calories: 86, protein: 1.6, carbs: 20.1, fat: 0.1, density_g_per_cm2: 1.1 },
    "roti gandum utuh": { calories: 247, protein: 13.0, carbs: 41.0, fat: 3.4, density_g_per_cm2: 0.7 },
    "roti gandum": { calories: 247, protein: 13.0, carbs: 41.0, fat: 3.4, density_g_per_cm2: 0.7 },
    "roti tawar": { calories: 265, protein: 9.0, carbs: 49.0, fat: 3.2, density_g_per_cm2: 0.65 },
    "roti": { calories: 265, protein: 9.0, carbs: 49.0, fat: 3.2, density_g_per_cm2: 0.65 },
    "dada ayam fillet rebus / kukus": { calories: 165, protein: 31.0, carbs: 0, fat: 3.6, density_g_per_cm2: 1.2 },
    "dada ayam fillet": { calories: 165, protein: 31.0, carbs: 0, fat: 3.6, density_g_per_cm2: 1.2 },
    "dada ayam rebus": { calories: 165, protein: 31.0, carbs: 0, fat: 3.6, density_g_per_cm2: 1.2 },
    "dada ayam bakar": { calories: 190, protein: 29.0, carbs: 0, fat: 7.0, density_g_per_cm2: 1.2 },
    "dada ayam": { calories: 165, protein: 31.0, carbs: 0, fat: 3.6, density_g_per_cm2: 1.2 },
    "ayam panggang": { calories: 190, protein: 29.0, carbs: 0, fat: 7.0, density_g_per_cm2: 1.2 },
    "ayam goreng": { calories: 260, protein: 24.6, carbs: 0, fat: 17.5, density_g_per_cm2: 1.25 },
    "ayam": { calories: 200, protein: 25.0, carbs: 0, fat: 10.0, density_g_per_cm2: 1.2 },
    "telur rebus": { calories: 155, protein: 12.6, carbs: 1.1, fat: 10.6, density_g_per_cm2: 1.1 },
    "telur dadar": { calories: 185, protein: 11.0, carbs: 1.5, fat: 14.5, density_g_per_cm2: 1.0 },
    "telur mata sapi": { calories: 180, protein: 12.0, carbs: 1.0, fat: 14.0, density_g_per_cm2: 1.0 },
    "telur": { calories: 155, protein: 12.6, carbs: 1.1, fat: 10.6, density_g_per_cm2: 1.1 },
    "ikan bakar": { calories: 140, protein: 22.0, carbs: 0, fat: 5.0, density_g_per_cm2: 1.2 },
    "salmon panggang": { calories: 206, protein: 22.0, carbs: 0, fat: 12.0, density_g_per_cm2: 1.2 },
    "ikan tuna kukus / suwir": { calories: 132, protein: 28.0, carbs: 0, fat: 1.3, density_g_per_cm2: 1.2 },
    "ikan gabus liar": { calories: 118, protein: 25.2, carbs: 0, fat: 1.2, density_g_per_cm2: 1.2 },
    "ikan gabus kukus": { calories: 118, protein: 25.2, carbs: 0, fat: 1.2, density_g_per_cm2: 1.2 },
    "ikan gabus": { calories: 118, protein: 25.2, carbs: 0, fat: 1.2, density_g_per_cm2: 1.2 },
    "ikan kembung": { calories: 125, protein: 21.3, carbs: 0, fat: 3.4, density_g_per_cm2: 1.2 },
    "ikan": { calories: 130, protein: 22.0, carbs: 0, fat: 3.5, density_g_per_cm2: 1.2 },
    "sup daging sapi kuah bening": { calories: 120, protein: 12.0, carbs: 4.0, fat: 6.0, density_g_per_cm2: 1.1 },
    "sup daging sapi": { calories: 120, protein: 12.0, carbs: 4.0, fat: 6.0, density_g_per_cm2: 1.1 },
    "sup daging": { calories: 120, protein: 12.0, carbs: 4.0, fat: 6.0, density_g_per_cm2: 1.1 },
    "daging sapi": { calories: 215, protein: 26.0, carbs: 0, fat: 12.0, density_g_per_cm2: 1.25 },
    "daging": { calories: 215, protein: 26.0, carbs: 0, fat: 12.0, density_g_per_cm2: 1.25 },
    "bakso": { calories: 202, protein: 12.0, carbs: 16.0, fat: 10.0, density_g_per_cm2: 1.2 },
    "tempe panggang / kukus": { calories: 193, protein: 19.0, carbs: 9.4, fat: 11.0, density_g_per_cm2: 1.15 },
    "tempe goreng": { calories: 225, protein: 18.0, carbs: 12.0, fat: 14.0, density_g_per_cm2: 1.15 },
    "tempe": { calories: 193, protein: 19.0, carbs: 9.4, fat: 11.0, density_g_per_cm2: 1.15 },
    "tahu rebus / kukus": { calories: 76, protein: 8.0, carbs: 1.9, fat: 4.8, density_g_per_cm2: 1.1 },
    "tahu goreng": { calories: 115, protein: 9.7, carbs: 2.5, fat: 8.5, density_g_per_cm2: 1.1 },
    "tahu": { calories: 76, protein: 8.0, carbs: 1.9, fat: 4.8, density_g_per_cm2: 1.1 },
    "edamame rebus": { calories: 122, protein: 11.0, carbs: 9.0, fat: 5.0, density_g_per_cm2: 1.0 },
    "kacang hijau rebus": { calories: 105, protein: 7.0, carbs: 19.0, fat: 0.4, density_g_per_cm2: 1.1 },
    "sayur bayam kuah bening": { calories: 36, protein: 2.5, carbs: 5.5, fat: 0.5, density_g_per_cm2: 0.9 },
    "sayur bayam": { calories: 36, protein: 2.5, carbs: 5.5, fat: 0.5, density_g_per_cm2: 0.9 },
    "bayam": { calories: 36, protein: 2.5, carbs: 5.5, fat: 0.5, density_g_per_cm2: 0.9 },
    "brokoli kukus": { calories: 35, protein: 2.4, carbs: 7.2, fat: 0.4, density_g_per_cm2: 0.9 },
    "brokoli": { calories: 35, protein: 2.4, carbs: 7.2, fat: 0.4, density_g_per_cm2: 0.9 },
    "salad sayur segar": { calories: 25, protein: 1.2, carbs: 4.0, fat: 0.3, density_g_per_cm2: 0.8 },
    "gado-gado / pecel sayur": { calories: 135, protein: 5.5, carbs: 12.0, fat: 8.0, density_g_per_cm2: 1.1 },
    "gado-gado": { calories: 135, protein: 5.5, carbs: 12.0, fat: 8.0, density_g_per_cm2: 1.1 },
    "pecel": { calories: 135, protein: 5.5, carbs: 12.0, fat: 8.0, density_g_per_cm2: 1.1 },
    "karedok": { calories: 115, protein: 4.8, carbs: 10.0, fat: 7.0, density_g_per_cm2: 1.0 },
    "capcay kuah": { calories: 65, protein: 3.0, carbs: 8.0, fat: 2.5, density_g_per_cm2: 1.0 },
    "capcay": { calories: 65, protein: 3.0, carbs: 8.0, fat: 2.5, density_g_per_cm2: 1.0 },
    "tumis buncis": { calories: 55, protein: 2.0, carbs: 7.0, fat: 2.5, density_g_per_cm2: 0.95 },
    "sayur asem": { calories: 45, protein: 1.8, carbs: 8.0, fat: 1.0, density_g_per_cm2: 1.0 },
    "sup wortel dan kentang bening": { calories: 40, protein: 1.2, carbs: 8.5, fat: 0.3, density_g_per_cm2: 1.0 },
    "buah pisang": { calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, density_g_per_cm2: 1.0 },
    "pisang": { calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, density_g_per_cm2: 1.0 },
    "alpukat": { calories: 160, protein: 2.0, carbs: 8.5, fat: 14.7, density_g_per_cm2: 1.0 },
    "potongan buah pepaya": { calories: 43, protein: 0.5, carbs: 10.8, fat: 0.3, density_g_per_cm2: 1.0 },
    "pepaya": { calories: 43, protein: 0.5, carbs: 10.8, fat: 0.3, density_g_per_cm2: 1.0 },
    "potongan buah apel": { calories: 52, protein: 0.3, carbs: 13.8, fat: 0.2, density_g_per_cm2: 1.0 },
    "apel": { calories: 52, protein: 0.3, carbs: 13.8, fat: 0.2, density_g_per_cm2: 1.0 }
};

function findFoodNutrition(foodName) {
    if (!foodName) return null;
    const clean = foodName.toLowerCase().trim();
    if (STANDARD_FOODS_MAP[clean]) {
        return { name: foodName, ...STANDARD_FOODS_MAP[clean] };
    }
    for (const [key, val] of Object.entries(STANDARD_FOODS_MAP)) {
        if (clean.includes(key) || key.includes(clean)) {
            return { name: foodName, ...val };
        }
    }
    return null;
}

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

            // Fallback 1: Cek di basis data pangan lokal standar NutriVision AI
            if (!nutritionData) {
                nutritionData = findFoodNutrition(food_name);
            }

            // Fallback 2: Default estimasi jika benar-benar tidak dikenali
            if (!nutritionData) {
                console.info(`[Portioning] Info: Data nutrisi '${food_name}' menggunakan nilai gizi umum.`);
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
