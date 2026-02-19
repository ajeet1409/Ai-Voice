import express from "express";
import dotenv from "dotenv";
import userRoute from './routes/userRoutes.js';
import omnidimProxy from './routes/omnidimProxy.js';
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import path from "path";

dotenv.config();
import Cors from "cors";


const app = express();

app.use(Cors(
   {
    origin:process.env.FRONTEND_URL,
    credentials:true,
      methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
   }
))
app.use(cookieParser());
app.use(express.json())
app.use(express.urlencoded({extended: true}))

const PORT  = process.env.PORT 
const MONGODB_URI = process.env.MONGODB_URI

const dirname = path.resolve();
// console.log("dirname",dirname);

app.use('/api/users', userRoute)
app.use('/api/omnidim', omnidimProxy)

// try {
//     mongoose.connect(URI).then(() => {
//         console.log('Connected to MongoDB')
//     })
// } catch (error) {

//     console.log(`Mongodb not connected: ${error.message}`);
    
// }
try {
    mongoose.connect(MONGODB_URI)
.then(
    console.log("mongodb connection")
)
} catch (error) {
    console.log(`Mongodb not connected: ${error.message}`);
    
}


// Serve static files from the React app

// API health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Serve static files from the React app
app.use(express.static(path.join(dirname, '/AiVoiceHragent/dist')));

// Catch-all route - serve React app for any non-API routes
// This must be AFTER all API routes
// app.use((req, res,next )=> {
//     // Only serve index.html for non-API routes
//     if (!req.path.startsWith('/api')) {
//         res.sendFile(path.resolve(dirname, 'AiVoiceHragent', 'dist', 'index.html'));
//     } else {
//         next();
//     }
// });

// app.get('*', (req, res) => {
//     res.sendFile(path.resolve(dirname, 'AiVoiceHragent', 'dist', 'index.html'));
//   });

app.use(( _  ,res)=>{
    res.sendFile(path.resolve(dirname,"AiVoiceHragent","dist","index.html"))
})

app.listen(PORT, () => {
    console.log(`Server is listening on port  ${PORT}`)
})
