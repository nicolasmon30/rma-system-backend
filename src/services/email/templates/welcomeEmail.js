module.exports = {
    getWelcomeEmailTemplate: ({ nombre, apellido, email, empresa }) => `
        <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bienvenido al Sistema RMA</title>
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
          .welcome-title {
            color: #1f2937;
            font-size: 24px;
            margin-bottom: 20px;
          }
          .content {
            margin-bottom: 30px;
          }
          .user-info {
            background-color: #f3f4f6;
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
            <h1 class="welcome-title">¡Bienvenido ${nombre}!</h1>
          </div>
          
          <div class="content">
            <p>Nos complace darte la bienvenida a nuestro sistema de gestión RMA. Tu cuenta ha sido creada exitosamente.</p>
            
            <div class="user-info">
              <h3>Información de tu cuenta:</h3>
              <p><strong>Nombre:</strong> ${nombre} ${apellido}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Empresa:</strong> ${empresa}</p>
            </div>
            
            <p>Con tu nueva cuenta podrás:</p>
            <ul>
              <li>Crear y gestionar solicitudes RMA</li>
              <li>Hacer seguimiento de tus equipos</li>
              <li>Acceder al historial de servicios</li>
              <li>Recibir actualizaciones sobre el estado de tus solicitudes</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'https://yourdomain.com'}/login" class="btn">
                Iniciar Sesión
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
    getWelcomeEmailText: ({ nombre, apellido, empresa, email }) => `
        ¡Bienvenido ${nombre}!

        Nos complace darte la bienvenida a nuestro sistema de gestión RMA. Tu cuenta ha sido creada exitosamente.

        Información de tu cuenta:
        - Nombre: ${nombre} ${apellido}
        - Email: ${email}
        - Empresa: ${empresa}

        Con tu nueva cuenta podrás:
        - Crear y gestionar solicitudes RMA
        - Hacer seguimiento de tus equipos
        - Acceder al historial de servicios
        - Recibir actualizaciones sobre el estado de tus solicitudes

        Para iniciar sesión, visita: ${process.env.FRONTEND_URL || 'https://yourdomain.com'}/login

        Si tienes alguna pregunta, no dudes en contactarnos.

        © ${new Date().getFullYear()} Sistema RMA. Todos los derechos reservados.
    `
}