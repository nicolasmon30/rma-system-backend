const schedulerService = require('../services/schedulerService');

/**
 * Inicializa el servicio de recordatorios automáticos
 * Se ejecuta al arrancar el servidor
 */
async function initializeScheduler() {
  try {
    console.log('⏰ Configurando sistema de recordatorios...');

    // Determinar si el scheduler debe ejecutarse
    const shouldRunScheduler = process.env.NODE_ENV === 'production' || 
                               process.env.ENABLE_SCHEDULER === 'true';

    if (shouldRunScheduler) {
      console.log('✅ Condiciones cumplidas para activar scheduler');
      console.log(`🌍 Entorno: ${process.env.NODE_ENV}`);
      console.log(`🔧 ENABLE_SCHEDULER: ${process.env.ENABLE_SCHEDULER}`);
      console.log(`🕐 Zona horaria: ${process.env.TIMEZONE || 'America/Bogota'}`);
      
      // Iniciar el servicio de recordatorios
      schedulerService.start();
      
      console.log('✅ Scheduler de recordatorios inicializado correctamente');
      console.log('📅 Programado para ejecutarse todos los días a las 9:00 AM');
      
      // Mostrar próxima ejecución si está disponible
      const status = schedulerService.getStatus();
      if (status.nextExecution) {
        console.log(`⏭️  Próxima ejecución: ${new Date(status.nextExecution).toLocaleString('es-CO')}`);
      }
      
    } else {
      console.log('ℹ️  Scheduler de recordatorios deshabilitado');
      console.log(`🌍 Entorno actual: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔧 ENABLE_SCHEDULER: ${process.env.ENABLE_SCHEDULER || 'undefined'}`);
      console.log('💡 Para habilitar en desarrollo: export ENABLE_SCHEDULER=true');
      console.log('💡 O usar: npm run dev:scheduler');
    }

    // Configurar manejo de señales de cierre graceful
    setupGracefulShutdown();

  } catch (error) {
    console.error('❌ Error inicializando scheduler de recordatorios:', error);
    console.error('🔍 Detalles del error:', {
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    
    // No lanzar el error para no interrumpir el arranque del servidor
    // Solo registrar el error y continuar
    console.log('⚠️  El servidor continuará sin el sistema de recordatorios');
  }
}

/**
 * Configura el manejo de cierre graceful del scheduler
 */
function setupGracefulShutdown() {
  // Manejar SIGTERM (señal de terminación)
  process.on('SIGTERM', () => {
    console.log('\n🔄 Recibida señal SIGTERM - Cerrando scheduler gracefully...');
    shutdownScheduler();
  });

  // Manejar SIGINT (Ctrl+C)
  process.on('SIGINT', () => {
    console.log('\n🔄 Recibida señal SIGINT (Ctrl+C) - Cerrando scheduler gracefully...');
    shutdownScheduler();
  });

  // Manejar errores no capturados
  process.on('uncaughtException', (error) => {
    console.error('❌ Excepción no capturada en scheduler:', error);
    shutdownScheduler();
    process.exit(1);
  });

  // Manejar promesas rechazadas no manejadas
  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promesa rechazada no manejada en scheduler:', reason);
    console.error('🔍 Promesa:', promise);
  });
}

/**
 * Cierra el scheduler de forma segura
 */
function shutdownScheduler() {
  try {
    console.log('🛑 Deteniendo servicio de recordatorios...');
    schedulerService.stop();
    console.log('✅ Scheduler detenido correctamente');
  } catch (error) {
    console.error('❌ Error cerrando scheduler:', error);
  }
}

/**
 * Obtiene el estado actual del scheduler (para debugging)
 */
function getSchedulerStatus() {
  try {
    return schedulerService.getStatus();
  } catch (error) {
    console.error('❌ Error obteniendo estado del scheduler:', error);
    return {
      isRunning: false,
      error: error.message
    };
  }
}

/**
 * Fuerza una ejecución manual del scheduler (para testing)
 */
async function runManualExecution() {
  try {
    console.log('🔧 Ejecutando scheduler manualmente...');
    await schedulerService.runManualCheck();
    console.log('✅ Ejecución manual completada');
  } catch (error) {
    console.error('❌ Error en ejecución manual:', error);
    throw error;
  }
}

// Exportar funciones
module.exports = { 
  initializeScheduler,
  getSchedulerStatus,
  runManualExecution,
  shutdownScheduler
};