// Script to delete all listings from the database
// Run with: npx ts-node scripts/reset-listings.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteAllListings() {
  try {
    console.log('🗑️  Deleting all listings from database...\n');

    // Count listings first
    const listingCount = await prisma.listing.count();
    const bookingCount = await prisma.booking.count();
    
    console.log(`Found ${listingCount} listings in database`);
    console.log(`Found ${bookingCount} bookings in database\n`);

    if (listingCount === 0) {
      console.log('✅ Database is already clean!');
      return;
    }

    // Delete bookings first (they reference listings)
    if (bookingCount > 0) {
      console.log('Deleting bookings first (they reference listings)...');
      const bookingResult = await prisma.booking.deleteMany({});
      console.log(`  ✓ Deleted ${bookingResult.count} bookings\n`);
    }

    // Delete all listings
    const listingResult = await prisma.listing.deleteMany({});
    console.log(`✅ Deleted ${listingResult.count} listings successfully!\n`);

    // Verify
    const remainingListings = await prisma.listing.count();
    const remainingBookings = await prisma.booking.count();
    
    console.log('Verification:');
    console.log(`  Remaining listings: ${remainingListings}`);
    console.log(`  Remaining bookings: ${remainingBookings}\n`);

    console.log('🎉 Database is now clean and ready for real data!');
    console.log('\n📋 Next steps:');
    console.log('1. Go to http://localhost:3000/admin/listings');
    console.log('2. Click "Create Listing" to add real listings');
    console.log('3. Or seed the database with sample data\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllListings();
