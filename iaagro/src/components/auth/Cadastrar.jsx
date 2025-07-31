import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { doCreateUserWithEmailAndPassword } from '../../firebase/auth';
import { useAuth } from '../../authContext';
import styles from './Cadastrar.module.css';

const Cadastrar = () => {
    const { userLoggedIn } = useAuth();
    const [nomeCompleto, setNomeCompleto] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const onSubmit = async (e) => {
        e.preventDefault();
        
        // Validação das senhas
        if (password !== confirmPassword) {
            setErrorMessage('As senhas não coincidem');
            return;
        }
        
        if (password.length < 6) {
            setErrorMessage('A senha deve ter pelo menos 6 caracteres');
            return;
        }
        
        if (!isRegistering) {
            setIsRegistering(true);
            try {
                await doCreateUserWithEmailAndPassword(email, password);
                // O redirecionamento será feito automaticamente pelo Navigate abaixo
            } catch (error) {
                if (error.code === 'auth/email-already-in-use') {
                    setErrorMessage('Este email já está cadastrado');
                } else if (error.code === 'auth/weak-password') {
                    setErrorMessage('A senha é muito fraca');
                } else {
                    setErrorMessage('Erro ao criar conta. Tente novamente.');
                }
                setIsRegistering(false);
            }
        }
    };

    return (
        <>
            {userLoggedIn && <Navigate to="/home" replace={true} />}
            
            <div className={styles.container}>
                <div className={styles.left}>
                    <h1>CRIAR CONTA</h1>
                    <p>Preencha os campos para criar sua conta e acessar nossos serviços</p>
                    <div className={styles.buttonGroup}>
                        <Link to="/" className={styles.backButton}>Voltar ao login</Link>
                    </div>
                </div>
                
                <div className={styles.right}>
                    <form onSubmit={onSubmit}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Nome completo</label>
                            <input
                                className={styles.input}
                                type="text"
                                placeholder="Digite seu nome completo"
                                value={nomeCompleto}
                                onChange={(e) => setNomeCompleto(e.target.value)}
                                required
                            />
                        </div>
                        
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
                        
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Senha</label>
                            <input
                                className={styles.input}
                                type="password"
                                placeholder="Digite sua senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Confirmar senha</label>
                            <input
                                className={styles.input}
                                type="password"
                                placeholder="Confirme sua senha"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>
                        
                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={isRegistering}
                        >
                            {isRegistering ? 'Cadastrando...' : 'Cadastrar'}
                        </button>
                        
                        {errorMessage && (
                            <div className={styles.error}>{errorMessage}</div>
                        )}
                    </form>
                </div>
            </div>
        </>
    );
};

export default Cadastrar;