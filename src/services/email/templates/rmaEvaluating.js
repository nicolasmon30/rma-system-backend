module.exports ={
    getRmaEvaluatingTemplate : ({ nombre, apellido, trackingNumber, rmaId }) =>
        `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>RMA en Evaluación</title>
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
                    <h1>¡Hemos recibido tu equipo!</h1>
                </div>
                
                <div class="content">
                    <p>Hola ${nombre} ${apellido},</p>
                    <p>Queremos informarte que hemos recibido exitosamente tu equipo con número de tracking <strong>${trackingNumber}</strong> y hemos comenzado el proceso de evaluación.</p>
                    
                    <div class="info-box">
                        <h3>Detalles del RMA:</h3>
                        <p><strong>Número de RMA:</strong> ${rmaId}</p>
                        <p><strong>Número de Tracking:</strong> ${trackingNumber}</p>
                        <p><strong>Estado actual:</strong> En evaluación</p>
                    </div>
                    
                    <p>El proceso de evaluación puede tomar de 3 a 5 días hábiles. Te notificaremos tan pronto tengamos resultados.</p>
                    
                    <div style="text-align: center;">
                        <a href="${process.env.FRONTEND_URL}/rmas/${rmaId}" class="btn">
                            Ver estado del RMA
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
    getRmaEvaluatingText:({ nombre, apellido, trackingNumber, rmaId }) =>
        `
        Hemos recibido tu equipo

        Hola ${nombre} ${apellido},

        Queremos informarte que hemos recibido exitosamente tu equipo con número de tracking ${trackingNumber} y hemos comenzado el proceso de evaluación.

        Detalles del RMA:
        - Número de RMA: ${rmaId}
        - Número de Tracking: ${trackingNumber}
        - Estado actual: En evaluación

        El proceso de evaluación puede tomar de 3 a 5 días hábiles. Te notificaremos tan pronto tengamos resultados.

        Para ver el estado del RMA: ${process.env.FRONTEND_URL}/rmas/${rmaId}

        Si tienes alguna pregunta, no dudes en contactarnos.

        © ${new Date().getFullYear()} Sistema RMA. Todos los derechos reservados.
    `   
}