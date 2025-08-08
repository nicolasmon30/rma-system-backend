module.exports = {
  getRmaProcessingTemplate: ({ nombre, apellido, rmaId, empresa }) => `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>RMA en Procesamiento</title>
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
            .success-box {
                background-color: #f0fdf4;
                border-left: 4px solid #10b981;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .info-box {
                background-color: #eff6ff;
                border-left: 4px solid #3b82f6;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
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
            .step-active {
                background-color: #10b981;
                color: white;
                font-weight: bold;
            }
            .step-completed {
                background-color: #d1fae5;
                color: #065f46;
            }
            .step-pending {
                background-color: #f9fafb;
                color: #6b7280;
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
                margin: 20px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">⚡ Sistema RMA</div>
                <h1 class="title">¡Pago Confirmado - Procesamiento Iniciado!</h1>
            </div>
            
            <div class="content">
                <p>Hola <strong>${nombre} ${apellido}</strong>,</p>
                <p>¡Excelentes noticias! Hemos confirmado tu pago y tu RMA ya está en procesamiento activo.</p>
                
                <div class="success-box">
                    <h3>✅ Pago Confirmado</h3>
                    <p><strong>Número de RMA:</strong> ${rmaId}</p>
                    <p><strong>Empresa:</strong> ${empresa}</p>
                    <p><strong>Estado actual:</strong> En procesamiento</p>
                    <p><strong>📧 Recordatorios de pago:</strong> Pausados automáticamente</p>
                </div>
                
                <div class="progress">
                    <h3>📋 Progreso de tu RMA:</h3>
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
                    <div class="progress-step step-active">
                        <span>⚡ EN PROCESAMIENTO</span>
                    </div>
                    <div class="progress-step step-pending">
                        <span>⏳ Servicio en Curso</span>
                    </div>
                    <div class="progress-step step-pending">
                        <span>⏳ Envío de Retorno</span>
                    </div>
                    <div class="progress-step step-pending">
                        <span>⏳ Completado</span>
                    </div>
                </div>
                
                <div class="info-box">
                    <h3>🔧 ¿Qué sigue ahora?</h3>
                    <ul>
                        <li><strong>Procesamiento activo:</strong> Nuestro equipo técnico ya está trabajando en tu equipo</li>
                        <li><strong>Tiempo estimado:</strong> Recibirás actualizaciones del progreso</li>
                        <li><strong>Sin más pagos:</strong> No necesitas hacer nada más</li>
                        <li><strong>Notificaciones:</strong> Te informaremos de cada paso importante</li>
                    </ul>
                </div>
                
                <p>Te mantendremos informado del progreso y te notificaremos tan pronto como tu equipo esté listo para el envío de retorno.</p>
                
                <div style="text-align: center;">
                    <a href="${process.env.FRONTEND_URL}/rmas/${rmaId}" class="btn">
                        👆 Ver Estado del RMA
                    </a>
                </div>
            </div>
            
            <div class="footer">
                <p>¡Gracias por confiar en nuestros servicios!</p>
                <p>📧 Si tienes preguntas: <a href="mailto:${process.env.SUPPORT_EMAIL || 'soporte@rmasystem.com'}">${process.env.SUPPORT_EMAIL || 'soporte@rmasystem.com'}</a></p>
                <p>© ${new Date().getFullYear()} Sistema RMA. Todos los derechos reservados.</p>
            </div>
        </div>
    </body>
    </html>
  `,

  getRmaProcessingText: ({ nombre, apellido, rmaId, empresa }) => `
    ¡Pago Confirmado - Procesamiento Iniciado!

    Hola ${nombre} ${apellido},

    ¡Excelentes noticias! Hemos confirmado tu pago y tu RMA ya está en procesamiento activo.

    ✅ Detalles:
    - Número de RMA: ${rmaId}
    - Empresa: ${empresa}
    - Estado actual: En procesamiento
    - Recordatorios de pago: Pausados automáticamente

    📋 Progreso de tu RMA:
    ✅ RMA Enviado
    ✅ RMA Aprobado  
    ✅ Equipo Recibido
    ✅ Evaluación Completada
    ✅ Pago Confirmado
    ⚡ EN PROCESAMIENTO (ACTUAL)
    ⏳ Servicio en Curso
    ⏳ Envío de Retorno
    ⏳ Completado

    🔧 ¿Qué sigue ahora?
    - Procesamiento activo: Nuestro equipo técnico ya está trabajando
    - Tiempo estimado: Recibirás actualizaciones del progreso
    - Sin más pagos: No necesitas hacer nada más
    - Notificaciones: Te informaremos de cada paso importante

    Te mantendremos informado del progreso y te notificaremos tan pronto como tu equipo esté listo.

    Ver estado del RMA: ${process.env.FRONTEND_URL}/rmas/${rmaId}

    ¡Gracias por confiar en nuestros servicios!

    📧 Soporte: ${process.env.SUPPORT_EMAIL || 'soporte@rmasystem.com'}

    © ${new Date().getFullYear()} Sistema RMA. Todos los derechos reservados.
  `
};