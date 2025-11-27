import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';
import protectedRoutes from "./routes/protectedRoutes.js";
import pdfRoutes from './routes/pdfRoutes.js';
import quizRoutes from './routes/quizRoutes.js';


dotenv.config();

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL || 'https://eskuul.vercel.app',
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use("/api/protected", protectedRoutes);
app.use('/api/pdfs', pdfRoutes);
app.use('/api/quizzes', quizRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
