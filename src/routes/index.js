const express = require('express');
const router = express.Router();

// Importar rutas específicas
const authRoutes = require('./auth');
const countryRoutes = require('./countries');
const rmaRoutes = require('./rma');
const userRoutes = require('./users');

// Ruta de prueba inicial
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'API RMA System funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Usar rutas específicas
router.use('/auth', authRoutes);
router.use('/countries', countryRoutes);
router.use('/rma', rmaRoutes);
router.use('/users', userRoutes);

// Documentación básica de endpoints
router.get('/docs', (req, res) => {
  res.json({
    success: true,
    message: 'Documentación de API RMA System',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile',
        updateProfile: 'PUT /api/auth/profile',
        changePassword: 'PUT /api/auth/change-password',
        logout: 'POST /api/auth/logout',
        verify: 'GET /api/auth/verify'
      },
      countries: {
        list: 'GET /api/countries'
      },
      rma: {
        create: 'POST /api/rma'
      }
    },
    examples: {
      register: {
        method: 'POST',
        url: '/api/auth/register',
        body: {
          nombre: 'Juan',
          apellido: 'Pérez',
          direccion: 'Calle 123 #45-67',
          telefono: '+57123456789',
          empresa: 'Mi Empresa SAS',
          email: 'juan@miempresa.com',
          password: 'MiPassword123!',
          countryId: 'country-id-here'
        }
      },
      login: {
        method: 'POST',
        url: '/api/auth/login',
        body: {
          email: 'juan@miempresa.com',
          password: 'MiPassword123!'
        }
      }
    }
  });
});

module.exports = router;