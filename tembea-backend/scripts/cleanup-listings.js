// Script to delete all listings from the database
// Run this with: node scripts/cleanup-listings.js

const axios = require('axios');

const API_URL = 'http://localhost:4000/api';

async function deleteAllListings() {
  try {
    console.log('🗑️  Deleting all listings from database...');
    
    // First, get all listings
    const response = await axios.get(`${API_URL}/listings/admin/all`, {
      headers: {
        'Authorization': 'Bearer YOUR_ADMIN_TOKEN_HERE'
      }
    });

    const listings = response.data.listings || response.data.data?.listings || [];
    console.log(`Found ${listings.length} listings to delete`);

    if (listings.length === 0) {
      console.log('✅ Database is already clean - no listings found');
      return;
    }

    // Delete each listing
    for (const listing of listings) {
      try {
        await axios.delete(`${API_URL}/listings/${listing.id}`, {
          headers: {
            'Authorization': 'Bearer YOUR_ADMIN_TOKEN_HERE'
          }
        });
        console.log(`  ✓ Deleted: ${listing.name || listing.title}`);
      } catch (error) {
        console.log(`  ✗ Failed to delete ${listing.id}: ${error.message}`);
      }
    }

    console.log('\n✅ All listings deleted successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Go to http://localhost:3000/admin/listings');
    console.log('2. Click "Create Listing" to add real listings');
    console.log('3. Or use the seed script to populate with sample data');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n⚠️  Make sure:');
    console.log('1. Backend is running on http://localhost:4000');
    console.log('2. You have a valid admin token');
    console.log('3. Replace YOUR_ADMIN_TOKEN_HERE with your actual token');
  }
}

deleteAllListings();