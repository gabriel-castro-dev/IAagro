/**
 * Serviço para gerenciamento de tarefas/lembretes
 * Integrado com Firebase Firestore
 */
import { 
    collection, 
    addDoc, 
    getDocs, 
    updateDoc, 
    deleteDoc, 
    doc, 
    query, 
    where, 
    orderBy,
    serverTimestamp,
    Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase/firebase';

// Coleção do Firestore
const TASKS_COLLECTION = 'userTasks';

/**
 * Adicionar nova tarefa
 */
export const addTask = async (userId, taskData) => {
    try {
        if (!userId) {
            throw new Error('ID do usuário não fornecido');
        }

        if (!taskData.titulo || !taskData.dataLimite) {
            throw new Error('Título e data limite são obrigatórios');
        }

        const taskToSave = {
            userId,
            titulo: taskData.titulo,
            descricao: taskData.descricao || '',
            categoria: taskData.categoria || 'Geral',
            dataLimite: taskData.dataLimite, // formato: 'YYYY-MM-DD'
            prioridade: taskData.prioridade || 'media',
            concluida: false,
            criadaEm: serverTimestamp(),
            atualizadaEm: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, TASKS_COLLECTION), taskToSave);
        
        console.log('✅ Tarefa adicionada:', docRef.id);
        
        return {
            success: true,
            id: docRef.id,
            data: taskToSave
        };

    } catch (error) {
        console.error('❌ Erro ao adicionar tarefa:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Buscar todas as tarefas do usuário
 */
export const getUserTasks = async (userId, filters = {}) => {
    try {
        if (!userId) {
            throw new Error('ID do usuário não fornecido');
        }

        let tasksQuery = query(
            collection(db, TASKS_COLLECTION),
            where('userId', '==', userId),
            orderBy('dataLimite', 'asc')
        );

        // Aplicar filtros se fornecidos
        if (filters.concluida !== undefined) {
            tasksQuery = query(
                collection(db, TASKS_COLLECTION),
                where('userId', '==', userId),
                where('concluida', '==', filters.concluida),
                orderBy('dataLimite', 'asc')
            );
        }

        const snapshot = await getDocs(tasksQuery);
        
        const tasks = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        console.log(`✅ ${tasks.length} tarefas carregadas`);
        
        return {
            success: true,
            data: tasks
        };

    } catch (error) {
        console.error('❌ Erro ao buscar tarefas:', error);
        return {
            success: false,
            error: error.message,
            data: []
        };
    }
};

/**
 * Marcar tarefa como concluída/não concluída
 */
export const toggleTaskCompletion = async (taskId, completed) => {
    try {
        if (!taskId) {
            throw new Error('ID da tarefa não fornecido');
        }

        const taskRef = doc(db, TASKS_COLLECTION, taskId);
        
        await updateDoc(taskRef, {
            concluida: completed,
            atualizadaEm: serverTimestamp()
        });

        console.log(`✅ Tarefa ${completed ? 'concluída' : 'reaberta'}:`, taskId);
        
        return {
            success: true,
            id: taskId,
            completed
        };

    } catch (error) {
        console.error('❌ Erro ao atualizar tarefa:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Deletar tarefa
 */
export const deleteTask = async (taskId) => {
    try {
        if (!taskId) {
            throw new Error('ID da tarefa não fornecido');
        }

        const taskRef = doc(db, TASKS_COLLECTION, taskId);
        await deleteDoc(taskRef);

        console.log('✅ Tarefa deletada:', taskId);
        
        return {
            success: true,
            id: taskId
        };

    } catch (error) {
        console.error('❌ Erro ao deletar tarefa:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Atualizar tarefa
 */
export const updateTask = async (taskId, updates) => {
    try {
        if (!taskId) {
            throw new Error('ID da tarefa não fornecido');
        }

        const taskRef = doc(db, TASKS_COLLECTION, taskId);
        
        const updatedData = {
            ...updates,
            atualizadaEm: serverTimestamp()
        };

        await updateDoc(taskRef, updatedData);

        console.log('✅ Tarefa atualizada:', taskId);
        
        return {
            success: true,
            id: taskId,
            data: updatedData
        };

    } catch (error) {
        console.error('❌ Erro ao atualizar tarefa:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Verificar tarefas pendentes próximas do vencimento
 */
export const getUpcomingTasks = async (userId, daysAhead = 7) => {
    try {
        if (!userId) {
            throw new Error('ID do usuário não fornecido');
        }

        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + daysAhead);

        const todayStr = today.toISOString().split('T')[0];
        const futureDateStr = futureDate.toISOString().split('T')[0];

        const result = await getUserTasks(userId, { concluida: false });
        
        if (!result.success) {
            return result;
        }

        // Filtrar tarefas próximas do vencimento
        const upcomingTasks = result.data.filter(task => {
            return task.dataLimite >= todayStr && task.dataLimite <= futureDateStr;
        });

        console.log(`✅ ${upcomingTasks.length} tarefas próximas do vencimento`);
        
        return {
            success: true,
            data: upcomingTasks
        };

    } catch (error) {
        console.error('❌ Erro ao buscar tarefas próximas:', error);
        return {
            success: false,
            error: error.message,
            data: []
        };
    }
};

/**
 * Obter estatísticas das tarefas
 */
export const getTasksStatistics = async (userId) => {
    try {
        const result = await getUserTasks(userId);
        
        if (!result.success) {
            return result;
        }

        const tasks = result.data;
        const today = new Date().toISOString().split('T')[0];

        const stats = {
            total: tasks.length,
            concluidas: tasks.filter(t => t.concluida).length,
            pendentes: tasks.filter(t => !t.concluida).length,
            atrasadas: tasks.filter(t => !t.concluida && t.dataLimite < today).length,
            hoje: tasks.filter(t => !t.concluida && t.dataLimite === today).length,
            porCategoria: {}
        };

        // Contar por categoria
        tasks.forEach(task => {
            const cat = task.categoria || 'Geral';
            stats.porCategoria[cat] = (stats.porCategoria[cat] || 0) + 1;
        });

        return {
            success: true,
            data: stats
        };

    } catch (error) {
        console.error('❌ Erro ao calcular estatísticas:', error);
        return {
            success: false,
            error: error.message
        };
    }
};