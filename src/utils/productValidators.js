// src/utils/productValidators.js

const { body, param, query } = require('express-validator');

/**
 * Validaciones para creación de producto
 */
const validateCreateProduct = [
    body('nombre')
        .trim()
        .notEmpty()
        .withMessage('El nombre del producto es requerido')
        .isLength({ min: 2, max: 200 })
        .withMessage('El nombre debe tener entre 2 y 200 caracteres')
        .matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\.\-&\/\(\)]+$/)
        .withMessage('El nombre solo puede contener letras, números, espacios y caracteres especiales básicos'),
    
    body('brandId')
        .notEmpty()
        .withMessage('La marca es requerida')
        .isString()
        .withMessage('El ID de marca debe ser una cadena válida'),
    
    body('countryIds')
        .optional()
        .isArray()
        .withMessage('Los países deben ser un array')
        .custom((value) => {
            if (value && value.length > 0) {
                // Verificar que todos los elementos sean strings válidos
                const allValid = value.every(id => typeof id === 'string' && id.length > 0);
                if (!allValid) {
                    throw new Error('Todos los IDs de países deben ser strings válidos');
                }
            }
            return true;
        })
];

/**
 * Validaciones para actualización de producto
 */
const validateUpdateProduct = [
    param('id')
        .notEmpty()
        .withMessage('ID de producto requerido')
        .isString()
        .withMessage('ID debe ser una cadena válida'),
    
    body('nombre')
        .optional()
        .trim()
        .isLength({ min: 2, max: 200 })
        .withMessage('El nombre debe tener entre 2 y 200 caracteres')
        .matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\.\-&\/\(\)]+$/)
        .withMessage('El nombre solo puede contener letras, números, espacios y caracteres especiales básicos'),
    
    body('brandId')
        .optional()
        .isString()
        .withMessage('El ID de marca debe ser una cadena válida'),
    
    body('countryIds')
        .optional()
        .isArray()
        .withMessage('Los países deben ser un array')
        .custom((value) => {
            if (value && value.length > 0) {
                const allValid = value.every(id => typeof id === 'string' && id.length > 0);
                if (!allValid) {
                    throw new Error('Todos los IDs de países deben ser strings válidos');
                }
            }
            return true;
        })
];

/**
 * Validaciones para obtener producto por ID
 */
const validateGetProduct = [
    param('id')
        .notEmpty()
        .withMessage('ID de producto requerido')
        .isString()
        .withMessage('ID debe ser una cadena válida')
];

/**
 * Validaciones para eliminación de producto
 */
const validateDeleteProduct = [
    param('id')
        .notEmpty()
        .withMessage('ID de producto requerido')
        .isString()
        .withMessage('ID debe ser una cadena válida')
];

/**
 * Validaciones para búsqueda de productos
 */
const validateSearchProducts = [
    query('q')
        .notEmpty()
        .withMessage('Término de búsqueda requerido')
        .isLength({ min: 2, max: 100 })
        .withMessage('El término de búsqueda debe tener entre 2 y 100 caracteres')
        .trim(),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('El límite debe ser un número entre 1 y 50'),
    
    query('brandId')
        .optional()
        .isString()
        .withMessage('El ID de marca debe ser una cadena válida')
];

/**
 * Validaciones para listado de productos
 */
const validateListProducts = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('La página debe ser un número mayor a 0'),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('El límite debe ser un número entre 1 y 100'),
    
    query('search')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('El término de búsqueda no puede exceder 100 caracteres'),
    
    query('brandId')
        .optional()
        .isString()
        .withMessage('El ID de marca debe ser una cadena válida')
];

/**
 * Validaciones para obtener productos por marca
 */
const validateGetProductsByBrand = [
    param('brandId')
        .notEmpty()
        .withMessage('ID de marca requerido')
        .isString()
        .withMessage('ID debe ser una cadena válida')
];

/**
 * Middleware personalizado para validar existencia de marca
 * Se ejecuta después de las validaciones básicas
 */
const validateBrandExists = async (req, res, next) => {
    try {
        const { brandId } = req.body;
        
        if (!brandId) {
            return next(); // Skip si no hay marca (para casos opcionales)
        }

        const { prisma } = require('../config/database');
        
        const existingBrand = await prisma.brand.findUnique({
            where: { id: brandId }
        });

        if (!existingBrand) {
            return res.status(400).json({
                success: false,
                message: 'La marca seleccionada no existe',
                code: 'INVALID_BRAND'
            });
        }

        next();
    } catch (error) {
        console.error('Error validando marca:', error);
        return res.status(500).json({
            success: false,
            message: 'Error validando marca'
        });
    }
};

/**
 * Middleware personalizado para validar existencia de países
 * Se ejecuta después de las validaciones básicas
 */
const validateCountriesExist = async (req, res, next) => {
    try {
        const { countryIds } = req.body;
        
        if (!countryIds || countryIds.length === 0) {
            return next(); // Skip si no hay países
        }

        const { prisma } = require('../config/database');
        
        const existingCountries = await prisma.country.findMany({
            where: { id: { in: countryIds } },
            select: { id: true }
        });

        if (existingCountries.length !== countryIds.length) {
            return res.status(400).json({
                success: false,
                message: 'Algunos países seleccionados no existen',
                code: 'INVALID_COUNTRIES'
            });
        }

        next();
    } catch (error) {
        console.error('Error validando países:', error);
        return res.status(500).json({
            success: false,
            message: 'Error validando países'
        });
    }
};

module.exports = {
    validateCreateProduct,
    validateUpdateProduct,
    validateGetProduct,
    validateDeleteProduct,
    validateSearchProducts,
    validateListProducts,
    validateGetProductsByBrand,
    validateBrandExists,
    validateCountriesExist
};