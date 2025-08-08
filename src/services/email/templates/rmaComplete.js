module.exports = {
  getRmaCompleteTemplate: ({ nombre, apellido, rmaId, empresa, servicioRealizado }) => `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>RMA Completado</title>
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
            .celebration {
                text-align: center;
                font-size: 48px;
                margin: 20px 0;
                animation: celebrate 2s ease-in-out infinite;
            }
            @keyframes celebrate {
                0%, 100% { transform: scale(1) rotate(0deg); }
                25% { transform: scale(1.1) rotate(-5deg); }
                75% { transform: scale(1.1) rotate(5deg); }
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
                text-align: center;
            }
            .completion-stats {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
                margin: 20px 0;
            }
            .stat-card {
                background-color: #f8fafc;
                padding: 15px;
                border-radius: 8px;
                text-align: center;
                border: 2px solid #e2e8f0;
            }
            .stat-icon {
                font-size: 24px;
                margin-bottom: 8px;
            }
            .stat-label {
                font-size: 12px;
                color: #64748b;
                text-transform: uppercase;
                font-weight: 600;
            }
            .stat-value {
                font-size: 16px;
                font-weight: bold;
                color: #1e293b;
            }
            .journey-box {
                background-color: #eff6ff;
                border-left: 4px solid #3b82f6;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .journey-step {
                display: flex;
                align-items: center;
                margin: 8px 0;
                padding: 8px;
                border-radius: 6px;
                background-color: #d1fae5;
                color: #065f46;
            }
            .testimonial-box {
                background-color: #fefce8;
                border: 2px solid #eab308;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                text-align: center;
            }
            .feedback-box {
                background-color: #f0f9ff;
                border-left: 4px solid #0ea5e9;
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
                background-color: #10b981;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 500;
                margin: 10px;
            }
            .btn-secondary {
                background-color: #3b82f6;
            }
            .rating-stars {
                font-size: 24px;
                color: #fbbf24;
                margin: 10px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🎉 Sistema RMA</div>
                <div class="celebration">🏆✨🎊</div>
                <h1 class="title">¡RMA Completado Exitosamente!</h1>
            </div>
            
            <div class="content">
                <p>Estimado/a <strong>${nombre} ${apellido}</strong>,</p>
                <p>¡Nos complace informarte que tu RMA ha sido completado exitosamente! Tu equipo ha sido entregado y el proceso está finalizado.</p>
                
                <div class="success-box">
                    <h3>✅ ¡PROCESO COMPLETADO!</h3>
                    <p><strong>RMA ID:</strong> ${rmaId}</p>
                    <p><strong>Empresa:</strong> ${empresa}</p>
                    <p><strong>Servicio:</strong> ${servicioRealizado}</p>
                    <div class="rating-stars">⭐⭐⭐⭐⭐</div>
                </div>
                
                <div class="completion-stats">
                    <div class="stat-card">
                        <div class="stat-icon">✅</div>
                        <div class="stat-label">Estado</div>
                        <div class="stat-value">Completado</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">📦</div>
                        <div class="stat-label">Entrega</div>
                        <div class="stat-value">Exitosa</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">🔧</div>
                        <div class="stat-label">Servicio</div>
                        <div class="stat-value">Finalizado</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">🛡️</div>
                        <div class="stat-label">Garantía</div>
                        <div class="stat-value">Activa</div>
                    </div>
                </div>
                
                <div class="journey-box">
                    <h3>🗺️ Resumen del Viaje</h3>
                    <div class="journey-step">✅ RMA Iniciado</div>
                    <div class="journey-step">✅ Equipo Recibido</div>
                    <div class="journey-step">✅ Evaluación Completada</div>
                    <div class="journey-step">✅ Pago Procesado</div>
                    <div class="journey-step">✅ Servicio Realizado</div>
                    <div class="journey-step">✅ Envío Completado</div>
                    <div class="journey-step">✅ Entrega Confirmada</div>
                </div>
                
                <div class="testimonial-box">
                    <h3>🌟 ¡Gracias por Confiar en Nosotros!</h3>
                    <p>Tu satisfacción es nuestra prioridad. Esperamos haber superado tus expectativas con nuestro servicio.</p>
                </div>
                
                <div class="feedback-box">
                    <h3>📝 ¿Qué Incluye tu Servicio Completado?</h3>
                    <ul>
                        <li><strong>✅ Certificado de servicio:</strong> Documento oficial del trabajo realizado</li>
                        <li><strong>🛡️ Garantía del servicio:</strong> Cobertura según términos y condiciones</li>
                        <li><strong>📋 Reporte técnico:</strong> Detalles del diagnóstico y reparación</li>
                        <li><strong>📞 Soporte post-servicio:</strong> Asistencia continua disponible</li>
                        <li><strong>🔄 Historial completo:</strong> Registro permanente en tu cuenta</li>
                    </ul>
                </div>
                
                <div style="text-align: center; margin-top: 30px;">
                    <a href="${process.env.FRONTEND_URL}/rmas/${rmaId}" class="btn">
                        📄 Ver Certificado de Servicio
                    </a>
                    <a href="${process.env.FRONTEND_URL}/feedback/${rmaId}" class="btn btn-secondary">
                        ⭐ Calificar Servicio
                    </a>
                </div>
                
                <div class="feedback-box">
                    <h3>💬 ¿Cómo Fue Tu Experiencia?</h3>
                    <p>Tu opinión es muy valiosa para nosotros. Te invitamos a calificar nuestro servicio y compartir tu experiencia.</p>
                    <p>Tu feedback nos ayuda a mejorar continuamente y brindar el mejor servicio posible.</p>
                </div>
            </div>
            
            <div class="footer">
                <p><strong>🎉 ¡Gracias por elegirnos para cuidar tus equipos!</strong></p>
                <p>📧 Soporte: <a href="mailto:${process.env.SUPPORT_EMAIL || 'soporte@rmasystem.com'}">${process.env.SUPPORT_EMAIL || 'soporte@rmasystem.com'}</a></p>
                <p>📞 Teléfono: ${process.env.SUPPORT_PHONE || '+57 (1) 234-5678'}</p>
                <p>🌐 Web: <a href="${process.env.FRONTEND_URL}">${process.env.FRONTEND_URL}</a></p>
                <p>© ${new Date().getFullYear()} Sistema RMA. Todos los derechos reservados.</p>
            </div>
        </div>
    </body>
    </html>
  `,

  getRmaCompleteText: ({ nombre, apellido, rmaId, empresa, servicioRealizado }) => `
🎉 ¡RMA COMPLETADO EXITOSAMENTE!

Estimado/a ${nombre} ${apellido},

¡Nos complace informarte que tu RMA ha sido completado exitosamente! Tu equipo ha sido entregado y el proceso está finalizado.

✅ PROCESO COMPLETADO:
- RMA ID: ${rmaId}
- Empresa: ${empresa}
- Servicio: ${servicioRealizado}
- Estado: COMPLETADO ⭐⭐⭐⭐⭐

📊 RESUMEN:
✅ Estado: Completado
📦 Entrega: Exitosa
🔧 Servicio: Finalizado
🛡️ Garantía: Activa

🗺️ RESUMEN DEL VIAJE:
✅ RMA Iniciado
✅ Equipo Recibido
✅ Evaluación Completada
✅ Pago Procesado
✅ Servicio Realizado
✅ Envío Completado
✅ Entrega Confirmada

🌟 ¡GRACIAS POR CONFIAR EN NOSOTROS!
Tu satisfacción es nuestra prioridad. Esperamos haber superado tus expectativas.

📝 QUÉ INCLUYE TU SERVICIO COMPLETADO:
- ✅ Certificado de servicio oficial
- 🛡️ Garantía según términos y condiciones
- 📋 Reporte técnico detallado
- 📞 Soporte post-servicio disponible
- 🔄 Historial completo en tu cuenta

🔗 Enlaces útiles:
- Ver certificado: ${process.env.FRONTEND_URL}/rmas/${rmaId}
- Calificar servicio: ${process.env.FRONTEND_URL}/feedback/${rmaId}

💬 ¿CÓMO FUE TU EXPERIENCIA?
Tu opinión es muy valiosa. Te invitamos a calificar nuestro servicio y compartir tu experiencia.

🎉 ¡Gracias por elegirnos para cuidar tus equipos!

📧 Soporte: ${process.env.SUPPORT_EMAIL || 'soporte@rmasystem.com'}
📞 Teléfono: ${process.env.SUPPORT_PHONE || '+57 (1) 234-5678'}
🌐 Web: ${process.env.FRONTEND_URL}

© ${new Date().getFullYear()} Sistema RMA. Todos los derechos reservados.
  `
};