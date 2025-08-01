// ===== src/services/emailService.js =====
const { resend } = require('../config/resend');

class EmailService {
  /**
   * Envía email de bienvenida al usuario registrado
   * @param {Object} userData - Datos del usuario
   * @param {string} userData.nombre - Nombre del usuario
   * @param {string} userData.apellido - Apellido del usuario
   * @param {string} userData.email - Email del usuario
   * @param {string} userData.empresa - Empresa del usuario
   * @returns {Object} Resultado del envío
   */
  async sendWelcomeEmail({ nombre, apellido, email, empresa }) {
    try {
      const data = await resend.emails.send({
        from: process.env.FROM_EMAIL || 'noreply@yourdomain.com',
        to: [email],
        subject: '¡Bienvenido a nuestro sistema RMA!',
        html: this.getWelcomeEmailTemplate({ nombre, apellido, empresa, email }),
        text: this.getWelcomeEmailText({ nombre, apellido, empresa, email })
      });

      console.log('Email de bienvenida enviado exitosamente:', data.id);
      return { success: true, emailId: data.id };
    } catch (error) {
      console.error('Error enviando email de bienvenida:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Plantilla HTML para email de bienvenida
   * @param {Object} userData - Datos del usuario
   * @returns {string} HTML del email
   */
  getWelcomeEmailTemplate({ nombre, apellido, empresa, email }) {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bienvenido al Sistema RMA</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
          }
          .container {
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
          }
          .welcome-title {
            color: #1f2937;
            font-size: 24px;
            margin-bottom: 20px;
          }
          .content {
            margin-bottom: 30px;
          }
          .user-info {
            background-color: #f3f4f6;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            color: #6b7280;
            font-size: 14px;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
            margin-top: 30px;
          }
          .btn {
            display: inline-block;
            background-color: #2563eb;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Sistema RMA</div>
            <h1 class="welcome-title">¡Bienvenido ${nombre}!</h1>
          </div>
          
          <div class="content">
            <p>Nos complace darte la bienvenida a nuestro sistema de gestión RMA. Tu cuenta ha sido creada exitosamente.</p>
            
            <div class="user-info">
              <h3>Información de tu cuenta:</h3>
              <p><strong>Nombre:</strong> ${nombre} ${apellido}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Empresa:</strong> ${empresa}</p>
            </div>
            
            <p>Con tu nueva cuenta podrás:</p>
            <ul>
              <li>Crear y gestionar solicitudes RMA</li>
              <li>Hacer seguimiento de tus equipos</li>
              <li>Acceder al historial de servicios</li>
              <li>Recibir actualizaciones sobre el estado de tus solicitudes</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'https://yourdomain.com'}/login" class="btn">
                Iniciar Sesión
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
            <p>© ${new Date().getFullYear()} Sistema RMA. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Versión de texto plano del email de bienvenida
   * @param {Object} userData - Datos del usuario
   * @returns {string} Texto plano del email
   */
  getWelcomeEmailText({ nombre, apellido, empresa, email }) {
    return `
¡Bienvenido ${nombre}!

Nos complace darte la bienvenida a nuestro sistema de gestión RMA. Tu cuenta ha sido creada exitosamente.

Información de tu cuenta:
- Nombre: ${nombre} ${apellido}
- Email: ${email}
- Empresa: ${empresa}

Con tu nueva cuenta podrás:
- Crear y gestionar solicitudes RMA
- Hacer seguimiento de tus equipos
- Acceder al historial de servicios
- Recibir actualizaciones sobre el estado de tus solicitudes

Para iniciar sesión, visita: ${process.env.FRONTEND_URL || 'https://yourdomain.com'}/login

Si tienes alguna pregunta, no dudes en contactarnos.

© ${new Date().getFullYear()} Sistema RMA. Todos los derechos reservados.
    `;
  }

  /**
   * Envía email de notificación para cambios de estado RMA
   * @param {Object} rmaData - Datos del RMA
   * @param {Object} userData - Datos del usuario
   * @returns {Object} Resultado del envío
   */
  async sendRmaStatusEmail(rmaData, userData) {
    try {
      const data = await resend.emails.send({
        from: process.env.FROM_EMAIL || 'noreply@yourdomain.com',
        to: [userData.email],
        subject: `Actualización de RMA #${rmaData.id}`,
        html: this.getRmaStatusTemplate(rmaData, userData),
        text: this.getRmaStatusText(rmaData, userData)
      });

      console.log('Email de estado RMA enviado exitosamente:', data.id);
      return { success: true, emailId: data.id };
    } catch (error) {
      console.error('Error enviando email de estado RMA:', error);
      return { success: false, error: error.message };
    }
  }

  getRmaStatusTemplate(rmaData, userData) {
    const statusTranslations = {
      'RMA_SUBMITTED': 'RMA Enviado',
      'AWAITING_GOODS': 'Esperando Equipos',
      'EVALUATING': 'En Evaluación',
      'PROCESSING': 'En Proceso',
      'PAYMENT': 'Esperando Pago',
      'IN_SHIPPING': 'En Envío',
      'COMPLETE': 'Completado',
      'REJECTED': 'Rechazado'
    };

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Actualización RMA</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
          }
          .container {
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-weight: bold;
            color: white;
            background-color: #2563eb;
          }
          .rma-info {
            background-color: #f3f4f6;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Actualización de RMA</h1>
          <p>Hola ${userData.nombre},</p>
          <p>Tu solicitud RMA ha sido actualizada:</p>
          
          <div class="rma-info">
            <p><strong>RMA ID:</strong> #${rmaData.id}</p>
            <p><strong>Estado:</strong> <span class="status-badge">${statusTranslations[rmaData.status] || rmaData.status}</span></p>
            <p><strong>Empresa:</strong> ${rmaData.nombreEmpresa}</p>
            ${rmaData.numeroTracking ? `<p><strong>Número de Tracking:</strong> ${rmaData.numeroTracking}</p>` : ''}
            ${rmaData.razonRechazo ? `<p><strong>Razón de Rechazo:</strong> ${rmaData.razonRechazo}</p>` : ''}
          </div>
          
          <p>Puedes revisar los detalles completos en tu panel de usuario.</p>
        </div>
      </body>
      </html>
    `;
  }

  getRmaStatusText(rmaData, userData) {
    const statusTranslations = {
      'RMA_SUBMITTED': 'RMA Enviado',
      'AWAITING_GOODS': 'Esperando Equipos',
      'EVALUATING': 'En Evaluación',
      'PROCESSING': 'En Proceso',
      'PAYMENT': 'Esperando Pago',
      'IN_SHIPPING': 'En Envío',
      'COMPLETE': 'Completado',
      'REJECTED': 'Rechazado'
    };

    return `
Hola ${userData.nombre},

Tu solicitud RMA ha sido actualizada:

RMA ID: #${rmaData.id}
Estado: ${statusTranslations[rmaData.status] || rmaData.status}
Empresa: ${rmaData.nombreEmpresa}
${rmaData.numeroTracking ? `Número de Tracking: ${rmaData.numeroTracking}` : ''}
${rmaData.razonRechazo ? `Razón de Rechazo: ${rmaData.razonRechazo}` : ''}

Puedes revisar los detalles completos en tu panel de usuario.
    `;
  }
}

module.exports = new EmailService();