/**
 * Middleware que aplica filtros de RMA según el rol del usuario
 * USER: solo ve sus propios RMAs
 * ADMIN: solo ve RMAs de sus países asignados
 * SUPERADMIN: ve todos los RMAs
 */
function filterRmasByRole() {
  return (req, res, next) => {
    try {
      // Verificar que el usuario esté autenticado
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      const { id: userId, role, countries } = req.user;
      
      // Inicializar objeto de filtros que se pasará al servicio
      req.rmaFilters = {};

      console.log(`Aplicando filtros para rol: ${role}`);

      switch (role) {
        case 'USER':
          // Usuario normal: solo ve sus propios RMAs
          req.rmaFilters.userId = userId;
          console.log(`Filtro aplicado - USER: userId = ${userId}`);
          break;

        case 'ADMIN':
          // Admin: solo ve RMAs de sus países asignados
          if (!countries || countries.length === 0) {
            console.log('ADMIN sin países asignados');
            return res.status(403).json({
              success: false,
              message: 'No tienes países asignados'
            });
          }
          
          // Extraer los IDs de los países
          const countryIds = countries.map(country => country.id);
          req.rmaFilters.countryId = { in: countryIds };
          console.log(`Filtro aplicado - ADMIN: países = ${countryIds.join(', ')}`);
          break;

        case 'SUPERADMIN':
          // Superadmin: no necesita filtros, ve todo
          console.log('SUPERADMIN: sin filtros, acceso total');
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
      console.error('Error en middleware de permisos:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al aplicar permisos'
      });
    }
  };
}

module.exports = { filterRmasByRole };