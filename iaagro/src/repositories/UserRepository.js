import { doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { User } from '../models/User';

export class UserRepository {
    constructor() {
        this.collection = 'userProfiles'; // ← CORREÇÃO: usar mesma coleção do profileService
    }

    // Buscar usuário por ID
    async findById(userId) {
        try {
            const userDoc = await getDoc(doc(db, this.collection, userId));
            
            if (userDoc.exists()) {
                const data = userDoc.data();
                // Criar User com dados do perfil
                return new User(userId, data.email || '', data.nomeCompleto || '', data);
            }
            
            return null;
        } catch (error) {
            throw new Error(`Erro ao buscar usuário: ${error.message}`);
        }
    }

    // Salvar/criar usuário
    async save(user) {
        try {
            const userData = {
                ...user.profile,
                email: user.email,
                nomeCompleto: user.profile.nomeCompleto || user.name,
                updatedAt: new Date(),
                createdAt: user.createdAt || new Date()
            };
            
            await setDoc(doc(db, this.collection, user.id), userData);
            return user;
        } catch (error) {
            throw new Error(`Erro ao salvar usuário: ${error.message}`);
        }
    }

    // Criar usuário inicial compatível com profileService
    async createInitialUser(userId, email, name) {
        try {
            const initialProfile = {
                email: email,
                nomeCompleto: name,
                telefone: '',
                endereco: '',
                cidade: '',
                estado: '',
                cep: '',
                profissao: '',
                experienciaAgro: '',
                propriedadeRural: '',
                idioma: 'Português',
                tema: 'light',
                notificacoesEmail: true,
                notificacoesPush: false,
                notificacoesMarketing: false,
                culturasFavoritas: 'Soja',
                backupAutomatico: '15 dias',
                unidadeMedida: 'Métrico',
                moeda: 'BRL',
                timezone: 'America/Sao_Paulo',
                redesSociais: {
                    facebook: '',
                    instagram: '',
                    linkedin: '',
                    twitter: ''
                },
                configuracoesDashboard: {
                    mostrarClima: true,
                    mostrarPrecos: true,
                    mostrarAlertas: true,
                    mostrarGraficos: true
                },
                criadoEm: new Date(),
                atualizadoEm: new Date()
            };

            await setDoc(doc(db, this.collection, userId), initialProfile);
            
            return new User(userId, email, name, initialProfile);
        } catch (error) {
            throw new Error(`Erro ao criar usuário inicial: ${error.message}`);
        }
    }

    // Atualizar apenas o perfil
    async updateProfile(userId, profileData) {
        try {
            const updateData = {
                ...profileData,
                atualizadoEm: new Date()
            };
            
            await updateDoc(doc(db, this.collection, userId), updateData);
            return await this.findById(userId);
        } catch (error) {
            throw new Error(`Erro ao atualizar perfil: ${error.message}`);
        }
    }

    // Atualizar usuário
    async update(userId, userData) {
        try {
            const updateData = {
                ...userData,
                atualizadoEm: new Date()
            };
            
            await updateDoc(doc(db, this.collection, userId), updateData);
            return await this.findById(userId);
        } catch (error) {
            throw new Error(`Erro ao atualizar usuário: ${error.message}`);
        }
    }

    // Deletar usuário
    async delete(userId) {
        try {
            await deleteDoc(doc(db, this.collection, userId));
            return true;
        } catch (error) {
            throw new Error(`Erro ao deletar usuário: ${error.message}`);
        }
    }

    // Verificar se usuário existe
    async exists(userId) {
        try {
            const userDoc = await getDoc(doc(db, this.collection, userId));
            return userDoc.exists();
        } catch (error) {
            throw new Error(`Erro ao verificar usuário: ${error.message}`);
        }
    }
}