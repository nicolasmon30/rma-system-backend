// ===== src/services/schedulerService.js =====
// ARCHIVO CORREGIDO - REEMPLAZAR COMPLETAMENTE

const cron = require('node-cron');
const { prisma } = require('../config/database');
const emailService = require('./email/emailService');

class SchedulerService {
  constructor() {
    this.reminderTask = null;
    this.isRunning = false;
    this.cronExpression = process.env.TEST_MODE === 'true'
      ? '*/30 * * * * *'  // 👈 Cada 30 segundos para testing
      : '0 9 * * *';
    this.timezone = process.env.TIMEZONE || 'America/Bogota';
  }

  /**
   * Inicia el servicio de recordatorios
   * Se ejecuta cada día a las 9:00 AM
   */
  start() {
    if (this.isRunning) {
      console.log('⚠️  Scheduler ya está en ejecución');
      return;
    }

    try {
      // Ejecutar cada día a las 9:00 AM
      this.reminderTask = cron.schedule(this.cronExpression, async () => {
        console.log('🔔 Ejecutando verificación de recordatorios de pago...');
        await this.checkPaymentReminders();
      }, {
        scheduled: false,
        timezone: this.timezone
      });

      this.reminderTask.start();
      this.isRunning = true;

      console.log('✅ Servicio de recordatorios iniciado');
      console.log(`📅 Se ejecutará todos los días a las 9:00 AM (${this.timezone})`);
      console.log(`🕐 Próxima ejecución aproximada: ${this.getNextExecutionTime()}`);

    } catch (error) {
      console.error('❌ Error iniciando scheduler:', error);
      this.isRunning = false;
      throw error;
    }
  }

  /**
   * Detiene el servicio de recordatorios
   */
  stop() {
    try {
      if (this.reminderTask) {
        this.reminderTask.stop();
        this.reminderTask.destroy(); // Liberar recursos
        this.reminderTask = null;
      }
      this.isRunning = false;
      console.log('🛑 Servicio de recordatorios detenido');
    } catch (error) {
      console.error('❌ Error deteniendo scheduler:', error);
    }
  }

  /**
   * Verifica y envía recordatorios de pago
   */
  async checkPaymentReminders() {
    try {
      const now = new Date();
      const daysForTesting = process.env.TEST_MODE === 'true' ? 0 : 3;
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(now.getDate() - daysForTesting);

      console.log(`🔍 Buscando RMAs que necesiten recordatorio (desde ${threeDaysAgo.toISOString()})`);

      // Buscar RMAs en estado PAYMENT que necesitan recordatorio
      const rmasNeedingReminder = await prisma.rma.findMany({
        where: {
          status: 'PAYMENT',
          OR: [
            // RMAs que cambiaron a PAYMENT hace exactamente 3 días
            {
              updatedAt: {
                gte: new Date(threeDaysAgo.getFullYear(), threeDaysAgo.getMonth(), threeDaysAgo.getDate()),
                lt: new Date(threeDaysAgo.getFullYear(), threeDaysAgo.getMonth(), threeDaysAgo.getDate() + 1)
              }
            },
            // RMAs que necesitan recordatorio cada 3 días
            {
              lastReminderSent: {
                lte: threeDaysAgo
              }
            },
            // RMAs que nunca han recibido recordatorio y tienen más de 3 días
            {
              lastReminderSent: null,
              updatedAt: {
                lte: threeDaysAgo
              }
            }
          ]
        },
        include: {
          user: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              email: true
            }
          }
        }
      });

      console.log(`📊 Encontrados ${rmasNeedingReminder.length} RMAs que necesitan recordatorio`);

      if (rmasNeedingReminder.length === 0) {
        console.log('✨ No hay RMAs que requieran recordatorio en este momento');
        return;
      }

      // Enviar recordatorios
      let successCount = 0;
      let errorCount = 0;

      for (const rma of rmasNeedingReminder) {
        try {
          console.log(`📧 Enviando recordatorio para RMA ${rma.id} (usuario: ${rma.user.email})`);

          await this.sendPaymentReminder(rma);

          // Actualizar fecha del último recordatorio
          await prisma.rma.update({
            where: { id: rma.id },
            data: { lastReminderSent: now }
          });

          console.log(`✅ Recordatorio enviado exitosamente para RMA ${rma.id}`);
          successCount++;

          // Pequeña pausa entre envíos para no sobrecargar el servicio de email
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`❌ Error enviando recordatorio para RMA ${rma.id}:`, error.message);
          errorCount++;
        }
      }

      console.log(`🎉 Proceso de recordatorios completado:`);
      console.log(`   ✅ Exitosos: ${successCount}`);
      console.log(`   ❌ Errores: ${errorCount}`);
      console.log(`   📊 Total procesados: ${rmasNeedingReminder.length}`);

    } catch (error) {
      console.error('❌ Error crítico en checkPaymentReminders:', error);
      throw error;
    }
  }

  /**
   * Envía un recordatorio de pago individual
   */
  async sendPaymentReminder(rma) {
    try {
      const daysSincePayment = Math.floor(
        (new Date() - new Date(rma.lastReminderSent || rma.updatedAt)) / (1000 * 60 * 60 * 24)
      );

      console.log(`📅 RMA ${rma.id}: ${daysSincePayment} días desde último recordatorio/actualización`);

      await emailService.sendPaymentReminderEmail({
        nombre: rma.user.nombre,
        apellido: rma.user.apellido,
        email: rma.user.email,
        rmaId: rma.id,
        daysSincePayment,
        cotizacionUrl: rma.cotizacion // Agregar URL de cotización si existe
      });

    } catch (error) {
      console.error(`❌ Error en sendPaymentReminder para RMA ${rma.id}:`, error);
      throw error;
    }
  }

  /**
   * Ejecuta el chequeo manualmente (para testing)
   */
  async runManualCheck() {
    console.log('🔧 Ejecutando verificación manual de recordatorios...');
    console.log('📍 Iniciado por solicitud manual del administrador');

    try {
      await this.checkPaymentReminders();
      console.log('✅ Verificación manual completada exitosamente');
    } catch (error) {
      console.error('❌ Error en verificación manual:', error);
      throw error;
    }
  }

  /**
   * Calcula la próxima ejecución programada
   */
  getNextExecutionTime() {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0); // Hoy a las 9:00 AM

      // Si ya pasaron las 9:00 AM de hoy, la próxima ejecución es mañana
      if (now > today) {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toLocaleString('es-CO', {
          timeZone: this.timezone,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      } else {
        // Si aún no son las 9:00 AM, la próxima ejecución es hoy
        return today.toLocaleString('es-CO', {
          timeZone: this.timezone,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch (error) {
      console.error('❌ Error calculando próxima ejecución:', error);
      return 'No disponible';
    }
  }

  /**
   * Obtiene estadísticas del scheduler
   */
  getStatus() {
    try {
      return {
        isRunning: this.isRunning,
        cronExpression: this.cronExpression,
        timezone: this.timezone,
        nextExecution: this.isRunning ? this.getNextExecutionTime() : null,
        taskExists: this.reminderTask !== null,
        version: 'v1.0.0'
      };
    } catch (error) {
      console.error('❌ Error obteniendo status del scheduler:', error);
      return {
        isRunning: false,
        error: error.message,
        cronExpression: this.cronExpression,
        timezone: this.timezone
      };
    }
  }

  /**
   * Valida la configuración del scheduler
   */
  validateConfiguration() {
    const issues = [];

    // Validar zona horaria
    try {
      new Date().toLocaleString('es-CO', { timeZone: this.timezone });
    } catch (error) {
      issues.push(`Zona horaria inválida: ${this.timezone}`);
    }

    // Validar expresión cron
    if (!cron.validate(this.cronExpression)) {
      issues.push(`Expresión cron inválida: ${this.cronExpression}`);
    }

    // Validar variables de entorno necesarias
    if (!process.env.RESEND_API_KEY) {
      issues.push('Variable RESEND_API_KEY no configurada');
    }

    return {
      isValid: issues.length === 0,
      issues: issues
    };
  }

  /**
   * Obtiene información de debugging
   */
  getDebugInfo() {
    const validation = this.validateConfiguration();

    return {
      status: this.getStatus(),
      validation: validation,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        ENABLE_SCHEDULER: process.env.ENABLE_SCHEDULER,
        TIMEZONE: process.env.TIMEZONE,
        RESEND_API_KEY_SET: !!process.env.RESEND_API_KEY
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        uptime: process.uptime()
      }
    };
  }
}

module.exports = new SchedulerService();