import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, updatePassword, confirmPasswordReset } from 'firebase/auth';
import { auth } from './firebase';

// Função para criar usuário com email e senha
export const doCreateUserWithEmailAndPassword = async (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
};

// Função para fazer login com email e senha
export const doSignInWithEmailAndPassword = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
};

// Função para enviar email de redefinição de senha
export const doSendPasswordResetEmail = async (email) => {
    return sendPasswordResetEmail(auth, email);
};

// Função para atualizar senha
export const doUpdatePassword = async (password) => {
    return updatePassword(auth.currentUser, password);
};

// Função para confirmar redefinição de senha
export const doConfirmPasswordReset = async (code, newPassword) => {
    return confirmPasswordReset(auth, code, newPassword);
};

// Função para fazer logout
export const doSignOut = () => {
    return auth.signOut();
};

