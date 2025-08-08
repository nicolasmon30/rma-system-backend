const { prisma } = require('../config/database');

class CountryService {
    /**
   * Crear un nuevo país
   * @param {Object} countryData - Datos del país
   * @param {String} countryData.nombre - Nombre del país
   * @param {String} userId - ID del usuario que crea (para logs)
   * @returns {Object} País creado
   */
    async createCountry(countryData, userId) {
        try {
            const { nombre } = countryData;

            console.log(`🌍 Creando nuevo país: ${nombre}`);
            console.log(`👤 Creado por usuario: ${userId}`);

            // Verificar que el nombre no esté vacío
            if (!nombre || nombre.trim() === '') {
                throw new Error('El nombre del país es requerido');
            }

            // Normalizar el nombre (capitalizar primera letra de cada palabra)
            const normalizedName = nombre.trim()
                .toLowerCase()
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');

            // Verificar que el país no exista ya
            const existingCountry = await prisma.country.findFirst({
                where: {
                    nombre: {
                        equals: normalizedName,
                        mode: 'insensitive'
                    }
                }
            });

            if (existingCountry) {
                throw new Error(`Ya existe un país con el nombre "${normalizedName}"`);
            }

            // Crear el país
            const newCountry = await prisma.country.create({
                data: {
                    nombre: normalizedName
                },
                select: {
                    id: true,
                    nombre: true,
                    _count: {
                        select: {
                            users: true,
                            products: true,
                            brands: true,
                            rmas: true
                        }
                    }
                }
            });

            console.log(`✅ País creado exitosamente: ${newCountry.nombre} (ID: ${newCountry.id})`);

            return newCountry;

        } catch (error) {
            console.error('❌ Error en createCountry:', error);
            throw error;
        }
    }
    /**
     * Obtener todos los países con información adicional
     * @param {Object} options - Opciones de consulta
     * @returns {Array} Lista de países con estadísticas
     */
    async getAllCountriesWithStats(options = {}) {
        try {
            const { includeCounts = true, orderBy = 'nombre' } = options;

            console.log('📊 Obteniendo países con estadísticas...');

            const countries = await prisma.country.findMany({
                select: {
                    id: true,
                    nombre: true,
                    ...(includeCounts && {
                        _count: {
                            select: {
                                users: true,
                                products: true,
                                brands: true,
                                rmas: true
                            }
                        }
                    })
                },
                orderBy: {
                    [orderBy]: 'asc'
                }
            });

            console.log(`✅ Obtenidos ${countries.length} países`);

            return countries;

        } catch (error) {
            console.error('❌ Error en getAllCountriesWithStats:', error);
            throw error;
        }
    }
    /**
 * Obtener país por ID con detalles completos
 * @param {String} countryId - ID del país
 * @returns {Object} País con detalles
 */
    async getCountryById(countryId) {
        try {
            console.log(`🔍 Obteniendo país por ID: ${countryId}`);

            const country = await prisma.country.findUnique({
                where: { id: countryId },
                include: {
                    _count: {
                        select: {
                            users: true,
                            products: true,
                            brands: true,
                            rmas: true
                        }
                    },
                    users: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    nombre: true,
                                    apellido: true,
                                    email: true,
                                    role: true
                                }
                            }
                        },
                        take: 10 // Limitar a 10 usuarios para evitar sobrecarga
                    }
                }
            });

            if (!country) {
                throw new Error('País no encontrado');
            }

            console.log(`✅ País encontrado: ${country.nombre}`);

            return country;

        } catch (error) {
            console.error('❌ Error en getCountryById:', error);
            throw error;
        }
    }

    /**
     * Actualizar nombre de país
     * @param {String} countryId - ID del país
     * @param {String} newName - Nuevo nombre
     * @param {String} userId - ID del usuario que actualiza
     * @returns {Object} País actualizado
     */
    async updateCountry(countryId, newName, userId) {
        try {
            console.log(`✏️ Actualizando país ${countryId} a "${newName}"`);
            console.log(`👤 Actualizado por usuario: ${userId}`);

            // Verificar que el país existe
            const existingCountry = await prisma.country.findUnique({
                where: { id: countryId }
            });

            if (!existingCountry) {
                throw new Error('País no encontrado');
            }

            // Normalizar el nuevo nombre
            const normalizedName = newName.trim()
                .toLowerCase()
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');

            // Verificar que no exista otro país con ese nombre
            const duplicateCountry = await prisma.country.findFirst({
                where: {
                    nombre: {
                        equals: normalizedName,
                        mode: 'insensitive'
                    },
                    NOT: {
                        id: countryId
                    }
                }
            });

            if (duplicateCountry) {
                throw new Error(`Ya existe otro país con el nombre "${normalizedName}"`);
            }

            // Actualizar el país
            const updatedCountry = await prisma.country.update({
                where: { id: countryId },
                data: { nombre: normalizedName },
                select: {
                    id: true,
                    nombre: true,
                    _count: {
                        select: {
                            users: true,
                            products: true,
                            brands: true,
                            rmas: true
                        }
                    }
                }
            });

            console.log(`✅ País actualizado exitosamente: ${updatedCountry.nombre}`);

            return updatedCountry;

        } catch (error) {
            console.error('❌ Error en updateCountry:', error);
            throw error;
        }
    }

    /**
     * Eliminar país (solo si no tiene dependencias)
     * @param {String} countryId - ID del país
     * @param {String} userId - ID del usuario que elimina
     * @returns {Object} Resultado de la eliminación
     */
    async deleteCountry(countryId, userId) {
        try {
            console.log(`🗑️ Intentando eliminar país ${countryId}`);
            console.log(`👤 Eliminado por usuario: ${userId}`);

            // Verificar que el país existe y obtener sus dependencias
            const country = await prisma.country.findUnique({
                where: { id: countryId },
                include: {
                    _count: {
                        select: {
                            users: true,
                            products: true,
                            brands: true,
                            rmas: true
                        }
                    }
                }
            });

            if (!country) {
                throw new Error('País no encontrado');
            }

            // Verificar que no tenga dependencias
            const { _count } = country;
            const totalDependencies = _count.users + _count.products + _count.brands + _count.rmas;

            if (totalDependencies > 0) {
                const dependencies = [];
                if (_count.users > 0) dependencies.push(`${_count.users} usuarios`);
                if (_count.products > 0) dependencies.push(`${_count.products} productos`);
                if (_count.brands > 0) dependencies.push(`${_count.brands} marcas`);
                if (_count.rmas > 0) dependencies.push(`${_count.rmas} RMAs`);

                throw new Error(`No se puede eliminar el país "${country.nombre}" porque tiene dependencias: ${dependencies.join(', ')}`);
            }

            // Eliminar el país
            await prisma.country.delete({
                where: { id: countryId }
            });

            console.log(`✅ País "${country.nombre}" eliminado exitosamente`);

            return {
                message: `País "${country.nombre}" eliminado exitosamente`,
                deletedCountry: {
                    id: country.id,
                    nombre: country.nombre
                }
            };

        } catch (error) {
            console.error('❌ Error en deleteCountry:', error);
            throw error;
        }
    }

    /**
     * Buscar países por nombre
     * @param {String} searchTerm - Término de búsqueda
     * @returns {Array} Países que coinciden con la búsqueda
     */
    async searchCountries(searchTerm) {
        try {
            console.log(`🔍 Buscando países con término: "${searchTerm}"`);

            const countries = await prisma.country.findMany({
                where: {
                    nombre: {
                        contains: searchTerm,
                        mode: 'insensitive'
                    }
                },
                select: {
                    id: true,
                    nombre: true,
                    _count: {
                        select: {
                            users: true,
                            products: true,
                            brands: true,
                            rmas: true
                        }
                    }
                },
                orderBy: {
                    nombre: 'asc'
                }
            });

            console.log(`✅ Encontrados ${countries.length} países`);

            return countries;

        } catch (error) {
            console.error('❌ Error en searchCountries:', error);
            throw error;
        }
    }
}

module.exports = new CountryService();
