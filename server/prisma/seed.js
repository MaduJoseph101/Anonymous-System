require('dotenv').config();
const prisma = require('../src/lib/prisma');
const bcrypt = require('bcryptjs');


async function main() {
  const hashedPassword = await bcrypt.hash(
    process.env.SEED_ADMIN_PASSWORD, 12
  );
  
  const admin = await prisma.adminUser.upsert({
    where: { email: process.env.SEED_ADMIN_EMAIL },
    update: {},
    create: {
      email: process.env.SEED_ADMIN_EMAIL,
      password: hashedPassword,
      full_name: 'System Administrator',
      role: 'SUPER_ADMIN',
      is_active: true
    }
  });

  console.log('Seed complete. Super admin created:', admin.email);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
