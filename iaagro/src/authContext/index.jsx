import React, { useContext, useState, useEffect } from "react";
import { auth } from '../firebase/firebase';
import { onAuthStateChanged } from "firebase/auth";

// Criação do contexto de autenticação
const AuthContext = React.createContext();

// Hook customizado para acessar o contexto de autenticação
export function useAuth(){
    return useContext(AuthContext);
}

// Provider que gerencia o estado de autenticação e fornece para a aplicação
export function AuthProvider({ children }) {
    // Estado para armazenar o usuário atual
    const [currentUser, setCurrentUser] = useState(null);
    // Estado para indicar se o usuário está logado
    const [userLoggedIn, setUserLoggedIn] = useState(false);
    // Estado para controlar o carregamento inicial
    const [loading, setLoading] = useState(true);

    // Efeito para escutar mudanças de autenticação do Firebase
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, initializeUser);
        return unsubscribe; // Limpa o listener ao desmontar
    }, [])

    // Função chamada quando o estado de autenticação muda
    async function initializeUser(user) {
        if (user) {
            setCurrentUser({ ...user }); // Atualiza usuário
            setUserLoggedIn(true);      // Marca como logado
        } else {
            setCurrentUser(null);       // Limpa usuário
            setUserLoggedIn(false);     // Marca como deslogado
        }
        setLoading(false);              // Finaliza carregamento
    }

    // Valor fornecido pelo contexto
    const value = { 
        currentUser, 
        userLoggedIn, 
        loading
    }

    // Renderiza o provider, exibindo os filhos apenas após o carregamento
    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}


