// conversationStorage.js - Simple storage service for conversations
const Conversation = require('../../models/Conversation');

class ConversationStorage {
  async saveConversation(data) {
    try {
      const conversation = new Conversation(data);
      return await conversation.save();
    } catch (error) {
      console.error('Error saving conversation:', error);
      throw error;
    }
  }

  async getConversation(id) {
    try {
      return await Conversation.findById(id);
    } catch (error) {
      console.error('Error getting conversation:', error);
      throw error;
    }
  }

  async updateConversation(id, updates) {
    try {
      return await Conversation.findByIdAndUpdate(id, updates, { new: true });
    } catch (error) {
      console.error('Error updating conversation:', error);
      throw error;
    }
  }
}

module.exports = new ConversationStorage();
