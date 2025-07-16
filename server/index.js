import express from 'express'
import cors from 'cors'
import authRouter from './routes/authRoutes.js'
import commonRoutes from './routes/commonRoutes.js'
import branchRoutes from './routes/branchRoutes.js'
//import popupRoutes from './routes/popupRoutes.js'
import productRoutes from './routes/productRoutes.js'
import profileRoutes from './routes/profileRoutes.js'
import uploadRoutes from './routes/uploadRoutes.js'
import testRoutes from './routes/testRoutes.js'
import session from 'express-session';

const app = express()

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://localhost:5173',
    'https://localhost:5174'
  ],  // your frontend origin
  credentials: true,               // important for session cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}))

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // true in production with HTTPS
    maxAge: 3 * 1000 * 60 * 60 // 3 hours 
  }
}))


app.use(express.json())
app.use('/auth', authRouter)
app.use('/data', commonRoutes)
app.use('/branch', branchRoutes)
//app.use('/popup', popupRoutes)
app.use('/product', productRoutes)
app.use('/profile', profileRoutes)
app.use('/fileUpload', uploadRoutes) // Assuming you have uploadRoutes defined
app.use('/test', testRoutes)
app.get('/', (req, res) => {
    console.log("req.body")
})

app.listen(3000, () => {
    console.log("Server is Running on port 3000")
})