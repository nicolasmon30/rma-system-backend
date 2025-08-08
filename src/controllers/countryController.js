const countryService = require('../services/countryService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

class CountryController {
    /**
     * Crear nuevo país
     * @route POST /api/countries
     * @access Private - SUPERADMIN only
     */
    async createCountry(req, res) {
        try {
            const { nombre } = req.body;
            const userId = req.user.id;

            console.log(`🌍 Petición de creación de país: "${nombre}"`);
            console.log(`👤 Solicitado por: ${req.user.email} (${req.user.role})`);

            if (!nombre || nombre.trim() === '') {
                return errorResponse(res, 'El nombre del país es requerido', 400);
            }

            const newCountry = await countryService.createCountry({ nombre }, userId);

            console.log(`✅ País creado exitosamente: ${newCountry.nombre}`);

            return successResponse(
                res,
                newCountry,
                `País "${newCountry.nombre}" creado exitosamente`,
                201
            );

        } catch (error) {
            console.error('❌ Error en createCountry controller:', error);

            if (error.message.includes('Ya existe')) {
                return errorResponse(res, error.message, 409);
            }

            return errorResponse(res, error.message || 'Error al crear país', 500);
        }
    }

    /**
     * Obtener todos los países
     * @route GET /api/countries
     * @access Public (para formularios de registro)
     */
    async getAllCountries(req, res) {
        try {
            const { includeStats = 'true', orderBy = 'nombre', search } = req.query;

            console.log('📊 Petición de lista de países');

            let countries;

            if (search) {
                countries = await countryService.searchCountries(search);
            } else {
                countries = await countryService.getAllCountriesWithStats({
                    includeCounts: includeStats === 'true',
                    orderBy
                });
            }

            return successResponse(
                res,
                countries,
                `${countries.length} países obtenidos exitosamente`
            );

        } catch (error) {
            console.error('❌ Error en getAllCountries controller:', error);
            return errorResponse(res, 'Error al obtener países', 500);
        }
    }

    /**
     * Obtener país por ID
     * @route GET /api/countries/:id
     * @access Private - ADMIN, SUPERADMIN
     */
    async getCountryById(req, res) {
        try {
            const { id } = req.params;

            console.log(`🔍 Petición de país por ID: ${id}`);

            const country = await countryService.getCountryById(id);

            return successResponse(
                res,
                country,
                `País "${country.nombre}" obtenido exitosamente`
            );

        } catch (error) {
            console.error('❌ Error en getCountryById controller:', error);

            if (error.message.includes('no encontrado')) {
                return errorResponse(res, error.message, 404);
            }

            return errorResponse(res, error.message || 'Error al obtener país', 500);
        }
    }

    /**
     * Actualizar país
     * @route PUT /api/countries/:id
     * @access Private - SUPERADMIN only
     */
    async updateCountry(req, res) {
        try {
            const { id } = req.params;
            const { nombre } = req.body;
            const userId = req.user.id;

            console.log(`✏️ Petición de actualización de país ${id} a "${nombre}"`);

            if (!nombre || nombre.trim() === '') {
                return errorResponse(res, 'El nombre del país es requerido', 400);
            }

            const updatedCountry = await countryService.updateCountry(id, nombre, userId);

            return successResponse(
                res,
                updatedCountry,
                `País actualizado exitosamente a "${updatedCountry.nombre}"`
            );

        } catch (error) {
            console.error('❌ Error en updateCountry controller:', error);

            if (error.message.includes('no encontrado')) {
                return errorResponse(res, error.message, 404);
            }

            if (error.message.includes('Ya existe')) {
                return errorResponse(res, error.message, 409);
            }

            return errorResponse(res, error.message || 'Error al actualizar país', 500);
        }
    }

    /**
     * Eliminar país
     * @route DELETE /api/countries/:id
     * @access Private - SUPERADMIN only
     */
    async deleteCountry(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            console.log(`🗑️ Petición de eliminación de país ${id}`);

            const result = await countryService.deleteCountry(id, userId);

            return successResponse(
                res,
                result,
                result.message
            );

        } catch (error) {
            console.error('❌ Error en deleteCountry controller:', error);

            if (error.message.includes('no encontrado')) {
                return errorResponse(res, error.message, 404);
            }

            if (error.message.includes('dependencias')) {
                return errorResponse(res, error.message, 409);
            }

            return errorResponse(res, error.message || 'Error al eliminar país', 500);
        }
    }
}

module.exports = new CountryController();