import { PrismaClient, Role, PartnerStatus, PartnerCategory, ListingType, ListingAvailability } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Database seeding is disabled in production');
  }

  const clientEmail = process.env.SEED_CLIENT_EMAIL ?? 'client@tembea.local';
  const partnerEmail = process.env.SEED_PARTNER_EMAIL ?? 'partner@tembea.local';
  const clientSeedPassword = process.env.SEED_CLIENT_PASSWORD;
  const partnerSeedPassword = process.env.SEED_PARTNER_PASSWORD;
  if (!clientSeedPassword || clientSeedPassword.length < 12) {
    throw new Error('SEED_CLIENT_PASSWORD must contain at least 12 characters');
  }
  if (!partnerSeedPassword || partnerSeedPassword.length < 12) {
    throw new Error('SEED_PARTNER_PASSWORD must contain at least 12 characters');
  }

  console.log('🌱 Seeding database...\n');

  // Hash passwords
  const clientPassword = await bcrypt.hash(clientSeedPassword, 12);
  const partnerPassword = await bcrypt.hash(partnerSeedPassword, 12);

  // ─── 1. CLIENT USER ─────────────────────────────────────────────────────────
  console.log('Creating CLIENT user...');
  const clientUser = await prisma.user.upsert({
    where: { email: clientEmail },
    update: {},
    create: {
      email: clientEmail,
      passwordHash: clientPassword,
      name: 'John Client',
      role: Role.CLIENT,
      verified: true,
      language: 'en',
      region: 'Kigali',
      interests: ['accommodation', 'tours', 'restaurants'],
    },
  });
  console.log('✅ Client created:', clientUser.email);
  console.log(`   Email: ${clientEmail}\n`);

  // ─── 2. PARTNER USER ────────────────────────────────────────────────────────
  console.log('Creating PARTNER user...');
  const partnerUser = await prisma.user.upsert({
    where: { email: partnerEmail },
    update: {},
    create: {
      email: partnerEmail,
      passwordHash: partnerPassword,
      name: 'Jane Partner',
      role: Role.PARTNER,
      verified: true,
      language: 'en',
      region: 'Kigali',
    },
  });

  const partner = await prisma.partner.upsert({
    where: { userId: partnerUser.id },
    update: {},
    create: {
      userId: partnerUser.id,
      businessName: 'Kigali Tours & Adventures',
      category: PartnerCategory.TOURS,
      status: PartnerStatus.VERIFIED,
      phone: '+250 788 123 456',
      website: 'https://kigalitours.rw',
    },
  });
  console.log('✅ Partner created:', partnerUser.email);
  console.log(`   Email: ${partnerEmail}`);
  console.log('   Business:', partner.businessName, '\n');

  // Create a sample listing for the partner
  await prisma.listing.upsert({
    where: { id: 'test-listing-1' },
    update: {},
    create: {
      id: 'test-listing-1',
      partnerId: partner.id,
      type: ListingType.TOURS,
      name: 'Kigali City Walking Tour',
      location: 'Kigali City Center',
      region: 'Kigali',
      city: 'Kigali',
      description: 'Explore the vibrant culture and history of Kigali with our expert local guides. Visit the Genocide Memorial, local markets, and enjoy authentic Rwandan cuisine.',
      images: ['https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800'],
      price: 75,
      priceLabel: 'per person',
      rating: 4.8,
      reviewCount: 124,
      availability: ListingAvailability.AVAILABLE,
      featured: true,
      published: true,
      extraData: {
        duration: '4 hours',
        slotsAvailable: 15,
        difficulty: 'Easy',
        included: ['Transport', 'Lunch', 'Entry Fees', 'Guide'],
      },
    },
  });
  console.log('✅ Sample listing created for partner\n');

  // ─── Summary ────────────────────────────────────────────────────────────────
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📋 TEST CREDENTIALS SUMMARY');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('\n1️⃣  CLIENT DASHBOARD');
  console.log('   URL: http://localhost:3000/sign-in');
  console.log(`   Email: ${clientEmail}`);
  console.log('   Password: supplied through SEED_CLIENT_PASSWORD');
  console.log('   Redirect: /client\n');

  console.log('2️⃣  PARTNER DASHBOARD');
  console.log('   URL: http://localhost:3000/sign-in');
  console.log(`   Email: ${partnerEmail}`);
  console.log('   Password: supplied through SEED_PARTNER_PASSWORD');
  console.log('   Redirect: /partner\n');

  console.log('═══════════════════════════════════════════════════════════');
  console.log('✅ Database seeded successfully!');
  console.log('═══════════════════════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
