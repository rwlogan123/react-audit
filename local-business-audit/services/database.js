const { MongoClient } = require('mongodb');

class DatabaseService {
  constructor() {
    this.client = null;
    this.db = null;
  }

  async connect() {
    try {
      if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI not defined in environment variables');
      }

      // Removed deprecated options - MongoDB driver 4.0+ doesn't need them
      // Added TLS options to fix SSL issues in Codespaces
      this.client = new MongoClient(process.env.MONGODB_URI, {
        tls: true,
        tlsAllowInvalidCertificates: false,
        tlsAllowInvalidHostnames: false,
        serverSelectionTimeoutMS: 5000,
      });

      await this.client.connect();
      console.log('✅ Connected to MongoDB Atlas');

      this.db = this.client.db('Audit-app');
      
      // Create indexes for better performance
      await this.createIndexes();
      
      return this.db;
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      throw error;
    }
  }

  async createIndexes() {
    const auditsCollection = this.db.collection('audits');
    
    // Create indexes for common queries
    await auditsCollection.createIndex({ businessId: 1, createdAt: -1 });
    await auditsCollection.createIndex({ 'businessData.name': 1 });
    await auditsCollection.createIndex({ createdAt: -1 });
    
    // TTL index to automatically delete old audits after 1 year
    await auditsCollection.createIndex(
      { expireAt: 1 }, 
      { expireAfterSeconds: 0 }
    );

    console.log('✅ Database indexes created');
  }

  getDb() {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      console.log('🔌 Disconnected from MongoDB');
    }
  }
}

module.exports = new DatabaseService();