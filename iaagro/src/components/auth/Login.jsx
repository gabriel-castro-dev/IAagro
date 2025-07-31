import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { doSignInWithEmailAndPassword } from '../../firebase/auth';
import { useAuth } from '../../authContext';
import styles from './Login.module.css';

const Login = () => {
    const { userLoggedIn } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!isSigningIn) {
            setIsSigningIn(true);
            setErrorMessage('');
            try {
                await doSignInWithEmailAndPassword(email, password);
            } catch (error) {
                setErrorMessage(error.message);
                setIsSigningIn(false);
            }
        }
    };

    return (
        <div className={styles.loginContainer}>
            {userLoggedIn && (<Navigate to={'/home'} replace={true} />)}

            <main className={styles.authContainer}>
                {/* Left side - Welcome section */}
                <section className={styles.welcomeSection}>
                    <div className={styles.logoSection}>
                        <img 
                            src="/logoSite.png" 
                            alt="IAgro Logo" 
                            className={styles.logo}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iNDAiIGZpbGw9IiNhNmJkOGMiLz4KPHN2ZyB4PSIyMCIgeT0iMjAiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgZmlsbD0id2hpdGUiPgo8cGF0aCBkPSJNMjAgMTBMMTAgMjBsMTAgMTAgMTAtMTB6bTAgMjBjLTUuNTIgMC0xMC00LjQ4LTEwLTEwczQuNDgtMTAgMTAtMTAgMTAgNC40OCAxMCAxMC00LjQ4IDEwLTEwIDEwem0wLTE2Yy0zLjMxIDAtNiAyLjY5LTYgNnMyLjY5IDYgNiA2IDYtMi42OSA2LTYtMi42OS02LTYtNnoiLz4KPC9zdmc+Cjx0ZXh0IHg9IjQwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPklBZ3JvPC90ZXh0Pgo8L3N2Zz4K';
                            }}
                        />
                    </div>
                    
                    <div className={styles.welcomeContent}>
                        <h1 className={styles.welcomeTitle}>SEJA BEM-VINDO!</h1>
                        <p className={styles.welcomeSubtitle}>
                            Para se conectar conosco, por favor entre em seu perfil pessoal
                        </p>
                        
                        <ul className={styles.featureList}>
                            <li className={styles.featureItem}>
                                <svg className={styles.featureIcon} viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                                </svg>
                                Análises agronômicas inteligentes
                            </li>
                            <li className={styles.featureItem}>
                                <svg className={styles.featureIcon} viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                                </svg>
                                Monitoramento climático em tempo real
                            </li>
                            <li className={styles.featureItem}>
                                <svg className={styles.featureIcon} viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                                </svg>
                                Gestão completa da sua propriedade
                            </li>
                        </ul>
                    </div>
                </section>

                {/* Right side - Login form */}
                <section className={styles.authCard}>
                    <div className={styles.authHeader}>
                        <h2 className={styles.title}>Entrar</h2>
                        <p className={styles.subtitle}>
                            Acesse sua conta para gerenciar sua propriedade
                        </p>
                    </div>

                    <form onSubmit={onSubmit} className={styles.authForm}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Email</label>
                            <input
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={styles.input}
                                placeholder="Digite seu email"
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Senha</label>
                            <input
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={styles.input}
                                placeholder="Digite sua senha"
                            />
                        </div>

                        {errorMessage && (
                            <div className={styles.errorMessage}>
                                {errorMessage}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSigningIn}
                            className={`${styles.submitButton} ${isSigningIn ? styles.loading : ''}`}
                        >
                            {isSigningIn ? 'Entrando...' : 'Entrar'}
                        </button>

                        <div className={styles.authLinks}>
                            <Link to="/recuperarsenha" className={styles.link}>
                                Esqueceu a senha?
                            </Link>
                        </div>

                        <div className={styles.signupPrompt}>
                            <p className={styles.signupText}>
                                Não tem uma conta?
                            </p>
                            <Link to="/cadastrar" className={styles.signupButton}>
                                Criar uma conta
                            </Link>
                        </div>
                    </form>
                </section>
            </main>
        </div>
    );
};

export default Login;