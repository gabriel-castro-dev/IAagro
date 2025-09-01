import { 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc, 
    collection,
    serverTimestamp,
    query,
    where,
    orderBy,
    getDocs,
    limit
} from 'firebase/firestore';
import { db } from '../firebase/firebase';

// Configurações padrão do perfil
const defaultProfileSettings = {
    nomeCompleto: '',
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
    email: '',
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
    criadoEm: null,
    atualizadoEm: null
};

/**
 * Busca as configurações do perfil do usuário
 * @param {string} userId - ID do usuário
 * @returns {Object} - Configurações do perfil
 */
export const getUserProfile = async (userId) => {
    try {
        const profileRef = doc(db, 'userProfiles', userId);
        const profileSnap = await getDoc(profileRef);
        
        if (profileSnap.exists()) {
            const data = profileSnap.data();
            console.log('Perfil carregado do banco:', data);
            return {
                ...defaultProfileSettings,
                ...data,
                // Garantir que objetos aninhados sejam mesclados corretamente
                redesSociais: {
                    ...defaultProfileSettings.redesSociais,
                    ...(data.redesSociais || {})
                },
                configuracoesDashboard: {
                    ...defaultProfileSettings.configuracoesDashboard,
                    ...(data.configuracoesDashboard || {})
                }
            };
        } else {
            console.log('Perfil não encontrado, retornando configurações padrão');
            return {
                ...defaultProfileSettings,
                email: '' // Será preenchido no componente
            };
        }
    } catch (error) {
        console.error('Erro ao buscar perfil do usuário:', error);
        throw new Error('Falha ao carregar perfil: ' + error.message);
    }
};

/**
 * Salva as configurações do perfil do usuário
 * @param {string} userId - ID do usuário
 * @param {Object} profileData - Dados do perfil
 * @returns {boolean} - Sucesso da operação
 */
export const saveUserProfile = async (userId, profileData) => {
    try {
        const profileRef = doc(db, 'userProfiles', userId);
        const profileSnap = await getDoc(profileRef);
        
        const dataToSave = {
            ...profileData,
            atualizadoEm: serverTimestamp()
        };

        if (profileSnap.exists()) {
            // Atualizar perfil existente
            await updateDoc(profileRef, dataToSave);
            console.log('Perfil atualizado com sucesso');
        } else {
            // Criar novo perfil
            dataToSave.criadoEm = serverTimestamp();
            await setDoc(profileRef, dataToSave);
            console.log('Novo perfil criado com sucesso');
        }
        
        return true;
    } catch (error) {
        console.error('Erro ao salvar perfil:', error);
        throw new Error('Falha ao salvar perfil: ' + error.message);
    }
};

/**
 * Atualiza apenas campos específicos do perfil
 * @param {string} userId - ID do usuário
 * @param {Object} updates - Campos a serem atualizados
 * @returns {boolean} - Sucesso da operação
 */
export const updateUserProfile = async (userId, updates) => {
    try {
        const profileRef = doc(db, 'userProfiles', userId);
        
        await updateDoc(profileRef, {
            ...updates,
            atualizadoEm: serverTimestamp()
        });
        
        console.log('Perfil atualizado parcialmente:', updates);
        return true;
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        throw new Error('Falha ao atualizar perfil: ' + error.message);
    }
};

/**
 * Salva dados agronômicos do usuário
 * @param {string} userId - ID do usuário
 * @param {Object} agronomicalData - Dados agronômicos
 * @returns {boolean} - Sucesso da operação
 */
export const saveAgronomicalData = async (userId, agronomicalData) => {
    try {
        const dataRef = doc(collection(db, 'agronomicalData'), `${userId}_${Date.now()}`);
        
        await setDoc(dataRef, {
            userId,
            ...agronomicalData,
            criadoEm: serverTimestamp()
        });
        
        console.log('Dados agronômicos salvos com sucesso');
        return true;
    } catch (error) {
        console.error('Erro ao salvar dados agronômicos:', error);
        throw new Error('Falha ao salvar dados agronômicos: ' + error.message);
    }
};

/**
 * Busca dados agronômicos do usuário
 * @param {string} userId - ID do usuário
 * @returns {Array} - Lista de dados agronômicos
 */
export const getUserAgronomicalData = async (userId) => {
    try {
        const q = query(
            collection(db, 'agronomicalData'),
            where('userId', '==', userId),
            orderBy('criadoEm', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const data = [];
        
        querySnapshot.forEach((doc) => {
            data.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return data;
    } catch (error) {
        console.error('Erro ao buscar dados agronômicos:', error);
        return [];
    }
};

/**
 * Busca dados agronômicos do usuário para exibir no histórico
 * @param {string} userId - ID do usuário
 * @returns {Array} - Lista de dados agronômicos formatados para o histórico
 */
export const getUserAgronomicalDataForHistory = async (userId) => {
    try {
        console.log('Buscando dados do histórico para usuário:', userId);
        
        // Query sem orderBy primeiro para testar
        const q = query(
            collection(db, 'agronomicalData'),
            where('userId', '==', userId),
            limit(50)
        );
        
        const querySnapshot = await getDocs(q);
        const historyData = [];
        
        console.log('Documentos encontrados:', querySnapshot.size);
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            console.log('Documento encontrado:', doc.id, data);
            
            const criadoEm = data.criadoEm?.toDate();
            
            // Formatar data para exibição
            const dataFormatada = criadoEm ? 
                criadoEm.toLocaleDateString('pt-BR') : 
                new Date().toLocaleDateString('pt-BR'); // Usar data atual se não tiver
            
            // Determinar tipo baseado nos dados
            let tipo = 'Dados Agronômicos';
            let descricao = '';
            
            // Priorizar por tipo de dados presentes
            if (data.tipoCultura && data.dataPlantio) {
                tipo = 'Plantio';
                descricao = `Plantio de ${data.tipoCultura}`;
                if (data.tipoSolo) {
                    descricao += ` em solo ${data.tipoSolo}`;
                }
            } else if (data.dataColheita) {
                tipo = 'Colheita';
                descricao = `Colheita de ${data.tipoCultura || 'cultura'}`;
                if (data.rendimentoFinal) {
                    descricao += ` - ${data.rendimentoFinal} kg/ha`;
                }
            } else if (data.usoDefensivos) {
                tipo = 'Aplicação de Defensivos';
                descricao = `Aplicação: ${data.usoDefensivos}`;
            } else if (data.dataTipoAdubacao) {
                tipo = 'Adubação';
                descricao = `Adubação: ${data.dataTipoAdubacao}`;
            } else if (data.ocorrenciaPragas) {
                tipo = 'Controle de Pragas';
                descricao = `Pragas/Doenças: ${data.ocorrenciaPragas}`;
            } else if (data.tipoCultura) {
                tipo = 'Plantio';
                descricao = `Registro de ${data.tipoCultura}`;
            }
            
            // Se não tiver descrição específica, criar uma geral
            if (!descricao) {
                descricao = `Registro de dados agronômicos`;
                if (data.tipoCultura) {
                    descricao += ` para ${data.tipoCultura}`;
                }
            }
            
            historyData.push({
                id: doc.id,
                data: dataFormatada,
                tipo: tipo,
                cultura: data.tipoCultura ? 
                    data.tipoCultura.charAt(0).toUpperCase() + data.tipoCultura.slice(1) : 
                    'Não especificada',
                descricao: descricao,
                dadosCompletos: data,
                timestamp: criadoEm || new Date() // Para ordenação
            });
        });
        
        // Ordenar por data (mais recente primeiro)
        historyData.sort((a, b) => b.timestamp - a.timestamp);
        
        console.log('Dados formatados para histórico:', historyData);
        return historyData;
        
    } catch (error) {
        console.error('Erro detalhado ao buscar dados para histórico:', error);
        return [];
    }
};

// AddressController.js - para centralizar lógica de CEP
export class AddressController {
    async searchAddressByCEP(cep) {
        // Implementar lógica usando addressService
    }
    
    async validateAndFormatAddress(addressData) {
        // Validações e formatação
    }
}

export { defaultProfileSettings };