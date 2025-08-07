// ===== src/services/emailService.js =====
const { resend } = require('../../config/resend');
const welcomeTemplates = require('./templates/welcomeEmail');
const rmaApprovedTemplates = require('./templates/rmaApproved');
const rmaRejectedTemplates = require('./templates/rmaRejected');

class EmailService {
  // ===== HELPERS =====
  async _sendEmail({ to, subject, html, text }) {
    try {
      const data = await resend.emails.send({
        from: process.env.FROM_EMAIL,
        to,
        subject,
        html,
        text
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


}

module.exports = new EmailService();