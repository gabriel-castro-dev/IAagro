import React, { useState } from 'react';
import styles from './PDFExportButton.module.css';
import { PDFController } from '../../controllers/PDFController';

const PDFExportButton = ({ 
    type, 
    data, 
    userName, 
    label = '📥 Exportar PDF',
    className = '' 
}) => {
    const [loading, setLoading] = useState(false);
    const pdfController = new PDFController();

    const handleExport = async () => {
        setLoading(true);
        
        try {
            let result;
            
            switch (type) {
                case 'profile':
                    result = await pdfController.exportProfile(data);
                    break;
                case 'tasks':
                    result = await pdfController.exportTasks(data, userName);
                    break;
                case 'productivity':
                    result = await pdfController.exportProductivity(data, userName);
                    break;
                case 'full-report':
                    result = await pdfController.exportFullReport(data);
                    break;
                default:
                    throw new Error('Tipo de exportação inválido');
            }
            
            if (result.success) {
                alert('✅ ' + result.message);
            } else {
                alert('❌ ' + result.error);
            }
        } catch (error) {
            console.error('Erro ao exportar:', error);
            alert('❌ Erro ao gerar PDF: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button 
            onClick={handleExport}
            disabled={loading}
            className={`${styles.exportButton} ${className}`}
        >
            {loading ? '⏳ Gerando...' : label}
        </button>
    );
};

export default PDFExportButton;