import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../authContext';
import { ChatbotController } from '../../controllers/ChatbotController';
import ChatMessage from './ChatMessage';
import styles from './Chatbot.module.css';

const Chatbot = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);
  
  const chatbotController = new ChatbotController();

  // Auto-scroll para última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Carregar histórico de conversas
  useEffect(() => {
    if (currentUser && isOpen) {
      loadChatHistory();
    }
  }, [currentUser, isOpen]);

  const loadChatHistory = async () => {
    try {
      const result = await chatbotController.loadChatHistory(currentUser.uid);
      if (result.success) {
        setMessages(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const result = await chatbotController.sendMessage(
        currentUser.uid,
        inputMessage
      );

      if (result.success) {
        const aiMessage = {
          id: Date.now() + 1,
          text: result.data.response,
          sender: 'ai',
          timestamp: new Date(result.data.timestamp),
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Desculpe, ocorreu um erro. Tente novamente.',
        sender: 'ai',
        timestamp: new Date(),
        isError: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { icon: '🌾', text: 'O que plantar agora?', action: 'Baseado no clima atual, quais culturas são mais adequadas para plantar?' },
    { icon: '📊', text: 'Analisar meu histórico', action: 'Analise meu histórico de plantio e sugira melhorias' },
    { icon: '☀️', text: 'Análise climática', action: 'Como está o clima para atividades agrícolas hoje?' },
    { icon: '💰', text: 'Otimizar custos', action: 'Como posso reduzir custos na minha produção?' },
  ];

  const handleQuickAction = (action) => {
    setInputMessage(action);
  };

  return (
    <>
      {/* Botão flutuante */}
      <button 
        className={`${styles.floatingButton} ${isOpen ? styles.open : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Abrir chatbot"
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Container do chat */}
      {isOpen && (
        <div className={styles.chatContainer}>
          {/* Header */}
          <div className={styles.chatHeader}>
            <div className={styles.headerInfo}>
              <div className={styles.headerIcon}>🤖</div>
              <div>
                <h3>Assistente IAgro</h3>
                <span className={styles.headerStatus}>
                  {loading ? 'Digitando...' : 'Online'}
                </span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className={styles.closeButton}
            >
              ✕
            </button>
          </div>

          {/* Mensagens */}
          <div className={styles.messagesContainer}>
            {messages.length === 0 ? (
              <div className={styles.welcomeMessage}>
                <h4>👋 Olá! Como posso ajudar?</h4>
                <p>Estou aqui para:</p>
                <ul>
                  <li>🌾 Sugerir culturas adequadas</li>
                  <li>📊 Analisar seu histórico</li>
                  <li>☀️ Interpretar dados climáticos</li>
                  <li>💡 Dar dicas de manejo</li>
                </ul>
                
                <div className={styles.quickActionsGrid}>
                  {quickActions.map((qa, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickAction(qa.action)}
                      className={styles.quickActionButton}
                    >
                      <span>{qa.icon}</span>
                      <span>{qa.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map(msg => (
                <ChatMessage key={msg.id} message={msg} />
              ))
            )}
            
            {loading && (
              <div className={styles.typingIndicator}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className={styles.inputContainer}>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Digite sua pergunta..."
              className={styles.input}
              disabled={loading}
            />
            <button 
              type="submit" 
              className={styles.sendButton}
              disabled={loading || !inputMessage.trim()}
            >
              {loading ? '⏳' : '📤'}
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;