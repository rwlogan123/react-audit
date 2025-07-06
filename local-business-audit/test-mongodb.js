require('dotenv').config();
const database = require('./services/database');
const auditStorage = require('./services/auditStorage');

async function testMongoDB() {
  try {
    // Connect to database
    console.log('🔄 Connecting to MongoDB...');
    await database.connect();
    console.log('✅ Database connected successfully!');
    
    // Test saving an audit
    const testBusinessData = {
      name: 'Test Coffee Shop',
      address: '123 Main St, Portland, OR',
      place_id: 'test_place_123',
      phone: '(555) 123-4567',
      website: 'https://testcoffeeshop.com'
    };
    
    const testAuditResults = {
      summary: {
        overallScore: 85,
        completenessScore: 90,
        averageRating: 4.7
      },
      competitors: [
        { name: 'Competitor 1', rating: 4.5 },
        { name: 'Competitor 2', rating: 4.3 }
      ],
      recommendations: [
        'Add more photos',
        'Improve website speed'
      ],
      pagespeed: {
        score: 78
      }
    };
    
    // Save audit
    console.log('💾 Saving test audit...');
    const saveResult = await auditStorage.saveAudit(testBusinessData, testAuditResults);
    console.log('✅ Audit saved with ID:', saveResult.auditId);
    
    // Retrieve audit
    console.log('🔍 Retrieving audit...');
    const retrievedAudit = await auditStorage.getAuditById(saveResult.auditId);
    console.log('✅ Audit retrieved:', {
      businessName: retrievedAudit.businessData.name,
      visibilityScore: retrievedAudit.scores.visibility,
      createdAt: retrievedAudit.createdAt
    });
    
    // Get stats
    console.log('📊 Getting database stats...');
    const stats = await auditStorage.getAuditStats();
    console.log('✅ Stats:', stats);
    
    // Search test
    console.log('🔎 Testing search...');
    const searchResults = await auditStorage.searchAudits('Coffee');
    console.log('✅ Found', searchResults.length, 'audits matching "Coffee"');
    
    // Disconnect
    await database.disconnect();
    console.log('\n🎉 All tests passed! MongoDB is working correctly.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run the test
console.log('🚀 Starting MongoDB connection test...\n');
testMongoDB();