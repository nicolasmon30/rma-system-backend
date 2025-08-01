const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const routes = require('./routes/index');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// Middlewares de seguridad
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    message: 'Demasiadas peticiones, intenta más tarde'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// Middlewares generales
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rutas principales
app.use('/api', routes);

// Ruta de health check
app.get('/health', (req, res) => {
  res.json({ 
    success: true,
    message: 'RMA System API funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Bienvenido al API del Sistema RMA',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
      auth: '/api/auth',
      users: '/api/users',
      rmas: '/api/rmas',
      products: '/api/products',
      brands: '/api/brands',
      countries: '/api/countries'
    }
  });
});

// Middleware para rutas no encontradas
app.use('*', notFound);

// Middleware de manejo de errores
app.use(errorHandler);

module.exports = app;