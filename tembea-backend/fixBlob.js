const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const listings = await prisma.listing.findMany();
  let count = 0;
  for (const l of listings) {
    let updated = false;
    const images = l.images.map(i => {
      if (i && i.startsWith('blob:')) {
        updated = true;
        return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80';
      }
      return i;
    });

    if (updated) {
      await prisma.listing.update({
        where: { id: l.id },
        data: { images }
      });
      console.log('Fixed listing', l.id);
      count++;
    }
  }
  console.log('Fixed', count, 'listings');
}

main().finally(() => prisma.$disconnect());
