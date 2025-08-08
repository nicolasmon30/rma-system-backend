// ===== src/services/email/templates/paymentReminder.js =====
module.exports = {
  getPaymentReminderTemplate: ({ nombre, apellido, rmaId, daysSincePayment }) => `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recordatorio de Pago</title>
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
            .title {
                color: #1f2937;
                font-size: 24px;
                margin-bottom: 20px;
            }
            .content { 
                margin-bottom: 30px; 
            }
            .warning-box { 
                background-color: #fef3c7; 
                border-left: 4px solid #f59e0b; 
                padding: 20px; 
                border-radius: 8px; 
                margin: 20px 0; 
            }
            .info-box { 
                background-color: #f0f9ff; 
                border-left: 4px solid #3b82f6; 
                padding: 20px; 
                border-radius: 8px; 
                margin: 20px 0; 
            }
            .urgent-box {
                background-color: #fef2f2; 
                border-left: 4px solid #ef4444; 
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
                background-color: #f59e0b; 
                color: white; 
                padding: 12px 24px; 
                text-decoration: none; 
                border-radius: 6px; 
                font-weight: bold;
                margin: 20px 0;
            }
            .btn.urgent { 
                background-color: #dc2626; 
                animation: pulse 2s infinite;
            }
            @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.8; }
                100% { opacity: 1; }
            }
            .stats {
                display: flex;
                justify-content: space-around;
                margin: 20px 0;
                text-align: center;
            }
            .stat {
                background-color: #f3f4f6;
                padding: 15px;
                border-radius: 8px;
                flex: 1;
                margin: 0 5px;
            }
            .stat-number {
                font-size: 24px;
                font-weight: bold;
                color: #f59e0b;
            }
            .stat-label {
                font-size: 12px;
                color: #6b7280;
                text-transform: uppercase;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🔔 Sistema RMA</div>
                <h1 class="title">Recordatorio de Pago Pendiente</h1>
            </div>
            
            <div class="content">
                <p>Hola <strong>${nombre} ${apellido}</strong>,</p>
                <p>Te enviamos este recordatorio amigable sobre el pago pendiente para tu solicitud RMA.</p>
                
                <div class="stats">
                    <div class="stat">
                        <div class="stat-number">${daysSincePayment}</div>
                        <div class="stat-label">Días transcurridos</div>
                    </div>
                    <div class="stat">
                        <div class="stat-number">${rmaId.slice(-4)}</div>
                        <div class="stat-label">RMA ID</div>
                    </div>
                    <div class="stat">
                        <div class="stat-number">💰</div>
                        <div class="stat-label">Estado: Pago</div>
                    </div>
                </div>
                
                ${daysSincePayment <= 7 ? `
                <div class="warning-box">
                    <h3>⏰ Pago Pendiente</h3>
                    <p><strong>Número de RMA:</strong> ${rmaId}</p>
                    <p><strong>Estado actual:</strong> Esperando pago</p>
                    <p>Tu cotización está lista y esperando confirmación de pago.</p>
                </div>
                ` : `
                <div class="urgent-box">
                    <h3>🚨 Atención Urgente Requerida</h3>
                    <p><strong>Número de RMA:</strong> ${rmaId}</p>
                    <p><strong>Días transcurridos:</strong> ${daysSincePayment} días</p>
                    <p><strong>⚠️ Este RMA requiere atención inmediata para evitar retrasos en el servicio.</strong></p>
                </div>
                `}
                
                <div class="info-box">
                    <h3>📋 Pasos siguientes</h3>
                    <ol>
                        <li><strong>Revisar cotización:</strong> Consulta el PDF que te enviamos anteriormente</li>
                        <li><strong>Realizar pago:</strong> Procede según las instrucciones de pago</li>
                        <li><strong>Enviar comprobante:</strong> Remite el comprobante de pago</li>
                        <li><strong>Confirmación:</strong> Te notificaremos cuando iniciemos el servicio</li>
                    </ol>
                </div>
                
                <p>Una vez confirmemos tu pago, procederemos inmediatamente con el ${daysSincePayment > 7 ? '<strong>procesamiento urgente</strong>' : 'procesamiento'} de tu solicitud.</p>
                
                <div style="text-align: center; margin-top: 30px;">
                    <a href="${process.env.FRONTEND_URL}/rmas/${rmaId}" class="btn ${daysSincePayment > 7 ? 'urgent' : ''}">
                        ${daysSincePayment > 7 ? '🚨 Ver RMA (URGENTE)' : '👆 Ver Detalles del RMA'}
                    </a>
                </div>
                
                ${daysSincePayment > 10 ? `
                <div class="urgent-box">
                    <h3>⚡ Acción Inmediata Requerida</h3>
                    <p>Han transcurrido más de 10 días desde tu cotización. Para evitar la cancelación automática de tu solicitud, te recomendamos contactarnos inmediatamente.</p>
                    <p><strong>📞 Línea directa:</strong> ${process.env.SUPPORT_PHONE || '+57 (1) 234-5678'}</p>
                    <p><strong>📧 Email urgente:</strong> <a href="mailto:${process.env.SUPPORT_EMAIL || 'soporte@rmasystem.com'}" style="color: #dc2626; font-weight: bold;">${process.env.SUPPORT_EMAIL || 'soporte@rmasystem.com'}</a></p>
                </div>
                ` : ''}
            </div>
            
            <div class="footer">
                <p>💡 <em>Si ya realizaste el pago, por favor ignora este mensaje o envíanos el comprobante.</em></p>
                <p>📧 Soporte técnico: <a href="mailto:${process.env.SUPPORT_EMAIL || 'soporte@rmasystem.com'}">${process.env.SUPPORT_EMAIL || 'soporte@rmasystem.com'}</a></p>
                <p>🕒 Horario de atención: Lunes a Viernes, 8:00 AM - 6:00 PM</p>
                <p>© ${new Date().getFullYear()} Sistema RMA. Todos los derechos reservados.</p>
            </div>
        </div>
    </body>
    </html>
  `,

  getPaymentReminderText: ({ nombre, apellido, rmaId, daysSincePayment }) => `
⏰ RECORDATORIO DE PAGO PENDIENTE

Hola ${nombre} ${apellido},

Te enviamos este recordatorio sobre el pago pendiente para tu solicitud RMA.

📊 RESUMEN:
- RMA ID: ${rmaId}
- Días transcurridos: ${daysSincePayment} días
- Estado: Esperando pago
${daysSincePayment > 7 ? '- ⚠️ URGENTE: Requiere atención inmediata' : ''}

📋 PASOS SIGUIENTES:
1. Revisar cotización: Consulta el PDF enviado anteriormente
2. Realizar pago: Procede según las instrucciones
3. Enviar comprobante: Remite el comprobante de pago
4. Confirmación: Te notificaremos al iniciar el servicio

Una vez confirmemos tu pago, procederemos inmediatamente con el ${daysSincePayment > 7 ? 'procesamiento urgente' : 'procesamiento'} de tu solicitud.

🔗 Ver detalles: ${process.env.FRONTEND_URL}/rmas/${rmaId}

${daysSincePayment > 7 ? `
🚨 ATENCIÓN URGENTE:
Han transcurrido más de 7 días desde la cotización. Te recomendamos contactarnos inmediatamente para evitar retrasos en tu servicio.
` : ''}

${daysSincePayment > 10 ? `
⚡ ACCIÓN INMEDIATA REQUERIDA:
Más de 10 días transcurridos. Contacta urgentemente para evitar cancelación automática:
📞 ${process.env.SUPPORT_PHONE || '+57 (1) 234-5678'}
📧 ${process.env.SUPPORT_EMAIL || 'soporte@rmasystem.com'}
` : ''}

💡 Si ya realizaste el pago, por favor ignora este mensaje.

📧 Soporte: ${process.env.SUPPORT_EMAIL || 'soporte@rmasystem.com'}
🕒 Horario: Lunes a Viernes, 8:00 AM - 6:00 PM

© ${new Date().getFullYear()} Sistema RMA. Todos los derechos reservados.
  `
};