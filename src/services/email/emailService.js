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

  async sendRmaEvaluatingEmail({nombre, apellido, email, trackingNumber, rmaId}){
    return this._sendEmail({
      to: [email],
      subject: `Tu RMA #${rmaId} está en evaluación`,
      html: rmaEvaluatingTemplates.getRmaEvaluatingTemplate({nombre,apellido,trackingNumber,rmaId}),
      text: rmaEvaluatingTemplates.getRmaEvaluatingText({nombre,apellido,trackingNumber,rmaId})
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


}

module.exports = new EmailService();