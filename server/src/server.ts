import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { connectDB } from './db/db';

// Import routes
import userRoutes from './routes/userRoutes';
import triggerRoutes from './routes/triggerRoutes';
import symptomRoutes from './routes/symptomRoutes';
import medicationRoutes from './routes/medicationRoutes';
import dailyInputRoutes from './routes/dailyInputRoutes';
import predictionRoutes from './routes/predictionRoutes';
import doctorAssistantRoutes from './routes/doctorAssistantRoutes';

// Load environment variables
dotenv.config();
console.log("🔑 OpenRouter Key Check:", process.env.OPENROUTER_API_KEY ? "✅ Loaded" : "❌ Missing");

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
connectDB()
  .then(() => console.log('Database connected'))
  .catch((err) => {
    console.error('Database connection error', err);
    process.exit(1);
  });

// Base Route
app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to the AI Health Tracker API');
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/triggers', triggerRoutes);
app.use('/api/symptoms', symptomRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/daily-inputs', dailyInputRoutes);
app.use('/api/predictions', predictionRoutes); 
app.use('/api/assistant', doctorAssistantRoutes);

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

