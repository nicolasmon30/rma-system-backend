require('dotenv').config();
const app = require('./src/app');
const { connectDB } = require('./src/config/database');
const { initializeScheduler } = require('./src/config/scheduler');
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Conectar a la base de datos
    await connectDB();

    // 2. Inicializar el scheduler de recordatorios
    console.log('⏰ Inicializando sistema de recordatorios...');
    await initializeScheduler(); // 👈 NUEVA LÍNEA

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log('🚀 Servidor RMA System iniciado');
      console.log(`📡 Puerto: ${PORT}`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔍 Prisma Studio: npx prisma studio`);
      const schedulerEnabled = process.env.NODE_ENV === 'production' ||
        process.env.ENABLE_SCHEDULER === 'true';
      console.log(`⏰ Scheduler de recordatorios: ${schedulerEnabled ? '✅ ACTIVO' : '❌ DESHABILITADO'}`);

      if (!schedulerEnabled) {
        console.log('💡 Para habilitar en desarrollo: export ENABLE_SCHEDULER=true');
      }
    });
  } catch (error) {
    console.error('❌ Error iniciando servidor:', error);
    process.exit(1);
  }
}

startServer();