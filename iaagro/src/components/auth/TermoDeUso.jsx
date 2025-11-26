import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './TermoDeUso.module.css';

const TermoDeUso = () => {
    const navigate = useNavigate();
    const [accepted, setAccepted] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);

    const handleScroll = (e) => {
        const element = e.target;
        const scrollPercentage = (element.scrollLeft / (element.scrollWidth - element.clientWidth)) * 100;
        setScrollProgress(Math.min(scrollPercentage, 100));
    };

    const handleAccept = () => {
        if (accepted) {
            localStorage.setItem('termsAccepted', 'true');
            navigate('/cadastrar');
        }
    };

    const handleDecline = () => {
        navigate('/');
    };

    return (
        <div className={styles.termoContainer}>
            {/* Header */}
            <div className={styles.termoHeader}>
                <div className={styles.headerContent}>
                    <h1 className={styles.mainTitle}>📋 Termos de Uso</h1>
                    <p className={styles.headerSubtitle}>
                        Leia atentamente as condições de uso do Sistema IAgro
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className={styles.termoWrapper}>
                {/* Left Sidebar - Navigation */}
                <aside className={styles.sidebar}>
                    <nav className={styles.navMenu}>
                        <h3 className={styles.navTitle}>📑 Seções</h3>
                        <ul className={styles.navList}>
                            <li>
                                <a href="#introducao" className={styles.navLink}>
                                    Introdução
                                </a>
                            </li>
                            <li>
                                <a href="#condicoes" className={styles.navLink}>
                                    Condições Gerais
                                </a>
                            </li>
                            <li>
                                <a href="#coleta" className={styles.navLink}>
                                    Coleta de Dados
                                </a>
                            </li>
                            <li>
                                <a href="#finalidade" className={styles.navLink}>
                                    Finalidade da Coleta
                                </a>
                            </li>
                            <li>
                                <a href="#vedacoes" className={styles.navLink}>
                                    Vedações
                                </a>
                            </li>
                            <li>
                                <a href="#protecao" className={styles.navLink}>
                                    Proteção de Dados
                                </a>
                            </li>
                            <li>
                                <a href="#compartilhamento" className={styles.navLink}>
                                    Compartilhamento
                                </a>
                            </li>
                            <li>
                                <a href="#direitos" className={styles.navLink}>
                                    Direitos do Titular
                                </a>
                            </li>
                        </ul>
                    </nav>
                </aside>

                {/* Content Area */}
                <main className={styles.termoContent} onScroll={handleScroll}>
                    {/* Progress Bar */}
                    <div className={styles.progressBar}>
                        <div 
                            className={styles.progressFill}
                            style={{ width: `${scrollProgress}%` }}
                        ></div>
                    </div>

                    {/* Introdução */}
                    <section id="introducao" className={styles.termoSection}>
                        <h2 className={styles.sectionTitle}>🌾 TERMO DE USO DO SISTEMA "IAgro"</h2>
                        
                        <div className={styles.introBox}>
                            <p className={styles.termoText}>
                                Este Termo de Uso ("Termo") é um acordo legal entre você, o(a) usuário(a) do sistema, e os 
                                desenvolvedores do Projeto <strong>IAgro</strong>, um sistema de gestão agronômica inteligente 
                                voltado para auxiliar agricultores de micro e médio porte no controle, análise e tomada de 
                                decisão sobre suas lavouras.
                            </p>
                            
                            <p className={styles.termoText}>
                                Ao acessar ou utilizar o IAgro, você manifesta sua concordância integral com este Termo de Uso, 
                                com a Política de Privacidade e com a <strong>Lei Geral de Proteção de Dados Pessoais 
                                (Lei nº 13.709/2018 – LGPD)</strong>.
                            </p>
                            
                            <p className={styles.alertBox}>
                                <strong>⚠️ Atenção:</strong> Se você não concordar com estes termos, não deverá utilizar o sistema.
                            </p>
                        </div>
                    </section>

                    {/* Cláusula Primeira */}
                    <section id="condicoes" className={styles.termoSection}>
                        <h3 className={styles.clauseTitle}>📌 CLÁUSULA PRIMEIRA – DAS CONDIÇÕES GERAIS DE USO</h3>
                        
                        <div className={styles.clauseContent}>
                            <p className={styles.termoText}>
                                O IAgro é destinado a facilitar a gestão agrícola por meio de:
                            </p>
                            
                            <ul className={styles.featureList}>
                                <li>📊 Dashboards de análise e monitoramento</li>
                                <li>🌦️ Alertas climáticos em tempo real</li>
                                <li>📈 Relatórios personalizados de produtividade</li>
                                <li>🤖 Recomendações técnicas baseadas em Inteligência Artificial</li>
                                <li>📋 Histórico agrícola completo</li>
                            </ul>
                        </div>
                    </section>

                    {/* Cláusula Segunda */}
                    <section id="coleta" className={styles.termoSection}>
                        <h3 className={styles.clauseTitle}>📌 CLÁUSULA SEGUNDA – DA COLETA E USO DE DADOS PESSOAIS</h3>
                        
                        <div className={styles.clauseContent}>
                            <p className={styles.termoText}>
                                O usuário declara estar ciente da coleta e uso dos seguintes dados pelo IAgro:
                            </p>
                            
                            <div className={styles.dataGrid}>
                                <div className={styles.dataItem}>
                                    <span className={styles.dataIcon}>👤</span>
                                    <div>
                                        <strong>Identificação</strong>
                                        <p>Nome completo, e-mail e CPF para identificação e autenticação segura</p>
                                    </div>
                                </div>
                                
                                <div className={styles.dataItem}>
                                    <span className={styles.dataIcon}>📍</span>
                                    <div>
                                        <strong>Localização</strong>
                                        <p>Dados de localização e CEP para alertas específicos à região</p>
                                    </div>
                                </div>
                                
                                <div className={styles.dataItem}>
                                    <span className={styles.dataIcon}>🌾</span>
                                    <div>
                                        <strong>Agrícola</strong>
                                        <p>Culturas, produtividade, irrigação e insumos utilizados</p>
                                    </div>
                                </div>
                                
                                <div className={styles.dataItem}>
                                    <span className={styles.dataIcon}>🌦️</span>
                                    <div>
                                        <strong>Climático</strong>
                                        <p>Informações climáticas associadas ao perfil de cultivo</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Cláusula Terceira */}
                    <section id="finalidade" className={styles.termoSection}>
                        <h3 className={styles.clauseTitle}>📌 CLÁUSULA TERCEIRA – FINALIDADE DA COLETA</h3>
                        
                        <div className={styles.clauseContent}>
                            <p className={styles.termoText}>
                                Os dados pessoais coletados têm as seguintes finalidades:
                            </p>
                            
                            <ul className={styles.purposeList}>
                                <li>✓ Permitir o uso do sistema e autenticação do usuário</li>
                                <li>✓ Gerar relatórios e recomendações técnicas personalizadas</li>
                                <li>✓ Enviar notificações e alertas climáticos</li>
                                <li>✓ Manter o histórico agrícola do usuário</li>
                                <li>✓ Melhorar continuamente o desempenho e a precisão do sistema</li>
                            </ul>
                        </div>
                    </section>

                    {/* Cláusula Quarta */}
                    <section id="vedacoes" className={styles.termoSection}>
                        <h3 className={styles.clauseTitle}>📌 CLÁUSULA QUARTA – VEDAÇÕES DO USO</h3>
                        
                        <div className={styles.clauseContent}>
                            <p className={styles.termoText}>
                                O usuário compromete-se a <strong>não utilizar</strong> o IAgro para qualquer finalidade ilícita, incluindo:
                            </p>
                            
                            <div className={styles.restrictionBox}>
                                <ul className={styles.restrictionList}>
                                    <li>❌ Envio de conteúdo ofensivo ou discriminatório</li>
                                    <li>❌ Invasão ou acesso não autorizado a contas</li>
                                    <li>❌ Violação de direitos de terceiros</li>
                                    <li>❌ Transmissão de malware ou código malicioso</li>
                                    <li>❌ Spam, phishing ou engenharia social</li>
                                    <li>❌ Atividades comerciais não autorizadas</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Cláusula Quinta */}
                    <section id="protecao" className={styles.termoSection}>
                        <h3 className={styles.clauseTitle}>📌 CLÁUSULA QUINTA – DA PROTEÇÃO DOS DADOS</h3>
                        
                        <div className={styles.clauseContent}>
                            <p className={styles.termoText}>
                                O IAgro adota as seguintes medidas técnicas e administrativas para garantir a proteção dos dados:
                            </p>
                            
                            <div className={styles.protectionGrid}>
                                <div className={styles.protectionItem}>
                                    <span className={styles.protectionIcon}>🔐</span>
                                    <strong>Criptografia</strong>
                                    <p>Dados criptografados e armazenamento seguro no Firebase</p>
                                </div>
                                
                                <div className={styles.protectionItem}>
                                    <span className={styles.protectionIcon}>🔑</span>
                                    <strong>Autenticação</strong>
                                    <p>Login via Firebase Authentication com segurança de ponta</p>
                                </div>
                                
                                <div className={styles.protectionItem}>
                                    <span className={styles.protectionIcon}>👁️</span>
                                    <strong>Controle de Acesso</strong>
                                    <p>Controle rigoroso de acesso e auditoria de atividades</p>
                                </div>
                                
                                <div className={styles.protectionItem}>
                                    <span className={styles.protectionIcon}>⚡</span>
                                    <strong>Resposta a Incidentes</strong>
                                    <p>Política ativa de resposta a incidentes de segurança</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Cláusula Sexta */}
                    <section id="compartilhamento" className={styles.termoSection}>
                        <h3 className={styles.clauseTitle}>📌 CLÁUSULA SEXTA – DO COMPARTILHAMENTO DE DADOS</h3>
                        
                        <div className={styles.clauseContent}>
                            <p className={styles.termoText}>
                                Os dados coletados <strong>não serão compartilhados com terceiros</strong>, salvo mediante:
                            </p>
                            
                            <ul className={styles.sharingList}>
                                <li>📋 Autorização expressa do titular</li>
                                <li>⚖️ Obrigação legal ou decisão judicial</li>
                                <li>🔧 Suporte técnico restrito e controlado</li>
                            </ul>
                            
                            <p className={styles.warningText}>
                                <strong>⚠️ Transparência:</strong> Qualquer compartilhamento será comunicado ao usuário 
                                e realizado apenas com parceiros confiáveis que adotem medidas de segurança equivalentes.
                            </p>
                        </div>
                    </section>

                    {/* Cláusula Sétima */}
                    <section id="direitos" className={styles.termoSection}>
                        <h3 className={styles.clauseTitle}>📌 CLÁUSULA SÉTIMA – DOS DIREITOS DO TITULAR DOS DADOS</h3>
                        
                        <div className={styles.clauseContent}>
                            <p className={styles.termoText}>
                                O usuário poderá exercer seus direitos previstos na <strong>LGPD</strong>, incluindo:
                            </p>
                            
                            <div className={styles.rightsGrid}>
                                <div className={styles.rightItem}>
                                    <h4>👁️ Direito de Acesso</h4>
                                    <p>Solicitar acesso a todos os seus dados armazenados</p>
                                </div>
                                
                                <div className={styles.rightItem}>
                                    <h4>✏️ Direito de Retificação</h4>
                                    <p>Corrigir informações incompletas ou inexatas</p>
                                </div>
                                
                                <div className={styles.rightItem}>
                                    <h4>🗑️ Direito de Exclusão</h4>
                                    <p>Solicitar a exclusão de seus dados pessoais</p>
                                </div>
                                
                                <div className={styles.rightItem}>
                                    <h4>🔄 Revogação de Consentimento</h4>
                                    <p>Revogar o consentimento dado anteriormente</p>
                                </div>
                                
                                <div className={styles.rightItem}>
                                    <h4>📊 Portabilidade de Dados</h4>
                                    <p>Receber seus dados em formato estruturado</p>
                                </div>
                                
                                <div className={styles.rightItem}>
                                    <h4>ℹ️ Informações de Tratamento</h4>
                                    <p>Solicitar informações sobre como seus dados são tratados</p>
                                </div>
                            </div>
                            
                            <div className={styles.contactBox}>
                                <h4>📧 Canal de Contato LGPD:</h4>
                                <p>
                                    Para exercer qualquer um dos direitos acima, entre em contato conosco através do e-mail:
                                </p>
                                <a href="mailto:iaagronotification@gmail.com" className={styles.contactLink}>
                                    iaagronotification@gmail.com
                                </a>
                                <p className={styles.responseTime}>
                                    ⏱️ Prazo de resposta: até 15 dias úteis
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Final Section */}
                    <section className={styles.termoSection}>
                        <div className={styles.finalBox}>
                            <h4>✅ Concordância</h4>
                            <p>
                                Ao utilizar o IAgro, você reconhece que leu, compreendeu e concorda com todos os termos 
                                contidos neste Termo de Uso e na Política de Privacidade.
                            </p>
                            <p className={styles.lastUpdate}>
                                <strong>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}
                            </p>
                        </div>
                    </section>
                </main>
            </div>

            {/* Footer with Actions */}
            <div className={styles.termoFooter}>
                <div className={styles.footerContent}>
                    <label className={styles.checkboxContainer}>
                        <input
                            type="checkbox"
                            checked={accepted}
                            onChange={(e) => setAccepted(e.target.checked)}
                            className={styles.checkbox}
                        />
                        <span className={styles.checkboxLabel}>
                            Eu li e concordo com os Termos de Uso e Política de Privacidade
                        </span>
                    </label>

                    <div className={styles.actionButtons}>
                        <button
                            onClick={handleDecline}
                            className={styles.declineButton}
                        >
                            ✕ Recusar
                        </button>
                        <button
                            onClick={handleAccept}
                            disabled={!accepted}
                            className={styles.acceptButton}
                        >
                            ✓ Aceitar e Continuar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermoDeUso;