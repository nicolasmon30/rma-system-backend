const { PrismaClient } = require('../src/generated/prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Crear países iniciales
  const countries = await Promise.all([
    prisma.country.create({ data: { nombre: 'Colombia' } }),
    prisma.country.create({ data: { nombre: 'Estados Unidos' } }),
    prisma.country.create({ data: { nombre: 'Argentina' } }),
  ]);

  console.log('✅ Países creados:', countries.length);

  // Crear marcas iniciales
  const brands = await Promise.all([
    prisma.brand.create({ data: { nombre: 'Waygate' } }),
    prisma.brand.create({ data: { nombre: 'Baker Hughes' } }),
    prisma.brand.create({ data: { nombre: 'Magnaflux' } })
  ]);

  console.log('✅ Marcas creadas:', brands.length);

  // Asignar marcas a países
  for (const brand of brands) {
    for (const country of countries) {
      await prisma.brandCountry.create({
        data: {
          brandId: brand.id,
          countryId: country.id
        }
      });
    }
  }

  // Crear productos iniciales
  const products = await Promise.all([
    prisma.product.create({ 
      data: { 
        nombre: 'Multímetro Digital 87V', 
        brandId: brands[0].id 
      } 
    }),
    prisma.product.create({ 
      data: { 
        nombre: 'Osciloscopio DSO-X 3024T', 
        brandId: brands[1].id 
      } 
    }),
    prisma.product.create({ 
      data: { 
        nombre: 'Generador de Señales AFG3252C', 
        brandId: brands[2].id 
      } 
    })
  ]);

  console.log('✅ Productos creados:', products.length);

  // Asignar productos a países
  for (const product of products) {
    for (const country of countries) {
      await prisma.productCountry.create({
        data: {
          productId: product.id,
          countryId: country.id
        }
      });
    }
  }

  // Crear usuario Superadmin
  const hashedPassword = await bcrypt.hash('superadmin123', 12);
  
  const superadmin = await prisma.user.create({
    data: {
      nombre: 'Super',
      apellido: 'Admin',
      direccion: 'Calle Principal 123',
      telefono: '+57123456789',
      empresa: 'RMA System',
      email: 'superadmin@rmasystem.com',
      password: hashedPassword,
      role: 'SUPERADMIN'
    }
  });

  // Asignar todos los países al superadmin
  for (const country of countries) {
    await prisma.userCountry.create({
      data: {
        userId: superadmin.id,
        countryId: country.id
      }
    });
  }

  console.log('✅ Superadmin creado:', superadmin.email);

  console.log('🎉 Seed completado exitosamente');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });