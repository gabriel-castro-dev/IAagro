import { DataRepository } from '../repositories/DataRepository';
import { AgricultureData } from '../models/AgricultureData';

export class DataController {
    constructor() {
        this.dataRepository = new DataRepository();
    }

    // Criar nova atividade agronômica
    async createActivity(userId, activityData) {
        try {
            if (!userId) {
                throw new Error('ID do usuário é obrigatório');
            }

            // Criar instância do modelo
            const agricultureData = new AgricultureData(userId, activityData);
            
            // Validar dados
            const validation = agricultureData.validate();
            if (!validation.isValid) {
                return {
                    success: false,
                    error: validation.errors.join(', '),
                    validationErrors: validation.errors
                };
            }

            // Salvar no repositório
            const savedData = await this.dataRepository.save(agricultureData);

            return {
                success: true,
                data: savedData,
                message: 'Atividade criada com sucesso'
            };
        } catch (error) {
            console.error('Erro no DataController.createActivity:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Obter todas as atividades de um usuário
    async getUserActivities(userId, limit = 50) {
        try {
            if (!userId) {
                throw new Error('ID do usuário é obrigatório');
            }

            const activities = await this.dataRepository.findByUserId(userId, limit);

            return {
                success: true,
                data: activities,
                count: activities.length
            };
        } catch (error) {
            console.error('Erro no DataController.getUserActivities:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Atualizar atividade
    async updateActivity(activityId, updateData) {
        try {
            if (!activityId) {
                throw new Error('ID da atividade é obrigatório');
            }

            // Buscar atividade existente
            const existingActivity = await this.dataRepository.findById(activityId);
            if (!existingActivity) {
                return {
                    success: false,
                    error: 'Atividade não encontrada'
                };
            }

            // Atualizar dados
            existingActivity.updateData(updateData);
            
            // Validar
            const validation = existingActivity.validate();
            if (!validation.isValid) {
                return {
                    success: false,
                    error: validation.errors.join(', '),
                    validationErrors: validation.errors
                };
            }

            // Salvar
            const updatedActivity = await this.dataRepository.save(existingActivity);

            return {
                success: true,
                data: updatedActivity,
                message: 'Atividade atualizada com sucesso'
            };
        } catch (error) {
            console.error('Erro no DataController.updateActivity:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Marcar atividade como concluída
    async completeActivity(activityId) {
        try {
            const activity = await this.dataRepository.findById(activityId);
            if (!activity) {
                return {
                    success: false,
                    error: 'Atividade não encontrada'
                };
            }

            activity.markAsCompleted();
            const updatedActivity = await this.dataRepository.save(activity);

            return {
                success: true,
                data: updatedActivity,
                message: 'Atividade marcada como concluída'
            };
        } catch (error) {
            console.error('Erro no DataController.completeActivity:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Obter atividades por tipo
    async getActivitiesByType(userId, tipo) {
        try {
            const activities = await this.dataRepository.findByUserAndType(userId, tipo);

            return {
                success: true,
                data: activities,
                count: activities.length
            };
        } catch (error) {
            console.error('Erro no DataController.getActivitiesByType:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Obter atividades por período
    async getActivitiesByDateRange(userId, startDate, endDate) {
        try {
            const activities = await this.dataRepository.findByDateRange(userId, startDate, endDate);

            return {
                success: true,
                data: activities,
                count: activities.length
            };
        } catch (error) {
            console.error('Erro no DataController.getActivitiesByDateRange:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Obter dashboard resumo
    async getDashboardSummary(userId) {
        try {
            // Buscar todas as atividades
            const allActivities = await this.dataRepository.findByUserId(userId, 1000);
            
            // Atividades de hoje
            const todayActivities = await this.dataRepository.findTodayActivities(userId);
            
            // Atividades atrasadas
            const overdueActivities = await this.dataRepository.findOverdueActivities(userId);
            
            // Estatísticas por cultura
            const cultureStats = await this.dataRepository.getStatisticsByCulture(userId);

            // Resumo geral
            const summary = {
                totalActivities: allActivities.length,
                todayActivities: todayActivities.length,
                overdueActivities: overdueActivities.length,
                completedActivities: allActivities.filter(a => a.status === 'concluido').length,
                totalCosts: allActivities.reduce((sum, a) => sum + a.custos, 0),
                totalArea: Object.values(cultureStats).reduce((sum, stat) => sum + stat.totalArea, 0),
                cultureStats,
                recentActivities: allActivities.slice(0, 5),
                upcomingActivities: allActivities
                    .filter(a => a.getDaysUntilDue() > 0 && a.getDaysUntilDue() <= 7)
                    .sort((a, b) => a.getDaysUntilDue() - b.getDaysUntilDue())
                    .slice(0, 5)
            };

            return {
                success: true,
                data: summary
            };
        } catch (error) {
            console.error('Erro no DataController.getDashboardSummary:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Deletar atividade
    async deleteActivity(activityId) {
        try {
            if (!activityId) {
                throw new Error('ID da atividade é obrigatório');
            }

            const deleted = await this.dataRepository.delete(activityId);

            return {
                success: deleted,
                message: deleted ? 'Atividade deletada com sucesso' : 'Erro ao deletar atividade'
            };
        } catch (error) {
            console.error('Erro no DataController.deleteActivity:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Gerar relatório mensal
    async getMonthlyReport(userId, year, month) {
        try {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0, 23, 59, 59);

            const activities = await this.dataRepository.findByDateRange(userId, startDate, endDate);

            const report = {
                period: `${month}/${year}`,
                totalActivities: activities.length,
                completedActivities: activities.filter(a => a.status === 'concluido').length,
                totalCosts: activities.reduce((sum, a) => sum + a.custos, 0),
                byType: {},
                byCulture: {},
                activities: activities
            };

            // Agrupar por tipo
            activities.forEach(activity => {
                if (!report.byType[activity.tipo]) {
                    report.byType[activity.tipo] = { count: 0, costs: 0, area: 0 };
                }
                report.byType[activity.tipo].count++;
                report.byType[activity.tipo].costs += activity.custos;
                report.byType[activity.tipo].area += activity.area;
            });

            // Agrupar por cultura
            activities.forEach(activity => {
                if (!report.byCulture[activity.cultura]) {
                    report.byCulture[activity.cultura] = { count: 0, costs: 0, area: 0 };
                }
                report.byCulture[activity.cultura].count++;
                report.byCulture[activity.cultura].costs += activity.custos;
                report.byCulture[activity.cultura].area += activity.area;
            });

            return {
                success: true,
                data: report
            };
        } catch (error) {
            console.error('Erro no DataController.getMonthlyReport:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Criar dados de exemplo para demonstração
    async createSampleData(userId) {
        try {
            const sampleActivities = AgricultureData.createSampleData(userId);
            const savedActivities = [];

            for (const activity of sampleActivities) {
                const saved = await this.dataRepository.save(activity);
                savedActivities.push(saved);
            }

            return {
                success: true,
                data: savedActivities,
                message: `${savedActivities.length} atividades de exemplo criadas`
            };
        } catch (error) {
            console.error('Erro no DataController.createSampleData:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}