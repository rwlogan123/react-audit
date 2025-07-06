const { MongoClient, ServerApiVersion } = require('mongodb');

// Get the connection string from environment
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ MONGODB_URI not found in environment variables');
  process.exit(1);
}

console.log('🔍 Connection string format:', uri.substring(0, 30) + '...');

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  connectTimeoutMS: 10000,
  serverSelectionTimeoutMS: 10000,
});

async function run() {
  try {
    console.log('🔄 Attempting to connect to MongoDB Atlas...');
    
    // Connect the client to the server
    await client.connect();
    
    console.log('✅ Connected successfully!');
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Pinged your deployment. You successfully connected to MongoDB!");
    
    // List databases
    const dbs = await client.db().admin().listDatabases();
    console.log('📊 Available databases:', dbs.databases.map(db => db.name));
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    // Check if it's an SSL error
    if (error.message.includes('SSL') || error.message.includes('TLS')) {
      console.log('\n💡 This appears to be an SSL/TLS error.');
      console.log('This is a known issue with GitHub Codespaces and MongoDB Atlas.');
      console.log('\nPossible solutions:');
      console.log('1. Try connecting from your local machine instead of Codespaces');
      console.log('2. Use a different MongoDB provider (MongoDB local, cloud VM, etc.)');
      console.log('3. Try using the MongoDB connection from a deployed environment');
    }
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

console.log('🚀 Starting MongoDB connection test...\n');
run().catch(console.dir);