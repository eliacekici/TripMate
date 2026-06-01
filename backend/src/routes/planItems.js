import express from 'express';
import pool from '../db.js';

const router = express.Router();

const validTypes = new Set(['hotel', 'ticket', 'food', 'other', 'spot']);

router.post('/', async (req, res) => {
  const { userId, itemType, destination, tripStartDate, tripEndDate, payload } = req.body;

  if (!userId || !itemType || !payload) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  if (!validTypes.has(itemType)) {
    return res.status(400).json({ message: 'Invalid item type' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO plan_items (user_id, item_type, destination, trip_start_date, trip_end_date, payload)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, itemType, destination || null, tripStartDate || null, tripEndDate || null, payload]
    );

    return res.status(201).json({ success: true, planItem: result.rows[0] });
  } catch (error) {
    console.error('Error saving plan item:', error);
    return res.status(500).json({ message: 'SERVER_ERROR' });
  }
});

router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  const { type } = req.query;
  const values = [userId];
  let sql = 'SELECT * FROM plan_items WHERE user_id = $1';

  if (type && typeof type === 'string' && validTypes.has(type)) {
    sql += ' AND item_type = $2';
    values.push(type);
  }

  sql += ' ORDER BY created_at DESC';

  try {
    const result = await pool.query(sql, values);
    const planItems = result.rows.map((row) => ({
      ...row.payload,
      id: String(row.id),
      itemType: row.item_type,
      destination: row.destination,
      tripStartDate: row.trip_start_date,
      tripEndDate: row.trip_end_date,
      createdAt: row.created_at,
    }));
    return res.status(200).json({ success: true, planItems });
  } catch (error) {
    console.error('Error fetching plan items:', error);
    return res.status(500).json({ message: 'SERVER_ERROR' });
  }
});

router.delete('/:itemId', async (req, res) => {
  const { itemId } = req.params;

  try {
    await pool.query('DELETE FROM plan_items WHERE id = $1', [itemId]);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deleting plan item:', error);
    return res.status(500).json({ message: 'SERVER_ERROR' });
  }
});

export default router;
