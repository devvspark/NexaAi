

import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { clerkMiddleware, requireAuth } from '@clerk/express'
import aiRouter from './routes/aiRoutes.js';
import downloadRouter from './routes/downloadRoutes.js';
import connectCloudinary from './configs/cloudinary.js';
import userRouter from './routes/userRoutes.js';

const app=express()

await connectCloudinary();

app.use(cors()) // all the request is pass using cors
app.use(express.json());
app.use(clerkMiddleware())

app.get('/',(req,res)=>res.send('Server is live')) // whenever we will hit this path (/) this message display
app.use(requireAuth()); // // only logged in user can access this route

app.use('/api/ai',aiRouter);
app.use('/api/user',userRouter);
app.use('/api/download',downloadRouter);

const PORT=process.env.PORT || 3000;


app.listen(PORT,()=>{
    console.log('Server is running on port',PORT)
})