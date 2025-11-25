import express from 'express';
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import routes from './routes/index.js';

dotenv.config()


const app = express()

app.use(express.json())
app.use(cors())


const PORT = process.env.PORT || 8000

mongoose.connect(process.env.MONGODB_URL)
.then(()=>{
    console.log("Connected to MongoDB");
    app.listen(PORT, ()=>{
        console.log(`Server started running at port ${PORT}`);
    })
})



app.get('/', (req, res)=>{
    res.status(200).json({
        status: "success",
        message: "Your Restaurant Management Server is running"
    });
})

app.use('/api/', routes)

app.use((req, res)=>{
    res.status(404).json({
        status: "fail",
        message: "Route not found, API endpoint does not exist"
    });
})

// app.listen(PORT, ()=>{
//         console.log(`Server started running at port ${PORT}`);
//     })