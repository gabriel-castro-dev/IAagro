import {
    generateProfilePDF,
    generateTasksPDF,
    generateProductivityPDF,
    generateFullReportPDF,
    captureElementAsPDF
} from '../services/pdfService';

/**
 * Controller para geração de PDFs
 */
export class PDFController {
    /**
     * Exportar perfil para PDF
     */
    async exportProfile(profileData) {
        try {
            console.log('📄 Gerando PDF do perfil...');
            const result = await generateProfilePDF(profileData);
            return result;
        } catch (error) {
            console.error('Erro ao gerar PDF do perfil:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Exportar tarefas para PDF
     */
    async exportTasks(tasks, userName) {
        try {
            console.log('📄 Gerando PDF de tarefas...');
            
            if (!tasks || tasks.length === 0) {
                return { success: false, error: 'Nenhuma tarefa para exportar' };
            }
            
            const result = await generateTasksPDF(tasks, userName);
            return result;
        } catch (error) {
            console.error('Erro ao gerar PDF de tarefas:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Exportar histórico de produtividade
     */
    async exportProductivity(historyData, userName) {
        try {
            console.log('📄 Gerando PDF de produtividade...');
            
            if (!historyData || historyData.length === 0) {
                return { success: false, error: 'Nenhum registro de produtividade' };
            }
            
            const result = await generateProductivityPDF(historyData, userName);
            return result;
        } catch (error) {
            console.error('Erro ao gerar PDF de produtividade:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Exportar relatório completo
     */
    async exportFullReport(userData) {
        try {
            console.log('📄 Gerando relatório completo...');
            const result = await generateFullReportPDF(userData);
            return result;
        } catch (error) {
            console.error('Erro ao gerar relatório completo:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Capturar gráfico como PDF
     */
    async exportChart(elementId, fileName) {
        try {
            console.log('📄 Capturando gráfico...');
            const result = await captureElementAsPDF(elementId, fileName);
            return result;
        } catch (error) {
            console.error('Erro ao capturar gráfico:', error);
            return { success: false, error: error.message };
        }
    }
}