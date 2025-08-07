const { prisma } = require('../config/database');

function validateRmaStatusTransition(allowedFromStatuses) {
    return async (req, res, next) => {
        try {
            const { rmaId } = req.params;

            const rma = await prisma.rma.findUnique({
                where: { id: rmaId },
                select: { status: true }
            });

            if (!rma) {
                return res.status(404).json({
                    success: false,
                    message: 'RMA no encontrado'
                });
            }

            if (!allowedFromStatuses.includes(rma.status)) {
                return res.status(400).json({
                    success: false,
                    message: `El RMA debe estar en uno de los siguientes estados: ${allowedFromStatuses.join(', ')}`
                });
            }

            next();
        } catch (error) {
            next(error);
        }
    };
}

module.exports = { validateRmaStatusTransition };