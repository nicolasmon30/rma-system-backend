// ===== src/services/authService.js =====
const { prisma } = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/bcrypt');
const { generateToken } = require('../config/jwt');
const emailService = require('../services/email/emailService');

class AuthService {
  /**
   * Registra un nuevo usuario (rol USER por defecto)
   * @param {Object} userData - Datos del usuario
   * @returns {Object} Usuario creado y token
   */
  async register({ nombre, apellido, direccion, telefono, empresa, email, password, countryId }) {
    try {
      // Verificar si el usuario ya existe
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        throw new Error('Ya existe un usuario registrado con ese email');
      }

      // Verificar que el país existe
      const country = await prisma.country.findUnique({
        where: { id: countryId }
      });

      console.log(country)

      if (!country) {
        throw new Error('El país seleccionado no existe');
      }

      // Hashear contraseña
      const hashedPassword = await hashPassword(password);

      // Crear usuario en una transacción
      const result = await prisma.$transaction(async (tx) => {
        // Crear usuario
        const user = await tx.user.create({
          data: {
            nombre,
            apellido,
            direccion,
            telefono,
            empresa,
            email,
            password: hashedPassword,
            role: 'USER' // Rol por defecto
          },
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            empresa: true,
            direccion: true,
            telefono: true,
            role: true,
            createdAt: true
          }
        });

        // Asignar país al usuario
        await tx.userCountry.create({
          data: {
            userId: user.id,
            countryId: countryId
          }
        });

        const country = await tx.country.findUnique({
          where: { id: countryId },
          select: { id: true, nombre: true }
        });

        return {
        ...user,
        countries: [country] // Retornamos el país como array para mantener consistencia
      };
      });

      // Generar token
      const token = generateToken({ 
        userId: result.id,
        email: result.email,
        role: result.role
      });

      this.sendWelcomeEmailAsync(result);

      return { 
        user: result, 
        token
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Envía el email de bienvenida de forma asíncrona
   * @param {Object} userData - Datos del usuario
   */
  async sendWelcomeEmailAsync(userData) {
    try {
      const emailResult = await emailService.sendWelcomeEmail({
        nombre: userData.nombre,
        apellido: userData.apellido,
        email: userData.email,
        empresa: userData.empresa
      });

      if (emailResult.success) {
        console.log(`Email de bienvenida enviado a ${userData.email} con ID: ${emailResult.emailId}`);
      } else {
        console.error(`Error enviando email de bienvenida a ${userData.email}:`, emailResult.error);
      }
    } catch (error) {
      console.error('Error en envío asíncrono de email de bienvenida:', error);
    }
  }

  /**
   * Inicia sesión de usuario
   * @param {Object} credentials - Credenciales del usuario
   * @returns {Object} Usuario y token
   */
  async login({ email, password }) {
    try {
      // Buscar usuario por email con países asignados
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          countries: {
            include: {
              country: {
                select: { id: true, nombre: true }
              }
            }
          }
        }
      });

      if (!user) {
        throw new Error('Credenciales inválidas');
      }

      // Verificar contraseña
      const isValidPassword = await comparePassword(password, user.password);
      
      if (!isValidPassword) {
        throw new Error('Credenciales inválidas');
      }

      // Generar token
      const token = generateToken({ 
        userId: user.id,
        email: user.email,
        role: user.role
      });

      // Formatear respuesta sin contraseña
      const { password: _, countries, ...userWithoutPassword } = user;
      const userCountries = countries.map(uc => uc.country);

      return { 
        user: {
          ...userWithoutPassword,
          countries: userCountries
        }, 
        token,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene el perfil del usuario autenticado
   * @param {String} userId - ID del usuario
   * @returns {Object} Datos del usuario
   */
  async getProfile(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          nombre: true,
          apellido: true,
          email: true,
          empresa: true,
          direccion: true,
          telefono: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          countries: {
            include: {
              country: {
                select: { id: true, nombre: true }
              }
            }
          }
        }
      });

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Formatear países
      const userCountries = user.countries.map(uc => uc.country);

      return {
        ...user,
        countries: userCountries
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualiza el perfil del usuario
   * @param {String} userId - ID del usuario
   * @param {Object} updateData - Datos a actualizar
   * @returns {Object} Usuario actualizado
   */
  async updateProfile(userId, { nombre, apellido, direccion, telefono, empresa }) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(nombre && { nombre }),
          ...(apellido && { apellido }),
          ...(direccion && { direccion }),
          ...(telefono && { telefono }),
          ...(empresa && { empresa })
        },
        select: {
          id: true,
          nombre: true,
          apellido: true,
          email: true,
          empresa: true,
          direccion: true,
          telefono: true,
          role: true,
          updatedAt: true,
          countries: {
            include: {
              country: {
                select: { id: true, nombre: true }
              }
            }
          }
        }
      });

      // Formatear países
      const userCountries = user.countries.map(uc => uc.country);

      return {
        ...user,
        countries: userCountries
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cambia la contraseña del usuario
   * @param {String} userId - ID del usuario
   * @param {String} currentPassword - Contraseña actual
   * @param {String} newPassword - Nueva contraseña
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      // Obtener usuario actual
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Verificar contraseña actual
      const isValidPassword = await comparePassword(currentPassword, user.password);
      
      if (!isValidPassword) {
        throw new Error('La contraseña actual es incorrecta');
      }

      // Hashear nueva contraseña
      const hashedNewPassword = await hashPassword(newPassword);

      // Actualizar contraseña
      await prisma.user.update({
        where: { id: userId },
        data: {
          password: hashedNewPassword
        }
      });

      return { message: 'Contraseña actualizada exitosamente' };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AuthService();