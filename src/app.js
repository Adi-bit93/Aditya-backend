import express from 'express';
import cors from 'cors';
import cookieparser from 'cookie-parser';


const app = express();
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true, limit:"16kb"}))  //for form data
app.use(express.static("public")) 
app.use(cookieparser());


//routes import
import userRouter from './routes/user.routes.js';
import commentRoutes from './routes/comment.routes.js';
import likeRoutes from "./routes/like.routes.js"


// routes declaration
app.use('/api/v1/users', userRouter)
app.use('/api/v1/comments', commentRoutes); 
app.use('/api/v1/likes', likeRoutes)



export { app}