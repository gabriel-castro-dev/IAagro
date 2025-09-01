import { 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    setDoc, 
    updateDoc, 
    deleteDoc, 
    addDoc,
    query, 
    where, 
    orderBy, 
    limit
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { AgricultureData } from '../models/AgricultureData';

export class DataRepository {
    constructor() {
        this.collection = 'agriculture_data';
    }

    // Buscar dados por ID
    async findById(dataId) {
        try {
            const dataDoc = await getDoc(doc(db, this.collection, dataId));
            
            if (dataDoc.exists()) {
                return AgricultureData.fromFirestore(dataDoc.id, dataDoc.data());
            }
            
            return null;
        } catch (error) {
            throw new Error(`Erro ao buscar dados: ${error.message}`);
        }
    }

    // Buscar todos os dados de um usuário
    async findByUserId(userId, limitCount = 50) {
        try {
            const q = query(
                collection(db, this.collection),
                where('userId', '==', userId),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );
            
            const querySnapshot = await getDocs(q);
            const dataList = [];
            
            querySnapshot.forEach((doc) => {
                dataList.push(AgricultureData.fromFirestore(doc.id, doc.data()));
            });
            
            return dataList;
        } catch (error) {
            throw new Error(`Erro ao buscar dados do usuário: ${error.message}`);
        }
    }

    // Buscar por tipo de atividade
    async findByUserAndType(userId, tipo) {
        try {
            const q = query(
                collection(db, this.collection),
                where('userId', '==', userId),
                where('tipo', '==', tipo),
                orderBy('data', 'desc')
            );
            
            const querySnapshot = await getDocs(q);
            const dataList = [];
            
            querySnapshot.forEach((doc) => {
                dataList.push(AgricultureData.fromFirestore(doc.id, doc.data()));
            });
            
            return dataList;
        } catch (error) {
            throw new Error(`Erro ao buscar dados por tipo: ${error.message}`);
        }
    }

    // Buscar por período
    async findByDateRange(userId, startDate, endDate) {
        try {
            const q = query(
                collection(db, this.collection),
                where('userId', '==', userId),
                where('data', '>=', startDate),
                where('data', '<=', endDate),
                orderBy('data', 'asc')
            );
            
            const querySnapshot = await getDocs(q);
            const dataList = [];
            
            querySnapshot.forEach((doc) => {
                dataList.push(AgricultureData.fromFirestore(doc.id, doc.data()));
            });
            
            return dataList;
        } catch (error) {
            throw new Error(`Erro ao buscar dados por período: ${error.message}`);
        }
    }

    // Salvar dados
    async save(agricultureData) {
        try {
            if (agricultureData.id) {
                // Atualizar existente
                await updateDoc(doc(db, this.collection, agricultureData.id), 
                    agricultureData.toFirestore());
                return agricultureData;
            } else {
                // Criar novo
                const docRef = await addDoc(collection(db, this.collection), 
                    agricultureData.toFirestore());
                agricultureData.id = docRef.id;
                return agricultureData;
            }
        } catch (error) {
            throw new Error(`Erro ao salvar dados: ${error.message}`);
        }
    }

    // Atualizar dados
    async update(dataId, updateData) {
        try {
            const updatePayload = {
                ...updateData,
                updatedAt: new Date()
            };
            
            await updateDoc(doc(db, this.collection, dataId), updatePayload);
            return await this.findById(dataId);
        } catch (error) {
            throw new Error(`Erro ao atualizar dados: ${error.message}`);
        }
    }

    // Deletar dados
    async delete(dataId) {
        try {
            await deleteDoc(doc(db, this.collection, dataId));
            return true;
        } catch (error) {
            throw new Error(`Erro ao deletar dados: ${error.message}`);
        }
    }

    // Buscar atividades pendentes/atrasadas
    async findOverdueActivities(userId) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const q = query(
                collection(db, this.collection),
                where('userId', '==', userId),
                where('data', '<', today),
                where('status', '!=', 'concluido'),
                orderBy('status'),
                orderBy('data', 'asc')
            );
            
            const querySnapshot = await getDocs(q);
            const dataList = [];
            
            querySnapshot.forEach((doc) => {
                dataList.push(AgricultureData.fromFirestore(doc.id, doc.data()));
            });
            
            return dataList;
        } catch (error) {
            throw new Error(`Erro ao buscar atividades pendentes: ${error.message}`);
        }
    }

    // Buscar atividades de hoje
    async findTodayActivities(userId) {
        try {
            const today = new Date();
            const startOfDay = new Date(today);
            startOfDay.setHours(0, 0, 0, 0);
            
            const endOfDay = new Date(today);
            endOfDay.setHours(23, 59, 59, 999);
            
            const q = query(
                collection(db, this.collection),
                where('userId', '==', userId),
                where('data', '>=', startOfDay),
                where('data', '<=', endOfDay),
                orderBy('data', 'asc')
            );
            
            const querySnapshot = await getDocs(q);
            const dataList = [];
            
            querySnapshot.forEach((doc) => {
                dataList.push(AgricultureData.fromFirestore(doc.id, doc.data()));
            });
            
            return dataList;
        } catch (error) {
            throw new Error(`Erro ao buscar atividades de hoje: ${error.message}`);
        }
    }

    // Estatísticas por cultura
    async getStatisticsByCulture(userId) {
        try {
            const allData = await this.findByUserId(userId, 1000);
            const stats = {};
            
            allData.forEach(data => {
                if (!stats[data.cultura]) {
                    stats[data.cultura] = {
                        totalArea: 0,
                        totalCustos: 0,
                        atividades: 0,
                        tipos: {}
                    };
                }
                
                stats[data.cultura].totalArea += data.area;
                stats[data.cultura].totalCustos += data.custos;
                stats[data.cultura].atividades += 1;
                
                if (!stats[data.cultura].tipos[data.tipo]) {
                    stats[data.cultura].tipos[data.tipo] = 0;
                }
                stats[data.cultura].tipos[data.tipo] += 1;
            });
            
            return stats;
        } catch (error) {
            throw new Error(`Erro ao gerar estatísticas: ${error.message}`);
        }
    }
}