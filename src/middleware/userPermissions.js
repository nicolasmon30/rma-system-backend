/**
 * Middleware que aplica filtros de usuarios según el rol
 * USER: no puede listar usuarios (se manejará en la ruta)
 * ADMIN: solo ve ADMIN y USER de sus países asignados
 * SUPERADMIN: ve todos los usuarios sin restricciones
 */
function filterUsersByRole() {
  return (req, res, next) => {
    try {
      // Verificar que el usuario esté autenticado
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      const { role, countries } = req.user;
      
      // Inicializar objeto de filtros que se pasará al servicio
      req.userFilters = {};

      console.log(`Aplicando filtros de usuarios para rol: ${role}`);

      switch (role) {
        case 'USER':
          // Los usuarios normales no deberían poder listar usuarios
          return res.status(403).json({
            success: false,
            message: 'No tienes permisos para listar usuarios'
          });

        case 'ADMIN':
          // Admin: solo ve usuarios ADMIN y USER de sus países
          if (!countries || countries.length === 0) {
            console.log('ADMIN sin países asignados');
            return res.status(403).json({
              success: false,
              message: 'No tienes países asignados'
            });
          }
          
          // Filtrar por roles permitidos (ADMIN y USER, no SUPERADMIN)
          req.userFilters.role = { in: ['ADMIN', 'USER'] };
          
          // Filtrar por países asignados
          const countryIds = countries.map(country => country.id);
          req.userFilters.countries = {
            some: {
              countryId: { in: countryIds }
            }
          };
          
          console.log(`Filtro aplicado - ADMIN: roles=[ADMIN,USER], países=${countryIds.join(', ')}`);
          break;

        case 'SUPERADMIN':
          // Superadmin: sin filtros, ve todos los usuarios
          console.log('SUPERADMIN: sin filtros, acceso total a usuarios');
          break;

        default:
          return res.status(403).json({
            success: false,
            message: 'Rol no válido'
          });
      }

      // Continuar al siguiente middleware/controlador
      next();
    } catch (error) {
      console.error('Error en middleware de permisos de usuarios:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al aplicar permisos'
      });
    }
  };
}

module.exports = { filterUsersByRole };