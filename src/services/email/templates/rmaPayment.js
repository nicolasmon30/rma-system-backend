module.exports = {
  getRmaPaymentTemplate: ({ nombre, apellido, rmaId }) => `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cotización Lista</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }
            .content { margin-bottom: 30px; }
            .info-box { background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; }
            .btn { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">Sistema RMA</div>
                <h1>¡Cotización lista para tu RMA #${rmaId}!</h1>
            </div>
            
            <div class="content">
                <p>Hola ${nombre} ${apellido},</p>
                <p>Hemos completado la evaluación de tu equipo y adjuntamos la cotización para tu aprobación.</p>
                
                <div class="info-box">
                    <h3>Detalles del RMA:</h3>
                    <p><strong>Número de RMA:</strong> ${rmaId}</p>
                    <p><strong>Estado actual:</strong> Evaluando</p>
                </div>
                
                <p>Por favor revisa el PDF adjunto con los detalles de la cotización.</p>
                <p>Para proceder con el pago o si tienes alguna pregunta, no dudes en contactarnos.</p>
                
                <div style="text-align: center; margin-top: 30px;">
                    <a href="${process.env.FRONTEND_URL}/rmas/${rmaId}" class="btn">
                        Ver detalles del RMA
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

  getRmaPaymentText: ({ nombre, apellido, rmaId }) => `
    Cotización lista para tu RMA #${rmaId}

    Hola ${nombre} ${apellido},

    Hemos completado la evaluación de tu equipo y adjuntamos la cotización para tu aprobación.

    Detalles del RMA:
    - Número de RMA: ${rmaId}
    - Estado actual: Evaluando

    Por favor revisa el PDF adjunto con los detalles de la cotización.

    Para proceder con el pago o si tienes alguna pregunta, no dudes en contactarnos.

    Ver detalles del RMA: ${process.env.FRONTEND_URL}/rmas/${rmaId}

    © ${new Date().getFullYear()} Sistema RMA. Todos los derechos reservados.
  `
};