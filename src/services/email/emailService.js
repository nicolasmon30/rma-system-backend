// ===== src/services/emailService.js =====
const { resend } = require('../../config/resend');
const supabase = require('../../config/supabase');
const fs = require('fs').promises;
const path = require('path');
const welcomeTemplates = require('./templates/welcomeEmail');
const rmaApprovedTemplates = require('./templates/rmaApproved');
const rmaRejectedTemplates = require('./templates/rmaRejected');
const rmaEvaluatingTemplates = require('./templates/rmaEvaluating');
const rmaPaymentTemplates = require('./templates/rmaPayment');
const rmaProcessingTemplates = require('./templates/rmaProcessing');
const paymentReminderTemplates = require('./templates/paymentReminder');

class EmailService {
  // ===== HELPERS =====
  async _sendEmail({ to, subject, html, text, attachments = [] }) {
    try {
      const data = await resend.emails.send({
        from: process.env.FROM_EMAIL,
        to,
        subject,
        html,
        text,
        attachments
      });
      console.log(`Email enviado exitosamente: ${data.id}`);
      return { success: true, emailId: data.id };
    } catch (error) {
      console.error('Error enviando email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Envía email de bienvenida al usuario registrado
   * @param {Object} userData - Datos del usuario
   * @param {string} userData.nombre - Nombre del usuario
   * @param {string} userData.apellido - Apellido del usuario
   * @param {string} userData.email - Email del usuario
   * @param {string} userData.empresa - Empresa del usuario
   * @returns {Object} Resultado del envío
   */
  async sendWelcomeEmail(userData) {
    return this._sendEmail({
      to: [userData.email],
      subject: '¡Bienvenido a nuestro sistema RMA!',
      html: welcomeTemplates.getWelcomeEmailTemplate(userData),
      text: welcomeTemplates.getWelcomeEmailText(userData)
    });
  }

  // ===== RMA EMAILS =====
  async sendRmaApprovedEmail({ nombre, apellido, email, trackingNumber, rmaId }) {
    return this._sendEmail({
      to: [email],
      subject: `Tu RMA #${rmaId} ha sido aprobado`,
      html: rmaApprovedTemplates.getRmaApprovedTemplate({ nombre, apellido, trackingNumber, rmaId }),
      text: rmaApprovedTemplates.getRmaApprovedText({ nombre, apellido, trackingNumber, rmaId })
    });
  }

  async sendRmaRejectedEmail({ nombre, apellido, email, rejectionReason, rmaId }) {
    return this._sendEmail({
      to: [email],
      subject: `Tu RMA #${rmaId} ha sido rechazado`,
      html: rmaRejectedTemplates.getRmaRejectedTemplate({ nombre, apellido, rejectionReason, rmaId }),
      text: rmaRejectedTemplates.getRmaRejectedText({ nombre, apellido, rejectionReason, rmaId })
    });
  }

  async sendRmaEvaluatingEmail({ nombre, apellido, email, trackingNumber, rmaId, empresa }) {
    return this._sendEmail({
      to: [email],
      subject: `Tu RMA #${rmaId} está en evaluación`,
      html: rmaEvaluatingTemplates.getRmaEvaluatingTemplate({ nombre, apellido, trackingNumber, rmaId, empresa }),
      text: rmaEvaluatingTemplates.getRmaEvaluatingText({ nombre, apellido, trackingNumber, rmaId, empresa })
    });
  }

  async sendRmaProcessingEmail({ nombre, apellido, email, trackingNumber, rmaId }) {
    return this._sendEmail({
      to: [email],
      subject: `Tu RMA #${rmaId} está en Proceso`,
      html: rmaProcessingTemplates.getRmaProcessingTemplate({ nombre, apellido, trackingNumber, rmaId }),
      text: rmaProcessingTemplates.getRmaProcessingText({ nombre, apellido, trackingNumber, rmaId })
    });
  }

  // ===== RMA PAYMENT EMAIL =====
  async sendRmaPaymentEmail({ nombre, apellido, email, rmaId, cotizacionUrl }) {
    try {
      // 1. Descargar el PDF temporalmente desde Supabase
      const filePath = cotizacionUrl.split('/rma-files/')[1];
      const { data: pdfBuffer, error } = await supabase.storage
        .from('rma-files')
        .download(filePath);

      if (error) throw error;

      const tempFilePath = path.join('/tmp', `cotizacion-${rmaId}.pdf`);
      await fs.writeFile(tempFilePath, await pdfBuffer.arrayBuffer());

      // 2. Enviar email con adjunto
      const result = await this._sendEmail({
        to: [email],
        subject: `Cotización lista para tu RMA #${rmaId}`,
        html: rmaPaymentTemplates.getRmaPaymentTemplate({ nombre, apellido, rmaId }),
        text: rmaPaymentTemplates.getRmaPaymentText({ nombre, apellido, rmaId }),
        attachments: [{
          filename: `cotizacion-${rmaId}.pdf`,
          content: await fs.readFile(tempFilePath)
        }]
      });

      // 3. Limpiar archivo temporal
      await fs.unlink(tempFilePath);

      return result;
    } catch (error) {
      console.error('Error en sendRmaPaymentEmail:', error);
      return { success: false, error: error.message };
    }
  }

  /**
 * Envía email de recordatorio de pago
 * @param {Object} reminderData - Datos para el recordatorio
 * @param {string} reminderData.nombre - Nombre del usuario
 * @param {string} reminderData.apellido - Apellido del usuario
 * @param {string} reminderData.email - Email del usuario
 * @param {string} reminderData.rmaId - ID del RMA
 * @param {number} reminderData.daysSincePayment - Días desde el último recordatorio/actualización
 * @param {string} reminderData.cotizacionUrl - URL de la cotización (opcional)
 * @returns {Object} Resultado del envío
 */
  async sendPaymentReminderEmail(reminderData) {
    try {
      console.log(`📧 Preparando email de recordatorio para ${reminderData.email}`);
      console.log(`📊 Días transcurridos: ${reminderData.daysSincePayment}`);

      const paymentReminderTemplates = require('./templates/paymentReminder');

      // Determinar urgencia del recordatorio
      const isUrgent = reminderData.daysSincePayment > 7;
      const isCritical = reminderData.daysSincePayment > 10;

      // Crear subject dinámico basado en urgencia
      let subject = `⏰ Recordatorio: Pago pendiente para RMA #${reminderData.rmaId}`;

      if (isCritical) {
        subject = `🚨 URGENTE: Pago requerido para RMA #${reminderData.rmaId} (${reminderData.daysSincePayment} días)`;
      } else if (isUrgent) {
        subject = `⚠️ Recordatorio importante: Pago pendiente RMA #${reminderData.rmaId}`;
      }

      console.log(`📝 Subject del email: ${subject}`);

      const result = await this._sendEmail({
        to: [reminderData.email],
        subject: subject,
        html: paymentReminderTemplates.getPaymentReminderTemplate(reminderData),
        text: paymentReminderTemplates.getPaymentReminderText(reminderData)
      });

      if (result.success) {
        console.log(`✅ Email de recordatorio enviado exitosamente a ${reminderData.email}`);
        console.log(`📧 Email ID: ${result.emailId}`);
      } else {
        console.error(`❌ Error enviando email de recordatorio a ${reminderData.email}:`, result.error);
      }

      return result;

    } catch (error) {
      console.error('❌ Error en sendPaymentReminderEmail:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }


}

module.exports = new EmailService();