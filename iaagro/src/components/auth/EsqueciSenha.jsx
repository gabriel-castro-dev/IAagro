import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { doSendPasswordResetEmail } from '../../firebase/auth';
import { useAuth } from '../../authContext';
import styles from './EsqueciSenha.module.css';

const EsqueciSenha = () => {
    const { userLoggedIn } = useAuth();
    const [email, setEmail] = useState('');
    const [isResetting, setIsResetting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const onSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
        
        if (!email) {
            setErrorMessage('Por favor, informe seu email.');
            return;
        }
        
        if (isResetting) return;
        setIsResetting(true);
        
        try {
            // Envia diretamente o email de recuperação
            // O Firebase automaticamente retorna erro se o email não existir
            await doSendPasswordResetEmail(email);
            setSuccessMessage('Email de recuperação enviado! Verifique sua caixa de entrada.');
            setEmail(''); // Limpa o campo após envio bem-sucedido
        } catch (error) {
            console.log('Erro completo:', error); // Para debug
            
            // Tratamento de erros específicos do Firebase
            switch (error.code) {
                case 'auth/user-not-found':
                    setErrorMessage('Este email não está cadastrado em nosso sistema.');
                    break;
                case 'auth/invalid-email':
                    setErrorMessage('Email inválido. Verifique o formato do email.');
                    break;
                case 'auth/too-many-requests':
                    setErrorMessage('Muitas tentativas. Tente novamente mais tarde.');
                    break;
                case 'auth/network-request-failed':
                    setErrorMessage('Erro de conexão. Verifique sua internet.');
                    break;
                default:
                    setErrorMessage('Erro ao enviar email de recuperação. Tente novamente.');
                    console.error('Erro não tratado:', error);
            }
        } finally {
            setIsResetting(false);
        }
    };

    return (
        <>
          
            
            <div className={styles.container}>
                <div className={styles.left}>
                    <h1>ESQUECEU A SENHA?</h1>
                    <p>Informe seu e-mail para receber instruções de recuperação</p>
                    <div className={styles.buttonGroup}>
                        <Link to="/" className={styles.backButton}>Voltar ao login</Link>
                    </div>
                </div>
                
                <div className={styles.right}>
                    <form onSubmit={onSubmit}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Email</label>
                            <input
                                className={styles.input}
                                type="email"
                                placeholder="Digite seu email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        
                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={isResetting}
                        >
                            {isResetting ? 'Enviando...' : 'Enviar recuperação'}
                        </button>
                        
                        {/* Exibe mensagem de sucesso */}
                        {successMessage && (
                            <div className={styles.success}>{successMessage}</div>
                        )}
                        
                        {/* Exibe mensagem de erro */}
                        {errorMessage && (
                            <div className={styles.error}>{errorMessage}</div>
                        )}
                    </form>
                </div>
            </div>
        </>
    );
};

export default EsqueciSenha;