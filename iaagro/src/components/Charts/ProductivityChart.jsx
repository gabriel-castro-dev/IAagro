import React, { useState, useEffect } from 'react';
import {
    ComposedChart,
    Line,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { processProductivityData } from '../../services/chartDataService';
import styles from './Charts.module.css';

const ProductivityChart = ({ historicoData }) => {
    const [chartData, setChartData] = useState([]);
    const [isEmpty, setIsEmpty] = useState(true);

    useEffect(() => {
        if (historicoData && historicoData.length > 0) {
            const processed = processProductivityData(historicoData);
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
                    <h3>📈 Produtividade e Custos Mensais</h3>
                    <p>Análise comparativa de rendimento e investimentos</p>
                </div>
                <div className={styles.emptyChart}>
                    <p>📊 Nenhum dado disponível</p>
                    <span>Adicione dados com rendimento e custos em "Meus Dados"</span>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.chartContainer}>
            <div className={styles.chartHeader}>
                <h3>📈 Produtividade e Custos Mensais</h3>
                <p>Últimos 6 meses - Rendimento (kg/ha) vs Custos (R$)</p>
            </div>
            
            <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color, #dee2e6)" />
                    <XAxis 
                        dataKey="mes" 
                        stroke="var(--text-secondary, #6c757d)"
                        style={{ fontSize: '0.85rem' }}
                    />
                    <YAxis 
                        yAxisId="left"
                        stroke="var(--text-secondary, #6c757d)"
                        style={{ fontSize: '0.85rem' }}
                        label={{ value: 'Rendimento (kg/ha)', angle: -90, position: 'insideLeft' }}
                    />
                    <YAxis 
                        yAxisId="right"
                        orientation="right"
                        stroke="var(--text-secondary, #6c757d)"
                        style={{ fontSize: '0.85rem' }}
                        label={{ value: 'Custo (R$)', angle: 90, position: 'insideRight' }}
                    />
                    <Tooltip 
                        contentStyle={{
                            backgroundColor: 'var(--bg-secondary, #ffffff)',
                            border: '1px solid var(--border-color, #dee2e6)',
                            borderRadius: '8px',
                            padding: '10px'
                        }}
                        formatter={(value, name) => {
                            if (name === 'rendimento') return [`${value} kg/ha`, 'Rendimento'];
                            if (name === 'custo') return [`R$ ${value.toLocaleString('pt-BR')}`, 'Custo'];
                            return [value, name];
                        }}
                    />
                    <Legend 
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="line"
                    />
                    <Bar 
                        yAxisId="right"
                        dataKey="custo" 
                        fill="var(--accent-color, #a6bd8c)"
                        name="Custo (R$)"
                        radius={[8, 8, 0, 0]}
                    />
                    <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="rendimento" 
                        stroke="#f59e0b"
                        strokeWidth={3}
                        name="Rendimento (kg/ha)"
                        dot={{ fill: '#f59e0b', r: 5 }}
                        activeDot={{ r: 7 }}
                    />
                </ComposedChart>
            </ResponsiveContainer>

            <div className={styles.chartInsights}>
                <div className={styles.insight}>
                    <span className={styles.insightIcon}>🌾</span>
                    <div>
                        <strong>Rendimento Médio</strong>
                        <p>{chartData.length > 0 ? 
                            Math.round(chartData.reduce((acc, item) => acc + item.rendimento, 0) / chartData.length) 
                            : 0} kg/ha
                        </p>
                    </div>
                </div>
                <div className={styles.insight}>
                    <span className={styles.insightIcon}>💰</span>
                    <div>
                        <strong>Custo Total</strong>
                        <p>R$ {chartData.reduce((acc, item) => acc + item.custo, 0).toLocaleString('pt-BR')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductivityChart;