import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';


/**
 * Serviço de geração de PDFs
 */

// Configurações padrão
const PAGE_WIDTH = 210; // mm (A4)
const PAGE_HEIGHT = 297; // mm (A4)
const MARGIN = 20;

/**
 * Utilitário: Formatar data
 */
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    // Se for string ISO (YYYY-MM-DD), converter para Date
    if (typeof dateString === 'string') {
        const [year, month, day] = dateString.split('-');
        if (year && month && day) {
            return `${day}/${month}/${year}`;
        }
    }
    
    // Se for objeto Date ou timestamp
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('pt-BR');
    }
    
    return 'N/A';
};

/**
 * Gerar PDF do Perfil do Usuário
 */
export const generateProfilePDF = async (profileData) => {
    const doc = new jsPDF();
    
    // Cabeçalho
    doc.setFillColor(166, 189, 140);
    doc.rect(0, 0, PAGE_WIDTH, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('🌾 IAagro', MARGIN, 20);
    
    doc.setFontSize(14);
    doc.text('Perfil do Usuário', MARGIN, 32);
    
    // Dados do usuário
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    let y = 55;
    
    doc.text(`Nome: ${profileData.nomeCompleto || 'N/A'}`, MARGIN, y);
    y += 10;
    doc.text(`Email: ${profileData.email || 'N/A'}`, MARGIN, y);
    y += 10;
    doc.text(`Telefone: ${profileData.telefone || 'N/A'}`, MARGIN, y);
    y += 10;
    doc.text(`Profissão: ${profileData.profissao || 'N/A'}`, MARGIN, y);
    y += 10;
    doc.text(`Experiência: ${profileData.experienciaAgro || 'N/A'}`, MARGIN, y);
    y += 15;
    
    // Endereço
    doc.setFontSize(14);
    doc.text('Endereço', MARGIN, y);
    y += 10;
    
    doc.setFontSize(12);
    doc.text(`${profileData.endereco || 'N/A'}, ${profileData.cidade || 'N/A'} - ${profileData.estado || 'N/A'}`, MARGIN, y);
    y += 8;
    doc.text(`CEP: ${profileData.cep || 'N/A'}`, MARGIN, y);
    
    // Rodapé
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, MARGIN, PAGE_HEIGHT - 15);
    
    // Salvar
    doc.save(`iagro_perfil_${profileData.nomeCompleto || 'usuario'}.pdf`);
    
    return { success: true, message: 'PDF gerado com sucesso!' };
};

/**
 * Gerar PDF de Tarefas
 */
export const generateTasksPDF = async (tasks, userName) => {
    const doc = new jsPDF();
    
    // Cabeçalho
    doc.setFillColor(166, 189, 140);
    doc.rect(0, 0, PAGE_WIDTH, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('IAagro', MARGIN, 20);
    
    doc.setFontSize(14);
    doc.text('Lista de Tarefas', MARGIN, 32);
    
    // Info do usuário
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Usuário: ${userName}`, MARGIN, 50);
    doc.text(`Total de tarefas: ${tasks.length}`, MARGIN, 58);
    
    // Tabela de tarefas
    const tableData = tasks.map(task => [
        task.titulo || 'Sem título',
        formatDate(task.dataLimite),
        (task.prioridade || 'media').toUpperCase(),
        task.concluida ? 'Sim' : 'Não'
    ]);
    
    autoTable(doc, {
        head: [['Tarefa', 'Data Limite', 'Prioridade', 'Concluída']],
        body: tableData,
        startY: 70,
        theme: 'grid',
        headStyles: { 
            fillColor: [166, 189, 140],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
        },
        styles: { 
            fontSize: 10,
            cellPadding: 5
        },
        columnStyles: {
            0: { cellWidth: 70 },
            1: { cellWidth: 35 },
            2: { cellWidth: 35 },
            3: { cellWidth: 30 }
        }
    });
    
    // Rodapé
    const finalY = doc.lastAutoTable.finalY || 70;
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, MARGIN, finalY + 15);
    
    // Salvar
    doc.save(`iagro_tarefas_${new Date().toISOString().split('T')[0]}.pdf`);
    
    return { success: true, message: 'PDF de tarefas gerado com sucesso!' };
};

/**
 * Gerar PDF de Histórico de Produtividade
 */
export const generateProductivityPDF = async (historyData, userName) => {
    const doc = new jsPDF();
    
    // Cabeçalho
    doc.setFillColor(166, 189, 140);
    doc.rect(0, 0, PAGE_WIDTH, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('IAagro', MARGIN, 20);
    
    doc.setFontSize(14);
    doc.text('Histórico de Produtividade', MARGIN, 32);
    
    // Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Produtor: ${userName}`, MARGIN, 50);
    doc.text(`Total de registros: ${historyData.length}`, MARGIN, 58);
    
    // Tabela
    const tableData = historyData.map(item => [
        formatDate(item.data || item.criadoEm),
        item.tipo || 'N/A',
        item.cultura || 'N/A',
        item.descricao || 'N/A'
    ]);
    
    autoTable(doc, {
        head: [['Data', 'Tipo', 'Cultura', 'Descrição']],
        body: tableData,
        startY: 70,
        theme: 'striped',
        headStyles: { 
            fillColor: [166, 189, 140],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
        },
        styles: { fontSize: 9 }
    });
    
    // Rodapé
    const finalY = doc.lastAutoTable.finalY || 70;
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, MARGIN, finalY + 15);
    
    doc.save(`iagro_produtividade_${new Date().toISOString().split('T')[0]}.pdf`);
    
    return { success: true, message: 'PDF de produtividade gerado!' };
};

/**
 * Gerar PDF Completo (Relatório Geral)
 */
export const generateFullReportPDF = async (userData) => {
    const doc = new jsPDF();
    let currentY = 20;
    
    // Cabeçalho
    doc.setFillColor(166, 189, 140);
    doc.rect(0, 0, PAGE_WIDTH, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('IAgro', MARGIN, 20);
    
    doc.setFontSize(14);
    doc.text('Relatório Completo', MARGIN, 32);
    
    currentY = 55;
    
    // Seção 1: Perfil
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text('Perfil do Usuário', MARGIN, currentY);
    currentY += 10;
    
    doc.setFontSize(11);
    doc.text(`Nome: ${userData.profile.nomeCompleto || 'N/A'}`, MARGIN + 5, currentY);
    currentY += 7;
    doc.text(`Profissão: ${userData.profile.profissao || 'N/A'}`, MARGIN + 5, currentY);
    currentY += 7;
    doc.text(`Propriedade: ${userData.profile.propriedadeRural || 'N/A'}`, MARGIN + 5, currentY);
    currentY += 15;
    
    // Seção 2: Estatísticas
    doc.setFontSize(16);
    doc.text('Estatísticas', MARGIN, currentY);
    currentY += 10;
    
    doc.setFontSize(11);
    doc.text(`Total de Tarefas: ${userData.tasks.total}`, MARGIN + 5, currentY);
    currentY += 7;
    doc.text(`Tarefas Concluídas: ${userData.tasks.completed}`, MARGIN + 5, currentY);
    currentY += 7;
    doc.text(`Tarefas Pendentes: ${userData.tasks.pending}`, MARGIN + 5, currentY);
    currentY += 7;
    doc.text(`Registros de Produtividade: ${userData.productivity.length}`, MARGIN + 5, currentY);
    currentY += 15;
    
    // Nova página se necessário
    if (currentY > 240) {
        doc.addPage();
        currentY = 20;
    }
    
    // Seção 3: Tarefas Recentes (tabela)
    doc.setFontSize(16);
    doc.text('Tarefas Recentes', MARGIN, currentY);
    currentY += 10;
    
    const recentTasks = userData.tasks.list.slice(0, 5);
    const taskTableData = recentTasks.map(task => [
        task.titulo.substring(0, 30),
        formatDate(task.dataLimite),
        task.concluida ? 'Sim' : 'Não'
    ]);
    
    autoTable(doc, {
        head: [['Tarefa', 'Vencimento', 'Status']],
        body: taskTableData,
        startY: currentY,
        theme: 'grid',
        headStyles: { fillColor: [166, 189, 140] },
        styles: { fontSize: 9 }
    });
    
    // Rodapé
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(128, 128, 128);
        doc.text(
            `Página ${i} de ${pageCount} - Gerado em: ${new Date().toLocaleDateString('pt-BR')}`,
            MARGIN,
            PAGE_HEIGHT - 15
        );
    }
    
    doc.save(`iagro_relatorio_completo_${new Date().toISOString().split('T')[0]}.pdf`);
    
    return { success: true, message: 'Relatório completo gerado!' };
};

/**
 * Capturar elemento HTML e gerar PDF (para gráficos)
 */
export const captureElementAsPDF = async (elementId, fileName) => {
    try {
        // Implementação futura com html2canvas
        return { success: false, error: 'Captura de tela não implementada ainda' };
    } catch (error) {
        console.error('Erro ao capturar elemento:', error);
        return { success: false, error: error.message };
    }
};