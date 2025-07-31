import React, { useState, useEffect } from 'react';
import { getRandomItems } from '../../data/suggestedItems';
import styles from './SuggestedItemsFooter.module.css';

const SuggestedItemsFooter = () => {
  const [randomItems, setRandomItems] = useState([]);

  useEffect(() => {
    // Gera novos itens aleatórios a cada carregamento
    setRandomItems(getRandomItems(3));
    
    // Opcional: atualiza os itens a cada 30 segundos
    const interval = setInterval(() => {
      setRandomItems(getRandomItems(3));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}>
            <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6a2 2 0 0 1 4 0v1h-4V6zm6 14H8a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h2v1a1 1 0 0 0 2 0V9h2v10a1 1 0 0 1-1 1z"/>
            </svg>
            Recomendações para sua Propriedade
          </h3>
          <p className={styles.subtitle}>
            Itens selecionados especialmente para otimizar sua produção
          </p>
        </div>
        
        <div className={styles.itemsGrid}>
          {randomItems.map((item, index) => (
            <div key={`${item.id}-${index}`} className={styles.itemCard}>
              <div className={styles.itemCategory}>
                {item.category}
              </div>
              <h4 className={styles.itemName}>
                {item.name}
              </h4>
              <div className={styles.priceContainer}>
                <span className={styles.priceLabel}>Preço médio:</span>
                <span className={styles.price}>
                  {formatPrice(item.avgPrice)}
                </span>
              </div>
              <button className={styles.actionButton}>
                <svg className={styles.buttonIcon} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                Adicionar à Lista
              </button>
            </div>
          ))}
        </div>
        
        <div className={styles.footerBottom}>
          <p className={styles.disclaimer}>
            * Preços médios baseados em pesquisa de mercado. Valores podem variar conforme região e fornecedor.
          </p>
          <button 
            className={styles.refreshButton}
            onClick={() => setRandomItems(getRandomItems(3))}
          >
            <svg className={styles.refreshIcon} viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
            Novas Sugestões
          </button>
        </div>
      </div>
    </footer>
  );
};

export default SuggestedItemsFooter;