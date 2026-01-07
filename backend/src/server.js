import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js'; 
import tripPlanRoutes from './routes/tripPlans.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.use('/api/trip-plans', tripPlanRoutes);

app.listen(5000, () => {
  console.log('TripMate backend running on http://localhost:5000');
});