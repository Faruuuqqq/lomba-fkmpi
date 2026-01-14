import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Create demo jury user
  const juryEmail = 'demo@gmail.com';
  const juryPassword = 'demo123';
  const juryName = 'Juri Demo';

  // Hash the password with the same salt rounds as in auth service
  const hashedPassword = await bcrypt.hash(juryPassword, 10);

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: juryEmail },
  });

  if (existingUser) {
    console.log('Jury user already exists, updating...');
    
    // Update existing user
    await prisma.user.update({
      where: { email: juryEmail },
      data: {
        password: hashedPassword,
        name: juryName,
      },
    });
  } else {
    console.log('Creating new jury user...');
    
    // Create new jury user
    await prisma.user.create({
      data: {
        email: juryEmail,
        password: hashedPassword,
        name: juryName,
      },
    });
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });