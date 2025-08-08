module.exports = {
    getRmaInShippingTemplate: ({ nombre, apellido, rmaId, trackingInformation }) => `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Equipo Enviado</title>
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
            .shipping-icon {
                font-size: 48px;
                margin-bottom: 20px;
                animation: truck-move 3s ease-in-out infinite;
            }
            @keyframes truck-move {
                0%, 100% { transform: translateX(-10px); }
                50% { transform: translateX(10px); }
            }
            .content {
                margin-bottom: 30px;
            }
            .success-box {
                background-color: #f0fdf4;
                border-left: 4px solid #10b981;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .shipping-box {
                background-color: #eff6ff;
                border-left: 4px solid #3b82f6;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                text-align: center;
            }
            .tracking-box {
                background-color: #fef3c7;
                border: 2px solid #f59e0b;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                text-align: center;
            }
            .tracking-number {
                font-size: 24px;
                font-weight: bold;
                color: #f59e0b;
                background-color: white;
                padding: 10px 20px;
                border-radius: 8px;
                margin: 10px 0;
                letter-spacing: 2px;
                border: 2px dashed #f59e0b;
            }
            .progress {
                background-color: #f3f4f6;
                border-radius: 10px;
                padding: 20px;
                margin: 20px 0;
            }
            .progress-step {
                display: flex;
                align-items: center;
                margin: 10px 0;
                padding: 10px;
                border-radius: 8px;
            }
            .step-completed {
                background-color: #d1fae5;
                color: #065f46;
            }
            .step-active {
                background-color: #3b82f6;
                color: white;
                font-weight: bold;
                animation: pulse-blue 2s infinite;
            }
            .step-pending {
                background-color: #f9fafb;
                color: #6b7280;
            }
            @keyframes pulse-blue {
                0% { opacity: 1; }
                50% { opacity: 0.7; }
                100% { opacity: 1; }
            }
            .delivery-info {
                background-color: #f0f9ff;
                border-left: 4px solid #3b82f6;
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
                background-color: #3b82f6;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 500;
                margin: 20px 10px;
            }
            .btn-secondary {
                background-color: #f59e0b;
            }
            .celebration {
                text-align: center;
                font-size: 32px;
                margin: 20px 0;
                animation: celebrate 2s ease-in-out infinite;
            }
            @keyframes celebrate {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">📦 Sistema RMA</div>
                <div class="shipping-icon">🚛</div>
                <h1 class="title">¡Tu Equipo Ya Está en Camino!</h1>
                <div class="celebration">🎉✨🎉</div>
            </div>
            
            <div class="content">
                <p>Hola <strong>${nombre} ${apellido}</strong>,</p>
                <p>¡Excelentes noticias! Hemos completado el servicio de tu equipo y ya está en camino de regreso a ti.</p>
                
                <div class="success-box">
                    <h3>✅ Servicio Completado</h3>
                    <p><strong>Número de RMA:</strong> ${rmaId}</p>
                    <p><strong>Estado actual:</strong> En envío</p>
                    <p><strong>🎯 ¡Tu equipo está en perfectas condiciones y listo para usar!</strong></p>
                </div>
                
                <div class="tracking-box">
                    <h3>📍 Información de Envío</h3>
                    <p><strong>Número de Tracking:</strong></p>
                    <div class="tracking-number">${trackingInformation}</div>
                    <p>Usa este número para hacer seguimiento en tiempo real del envío de tu equipo.</p>
                </div>
                
                <div class="progress">
                    <h3>📋 Estado del RMA:</h3>
                    <div class="progress-step step-completed">
                        <span>✅ RMA Enviado</span>
                    </div>
                    <div class="progress-step step-completed">
                        <span>✅ RMA Aprobado</span>
                    </div>
                    <div class="progress-step step-completed">
                        <span>✅ Equipo Recibido</span>
                    </div>
                    <div class="progress-step step-completed">
                        <span>✅ Evaluación Completada</span>
                    </div>
                    <div class="progress-step step-completed">
                        <span>✅ Pago Confirmado</span>
                    </div>
                    <div class="progress-step step-completed">
                        <span>✅ Servicio Completado</span>
                    </div>
                    <div class="progress-step step-active">
                        <span>🚛 EN ENVÍO (ACTUAL)</span>
                    </div>
                    <div class="progress-step step-pending">
                        <span>⏳ Entrega</span>
                    </div>
                </div>
                
                <div class="delivery-info">
                    <h3>📅 Información de Entrega</h3>
                    <ul>
                        <li><strong>Tiempo estimado:</strong> 2-5 días hábiles</li>
                        <li><strong>Horario de entrega:</strong> Lunes a Viernes, 8:00 AM - 6:00 PM</li>
                        <li><strong>Seguimiento:</strong> Recibirás actualizaciones automáticas</li>
                        <li><strong>Entrega:</strong> En la dirección registrada en tu RMA</li>
                    </ul>
                </div>
                
                <div class="shipping-box">
                    <h3>📦 ¿Qué esperar?</h3>
                    <p>🔧 <strong>Servicio completado:</strong> Tu equipo ha sido reparado/calibrado según las especificaciones</p>
                    <p>📋 <strong>Documentación incluida:</strong> Certificado de servicio y reporte técnico</p>
                    <p>🛡️ <strong>Garantía del servicio:</strong> Información incluida en el paquete</p>
                    <p>📞 <strong>Soporte post-servicio:</strong> Disponible si necesitas asistencia</p>
                </div>
                
                <div style="text-align: center; margin-top: 30px;">
                    <a href="https://tracking.ejemplo.com?number=${trackingInformation}" class="btn">
                        📍 Rastrear Envío
                    </a>
                    <a href="${process.env.FRONTEND_URL}/rmas/${rmaId}" class="btn btn-secondary">
                        📄 Ver Detalles del RMA
                    </a>
                </div>
                
                <div style="text-align: center; margin-top: 20px; padding: 20px; background-color: #f0fdf4; border-radius: 8px;">
                    <h3 style="color: #065f46; margin: 0;">🎉 ¡Gracias por confiar en nosotros!</h3>
                    <p style="color: #065f46; margin: 10px 0;">Esperamos que disfrutes tu equipo renovado.</p>
                </div>
            </div>
            
            <div class="footer">
                <p>Si tienes alguna pregunta sobre el envío, no dudes en contactarnos.</p>
                <p>📧 Soporte: <a href="mailto:${process.env.SUPPORT_EMAIL || 'soporte@rmasystem.com'}">${process.env.SUPPORT_EMAIL || 'soporte@rmasystem.com'}</a></p>
                <p>📞 Teléfono: ${process.env.SUPPORT_PHONE || '+57 (1) 234-5678'}</p>
                <p>🕒 Horario: Lunes a Viernes, 8:00 AM - 6:00 PM</p>
                <p>© ${new Date().getFullYear()} Sistema RMA. Todos los derechos reservados.</p>
            </div>
        </div>
    </body>
    </html>
  `,

    getRmaInShippingText: ({ nombre, apellido, rmaId, trackingInformation }) => `
🚛 ¡Tu Equipo Ya Está en Camino!

Hola ${nombre} ${apellido},

¡Excelentes noticias! Hemos completado el servicio de tu equipo y ya está en camino de regreso a ti.

✅ SERVICIO COMPLETADO:
- Número de RMA: ${rmaId}
- Estado actual: En envío
- Tu equipo está en perfectas condiciones y listo para usar

📍 INFORMACIÓN DE ENVÍO:
- Número de Tracking: ${trackingInformation}
- Usa este número para hacer seguimiento en tiempo real

📋 ESTADO DEL RMA:
✅ RMA Enviado
✅ RMA Aprobado  
✅ Equipo Recibido
✅ Evaluación Completada
✅ Pago Confirmado
✅ Servicio Completado
🚛 EN ENVÍO (ACTUAL)
⏳ Entrega

📅 INFORMACIÓN DE ENTREGA:
- Tiempo estimado: 2-5 días hábiles
- Horario: Lunes a Viernes, 8:00 AM - 6:00 PM
- Seguimiento: Recibirás actualizaciones automáticas
- Entrega: En la dirección registrada en tu RMA

📦 ¿QUÉ ESPERAR?
🔧 Servicio completado según especificaciones
📋 Documentación incluida: Certificado y reporte técnico
🛡️ Garantía del servicio incluida en el paquete
📞 Soporte post-servicio disponible

🔗 Enlaces útiles:
- Rastrear envío: https://tracking.ejemplo.com?number=${trackingInformation}
- Ver RMA: ${process.env.FRONTEND_URL}/rmas/${rmaId}

🎉 ¡Gracias por confiar en nosotros!
Esperamos que disfrutes tu equipo renovado.

📧 Soporte: ${process.env.SUPPORT_EMAIL || 'soporte@rmasystem.com'}
📞 Teléfono: ${process.env.SUPPORT_PHONE || '+57 (1) 234-5678'}
🕒 Horario: Lunes a Viernes, 8:00 AM - 6:00 PM

© ${new Date().getFullYear()} Sistema RMA. Todos los derechos reservados.
  `
};