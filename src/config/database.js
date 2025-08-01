const { PrismaClient } = require('../generated/prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error'] 
    : ['error'],
});

/**
 * Conecta a la base de datos y verifica la conexión
 */
async function connectDB() {
  try {
    await prisma.$connect();
    console.log('✅ Base de datos PostgreSQL conectada correctamente');
    
    // Verificar conexión con una consulta simple
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Verificación de conexión exitosa');
    
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error);
    throw error;
  }
}

/**
 * Desconecta de la base de datos
 */
async function disconnectDB() {
  try {
    await prisma.$disconnect();
    console.log('✅ Desconectado de la base de datos');
  } catch (error) {
    console.error('❌ Error desconectando de la base de datos:', error);
  }
}

// Manejo de cierre graceful
process.on('SIGINT', async () => {
  console.log('\n🔄 Cerrando servidor...');
  await disconnectDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🔄 Cerrando servidor...');
  await disconnectDB();
  process.exit(0);
});

module.exports = { prisma, connectDB, disconnectDB };