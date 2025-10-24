import { chatbotService } from '../services/chatbotService';

export class ChatbotController {
  async sendMessage(userId, message) {
    try {
      console.log('🤖 Enviando mensagem:', { userId, message });
      
      const result = await chatbotService.sendMessageToAI(userId, message);
      
      if (result.success) {
        console.log('✅ Resposta recebida:', result.data);
        return {
          success: true,
          data: result.data
        };
      } else {
        console.error('❌ Erro na resposta:', result.error);
        return {
          success: false,
          error: result.error
        };
      }
    } catch (error) {
      console.error('❌ Erro no controller:', error);
      return {
        success: false,
        error: error.message || 'Erro ao enviar mensagem'
      };
    }
  }

  async loadChatHistory(userId) {
    try {
      const result = await chatbotService.getChatHistory(userId);
      return result;
    } catch (error) {
      console.error('❌ Erro ao carregar histórico:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }
}
export default ChatbotController;