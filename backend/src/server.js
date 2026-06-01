import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import tripPlanRoutes from './routes/tripPlans.js';
import planItemRoutes from './routes/planItems.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/trip-plans', tripPlanRoutes);
app.use('/api/plan-items', planItemRoutes);

app.listen(5000, '0.0.0.0', () => {
  console.log('TripMate backend running on http://localhost:5000');
});