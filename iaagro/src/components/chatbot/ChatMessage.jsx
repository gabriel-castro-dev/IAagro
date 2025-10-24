import React from 'react';
import styles from './Chatbot.module.css';

const ChatMessage = ({ message }) => {
  const isUser = message.sender === 'user';
  
  return (
    <div className={`${styles.message} ${isUser ? styles.userMessage : styles.aiMessage}`}>
      <div className={styles.messageContent}>
        {!isUser && <div className={styles.messageIcon}>🤖</div>}
        <div className={styles.messageText}>
          {message.text}
        </div>
        {isUser && <div className={styles.messageIcon}>👤</div>}
      </div>
      <div className={styles.messageTime}>
        {new Date(message.timestamp).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        })}
      </div>
    </div>
  );
};

export default ChatMessage;