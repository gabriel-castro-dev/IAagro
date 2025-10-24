/**
 * Controller para gerenciamento de tarefas
 */
import * as taskService from '../services/taskService';

export class TaskController {
    /**
     * Adicionar nova tarefa
     */
    async createTask(userId, taskData) {
        try {
            const result = await taskService.addTask(userId, taskData);
            return result;
        } catch (error) {
            console.error('Controller - Erro ao criar tarefa:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Buscar todas as tarefas do usuário
     */
    async getTasks(userId, filters = {}) {
        try {
            const result = await taskService.getUserTasks(userId, filters);
            return result;
        } catch (error) {
            console.error('Controller - Erro ao buscar tarefas:', error);
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }

    /**
     * Marcar tarefa como concluída/não concluída
     */
    async toggleTask(taskId, completed) {
        try {
            const result = await taskService.toggleTaskCompletion(taskId, completed);
            return result;
        } catch (error) {
            console.error('Controller - Erro ao atualizar tarefa:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Deletar tarefa
     */
    async removeTask(taskId) {
        try {
            const result = await taskService.deleteTask(taskId);
            return result;
        } catch (error) {
            console.error('Controller - Erro ao deletar tarefa:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Atualizar tarefa
     */
    async updateTask(taskId, updates) {
        try {
            const result = await taskService.updateTask(taskId, updates);
            return result;
        } catch (error) {
            console.error('Controller - Erro ao atualizar tarefa:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Obter estatísticas das tarefas
     */
    async getStatistics(userId) {
        try {
            const result = await taskService.getTasksStatistics(userId);
            return result;
        } catch (error) {
            console.error('Controller - Erro ao obter estatísticas:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Obter tarefas próximas do vencimento
     */
    async getUpcomingTasks(userId, daysAhead = 7) {
        try {
            const result = await taskService.getUpcomingTasks(userId, daysAhead);
            return result;
        } catch (error) {
            console.error('Controller - Erro ao buscar tarefas próximas:', error);
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }
}