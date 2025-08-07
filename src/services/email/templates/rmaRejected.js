module.exports = {
    getRmaRejectedTemplate : ({ nombre, apellido, rejectionReason, rmaId }) => 
    `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>RMA Rechazado</title>
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
                    <h1 class="title">Tu RMA ha sido rechazado</h1>
                </div>
                
                <div class="content">
                    <p>Hola ${nombre} ${apellido},</p>
                    <p>Lamentamos informarte que tu solicitud RMA no ha sido aprobada.</p>
                    
                    <div class="info-box">
                        <h3>Detalles del RMA:</h3>
                        <p><strong>Número de RMA:</strong> ${rmaId}</p>
                        <p><strong>Estado actual:</strong> Rechazado</p>
                        <p><strong>Razón del rechazo:</strong></p>
                        <p>${rejectionReason}</p>
                    </div>
                    
                    <p>Si consideras que esto es un error o necesitas más información, por favor contáctanos.</p>
                    
                    <div style="text-align: center;">
                        <a href="${process.env.FRONTEND_URL || 'https://yourdomain.com'}/contact" class="btn">
                            Contactar al soporte
                        </a>
                    </div>
                </div>
                
                <div class="footer">
                    <p>© ${new Date().getFullYear()} Sistema RMA. Todos los derechos reservados.</p>
                </div>
            </div>
        </body>
        </html>
        `,

    getRmaRejectedText : ({ nombre, apellido, rejectionReason, rmaId }) =>
        `
        Tu RMA ha sido rechazado

        Hola ${nombre} ${apellido},

        Lamentamos informarte que tu solicitud RMA no ha sido aprobada.

        Detalles del RMA:
        - Número de RMA: ${rmaId}
        - Estado actual: Rechazado
        - Razón del rechazo:
        ${rejectionReason}

        Si consideras que esto es un error o necesitas más información, por favor contáctanos.

        Para contactar al soporte, visita: ${process.env.FRONTEND_URL || 'https://yourdomain.com'}/contact

        © ${new Date().getFullYear()} Sistema RMA. Todos los derechos reservados.
        `
}