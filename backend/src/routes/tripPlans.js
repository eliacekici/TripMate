import express from 'express';
import pool from '../db.js'; 

const router = express.Router();

// ✅ CREATE A TRIP PLAN
router.post('/', async (req, res) => {
    const { userId, destination, startDate, endDate, notes } = req.body;

    if (!userId || !destination || !startDate || !endDate) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO trip_plans (user_id, destination, start_date, end_date, notes)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [userId, destination, startDate, endDate, notes || null]
        );

        res.status(201).json({
            success: true,
            message: 'TRIP_PLAN_CREATED',
            tripPlan: result.rows[0],
        });
    } catch (error) {
        console.error('Error saving trip plan:', error);
        res.status(500).json({ message: 'SERVER_ERROR' });
    }
});

// ✅ GET ALL TRIP PLANS FOR A USER
router.get('/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const result = await pool.query(
            `SELECT * FROM trip_plans WHERE user_id = $1 ORDER BY start_date ASC`,
            [userId]
        );

        res.status(200).json({
            message: 'TRIP_PLANS_FETCHED',
            tripPlans: result.rows,
        });
    } catch (error) {
        console.error('Error fetching trip plans:', error);
        res.status(500).json({ message: 'SERVER_ERROR' });
    }
});

export default router;
