const authService = require('../services/authService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

class AuthController {
  /**
   * Registra un nuevo usuario
   */
  async register(req, res) {
    try {
      const { nombre, apellido, direccion, telefono, empresa, email, password, countryId } = req.body;

      const result = await authService.register({
        nombre,
        apellido,
        direccion,
        telefono,
        empresa,
        email,
        password,
        countryId
      });

      return successResponse(res, result, 'Usuario registrado exitosamente', 201);
    } catch (error) {
      console.error('Error en registro:', error);
      
      if (error.message.includes('Ya existe un usuario')) {
        return errorResponse(res, error.message, 409);
      }
      
      return errorResponse(res, error.message || 'Error al registrar usuario', 400);
    }
  }

  /**
   * Inicia sesión
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      const result = await authService.login({ email, password });

      return successResponse(res, result, 'Inicio de sesión exitoso');
    } catch (error) {
      console.error('Error en login:', error);
      
      if (error.message === 'Credenciales inválidas') {
        return errorResponse(res, 'Email o contraseña incorrectos', 401);
      }
      
      return errorResponse(res, 'Error al iniciar sesión', 500);
    }
  }

  /**
   * Obtiene el perfil del usuario autenticado
   */
  async getProfile(req, res) {
    try {
      const userId = req.user.id;

      const user = await authService.getProfile(userId);

      return successResponse(res, user, 'Perfil obtenido exitosamente');
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      return errorResponse(res, 'Error al obtener perfil', 500);
    }
  }

  /**
   * Actualiza el perfil del usuario
   */
  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const { nombre, apellido, direccion, telefono, empresa } = req.body;

      const user = await authService.updateProfile(userId, {
        nombre,
        apellido,
        direccion,
        telefono,
        empresa
      });

      return successResponse(res, user, 'Perfil actualizado exitosamente');
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      return errorResponse(res, 'Error al actualizar perfil', 500);
    }
  }

  /**
   * Cambia la contraseña del usuario
   */
  async changePassword(req, res) {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      const result = await authService.changePassword(userId, currentPassword, newPassword);

      return successResponse(res, null, result.message);
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      
      if (error.message === 'La contraseña actual es incorrecta') {
        return errorResponse(res, error.message, 401);
      }
      
      return errorResponse(res, 'Error al cambiar contraseña', 500);
    }
  }

  /**
   * Logout (invalidar token - lado cliente)
   */
  async logout(req, res) {
    try {
      // En un sistema JWT stateless, el logout se maneja en el cliente
      // Aquí podrías implementar una blacklist de tokens si es necesario
      
      return successResponse(res, null, 'Sesión cerrada exitosamente');
    } catch (error) {
      console.error('Error en logout:', error);
      return errorResponse(res, 'Error al cerrar sesión', 500);
    }
  }

  /**
   * Verifica si el token es válido
   */
  async verifyToken(req, res) {
    try {
      // Si llegamos aquí, el token es válido (verificado por middleware)
      const user = req.user;

      return successResponse(res, { user }, 'Token válido');
    } catch (error) {
      console.error('Error verificando token:', error);
      return errorResponse(res, 'Token inválido', 401);
    }
  }
}

module.exports = new AuthController();