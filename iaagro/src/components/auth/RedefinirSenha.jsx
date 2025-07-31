import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { doConfirmPasswordReset } from '../../firebase/auth';
import styles from './EsqueciSenha.module.css';

const RedefinirSenha = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [oobCode, setOobCode] = useState('');

    useEffect(() => {
        const code = searchParams.get('oobCode');
        const mode = searchParams.get('mode');
        
        console.log('Parâmetros da URL:', { code, mode });
        
        if (mode !== 'resetPassword' || !code) {
            setError('Link inválido ou expirado.');
            return;
        }
        
        setOobCode(code);
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (newPassword !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        if (newPassword.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        setIsLoading(true);

        try {
            await doConfirmPasswordReset(oobCode, newPassword);
            setMessage('Senha redefinida com sucesso! Redirecionando para o login...');
            
            // Redireciona para login após 3 segundos
            setTimeout(() => {
                navigate('/');
            }, 3000);
            
        } catch (error) {
            console.error('Erro ao redefinir senha:', error);
            setError('Erro ao redefinir senha. O link pode ter expirado.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.left}>
                <h1>NOVA SENHA</h1>
                <p>Digite sua nova senha para continuar</p>
            </div>
            
            <div className={styles.right}>
                {oobCode ? (
                    <form onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Nova senha</label>
                            <input
                                className={styles.input}
                                type="password"
                                placeholder="Digite sua nova senha"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Confirmar senha</label>
                            <input
                                className={styles.input}
                                type="password"
                                placeholder="Confirme sua nova senha"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>
                        
                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Salvando...' : 'Salvar nova senha'}
                        </button>
                        
                        {message && <div className={styles.success}>{message}</div>}
                        {error && <div className={styles.error}>{error}</div>}
                    </form>
                ) : (
                    <div className={styles.error}>Link inválido ou expirado.</div>
                )}
            </div>
        </div>
    );
};

export default RedefinirSenha;