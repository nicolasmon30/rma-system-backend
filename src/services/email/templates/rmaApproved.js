module.exports = {
    getRmaApprovedTemplate : ({ nombre, apellido, trackingNumber, rmaId }) => `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>RMA Aprobado</title>
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
                .info-box {
                    background-color: #f0fdf4;
                    border-left: 4px solid #10b981;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                }
                .tracking-info {
                    background-color: #eff6ff;
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
                    <h1 class="title">¡Tu RMA ha sido aprobado!</h1>
                </div>
                
                <div class="content">
                    <p>Hola ${nombre} ${apellido},</p>
                    <p>Nos complace informarte que tu solicitud RMA ha sido aprobada y está lista para el siguiente paso.</p>
                    
                    <div class="info-box">
                        <h3>Detalles del RMA:</h3>
                        <p><strong>Número de RMA:</strong> ${rmaId}</p>
                        <p><strong>Estado actual:</strong> Aprobado - Esperando recepción de equipo</p>
                    </div>
                    
                    <div class="tracking-info">
                        <h3>Información de envío:</h3>
                        <p><strong>Número de tracking:</strong> ${trackingNumber}</p>
                        <p>Por favor, utiliza este número para enviar el equipo a nuestras instalaciones.</p>
                    </div>
                    
                    <p>Próximos pasos:</p>
                    <ol>
                        <li>Empaqueta cuidadosamente el equipo</li>
                        <li>Incluye una copia de esta notificación</li>
                        <li>Envía el paquete a la dirección proporcionada</li>
                    </ol>
                    
                    <div style="text-align: center;">
                        <a href="${process.env.FRONTEND_URL || 'https://yourdomain.com'}/rmas/${rmaId}" class="btn">
                            Ver detalles del RMA
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
    `,
    getRmaApprovedText : ({ nombre, apellido, trackingNumber, rmaId }) => `
        ¡Tu RMA ha sido aprobado!

        Hola ${nombre} ${apellido},

        Nos complace informarte que tu solicitud RMA ha sido aprobada y está lista para el siguiente paso.

        Detalles del RMA:
        - Número de RMA: ${rmaId}
        - Estado actual: Aprobado

        Información de envío:
        - Número de Tracking: ${trackingNumber}
        Por favor, utiliza este número para hacer seguimiento a tu rma.

        Próximos pasos:
        1. Empaqueta cuidadosamente el equipo
        2. Incluye una copia de esta notificación
        3. Envía el paquete a la dirección proporcionada

        Para ver los detalles del RMA, visita: ${process.env.FRONTEND_URL || 'https://yourdomain.com'}/rmas/${rmaId}

        Si tienes alguna pregunta, no dudes en contactarnos.

        © ${new Date().getFullYear()} Sistema RMA. Todos los derechos reservados.
    `
}