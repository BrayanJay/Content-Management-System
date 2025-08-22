import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import authRouter from './routes/authRoutes.js'
import commonRoutes from './routes/commonRoutes.js'
import branchRoutes from './routes/branchRoutes.js'
import productRoutes from './routes/productRoutes.js'
import profileRoutes from './routes/profileRoutes.js'
import uploadRoutes from './routes/uploadRoutes.js'
import loggerRoutes from './routes/loggerRoutes.js'
import userRoutes from './routes/userRoutes.js'
import sessionRoutes from './routes/sessionRoutes.js'
import session from 'express-session';
import path from 'path'
import { fileURLToPath } from 'url'
import { requestLogger, errorLogger } from './middleware/loggingMiddleware.js'
import Logger from './utils/logger.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

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
  name: 'aaf.cms.sid', // Custom session name to avoid conflicts
  cookie: {
    httpOnly: true,
    secure: false, // true in production with HTTPS
    maxAge: 3 * 1000 * 60 * 60, // 3 hours 
    sameSite: 'lax' // Better cross-browser support
  },
  // Enable concurrent sessions for multiple users
  rolling: true, // Reset expiry on activity
  unset: 'destroy' // Cleanup on logout
}))


app.use(express.json())

// Add request logging middleware
app.use(requestLogger)

app.use('/auth', authRouter)
app.use('/data', commonRoutes)
app.use('/branch', branchRoutes)
app.use('/product', productRoutes)
app.use('/profile', profileRoutes)
app.use('/fileUpload', uploadRoutes) // Assuming you have uploadRoutes defined
app.use('/logs', loggerRoutes) // Add logger routes
app.use('/users', userRoutes) // Add user management routes
app.use('/sessions', sessionRoutes) // Add session monitoring routes
app.get('/', (req, res) => {
    res.json({ message: "AAF CMS API Server is running", status: "OK" });
})
app.use('/media', express.static(path.join(__dirname, 'media')));

// Add error logging middleware (should be last)
app.use(errorLogger)

app.listen(3000, async () => {
    console.log("Server is Running on port 3000")
    
    // Log server startup
    await Logger.info({
        category: 'SYSTEM',
        action: 'SERVER_START',
        message: 'AAF CMS Server started successfully',
        details: {
            port: 3000,
            environment: process.env.NODE_ENV || 'development',
            timestamp: new Date().toISOString()
        }
    })
    
    console.log("Role-based access control system is active")
})