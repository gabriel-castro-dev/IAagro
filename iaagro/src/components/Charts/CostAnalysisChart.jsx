import React, { useState, useEffect } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { processCostAnalysisData } from '../../services/chartDataService';
import styles from './Charts.module.css';

const CostAnalysisChart = ({ historicoData }) => {
    const [chartData, setChartData] = useState([]);
    const [isEmpty, setIsEmpty] = useState(true);

    const COLORS = [
        'var(--accent-color, #a6bd8c)',
        '#f59e0b',
        '#ef4444',
        '#3b82f6',
        '#8b5cf6',
        '#ec4899'
    ];

    useEffect(() => {
        if (historicoData && historicoData.length > 0) {
            const processed = processCostAnalysisData(historicoData);
            setChartData(processed);
            setIsEmpty(processed.length === 0);
        } else {
            setChartData([]);
            setIsEmpty(true);
        }
    }, [historicoData]);

    if (isEmpty) {
        return (
            <div className={styles.chartContainer}>
                <div className={styles.chartHeader}>
                    <h3>💰 Análise de Custos por Categoria</h3>
                    <p>Distribuição de investimentos</p>
                </div>
                <div className={styles.emptyChart}>
                    <p>📊 Nenhum dado de custos disponível</p>
                    <span>Adicione custos operacionais em seus registros</span>
                </div>
            </div>
        );
    }

    const totalCost = chartData.reduce((sum, item) => sum + item.valor, 0);

    return (
        <div className={styles.chartContainer}>
            <div className={styles.chartHeader}>
                <h3>💰 Análise de Custos por Categoria</h3>
                <p>Total investido: R$ {totalCost.toLocaleString('pt-BR')}</p>
            </div>
            
            <ResponsiveContainer width="100%" height={350}>
                <BarChart 
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color, #dee2e6)" />
                    <XAxis 
                        type="number"
                        stroke="var(--text-secondary, #6c757d)"
                        style={{ fontSize: '0.85rem' }}
                    />
                    <YAxis 
                        type="category"
                        dataKey="categoria" 
                        stroke="var(--text-secondary, #6c757d)"
                        style={{ fontSize: '0.85rem' }}
                    />
                    <Tooltip 
                        contentStyle={{
                            backgroundColor: 'var(--bg-secondary, #ffffff)',
                            border: '1px solid var(--border-color, #dee2e6)',
                            borderRadius: '8px',
                            padding: '10px'
                        }}
                        formatter={(value) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Custo']}
                    />
                    <Legend />
                    <Bar 
                        dataKey="valor" 
                        name="Custo (R$)"
                        radius={[0, 8, 8, 0]}
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            <div className={styles.chartInsights}>
                <div className={styles.insight}>
                    <span className={styles.insightIcon}>📊</span>
                    <div>
                        <strong>Maior Investimento</strong>
                        <p>{chartData[0]?.categoria}: R$ {chartData[0]?.valor.toLocaleString('pt-BR')}</p>
                    </div>
                </div>
                <div className={styles.insight}>
                    <span className={styles.insightIcon}>📈</span>
                    <div>
                        <strong>Categorias</strong>
                        <p>{chartData.length} tipos de custos</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CostAnalysisChart;