import React, { useState, useEffect } from 'react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend
} from 'recharts';
import { processActivityDistributionData } from '../../services/chartDataService';
import styles from './Charts.module.css';

const ActivityDistributionChart = ({ historicoData }) => {
    const [chartData, setChartData] = useState([]);
    const [isEmpty, setIsEmpty] = useState(true);

    const COLORS = [
        'var(--accent-color, #a6bd8c)',
        '#f59e0b',
        '#3b82f6',
        '#ef4444',
        '#8b5cf6',
        '#ec4899',
        '#14b8a6',
        '#f97316'
    ];

    useEffect(() => {
        if (historicoData && historicoData.length > 0) {
            const processed = processActivityDistributionData(historicoData);
            
            // Calcular percentuais
            const total = processed.reduce((sum, item) => sum + item.quantidade, 0);
            const withPercentage = processed.map(item => ({
                ...item,
                percentual: ((item.quantidade / total) * 100).toFixed(1)
            }));
            
            setChartData(withPercentage);
            setIsEmpty(withPercentage.length === 0);
        } else {
            setChartData([]);
            setIsEmpty(true);
        }
    }, [historicoData]);

    if (isEmpty) {
        return (
            <div className={styles.chartContainer}>
                <div className={styles.chartHeader}>
                    <h3>🎯 Distribuição de Atividades</h3>
                    <p>Proporção dos tipos de atividades realizadas</p>
                </div>
                <div className={styles.emptyChart}>
                    <p>📊 Nenhuma atividade registrada</p>
                    <span>Adicione atividades em "Meus Dados"</span>
                </div>
            </div>
        );
    }

    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text 
                x={x} 
                y={y} 
                fill="white" 
                textAnchor={x > cx ? 'start' : 'end'} 
                dominantBaseline="central"
                style={{ fontSize: '0.85rem', fontWeight: 'bold' }}
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <div className={styles.chartContainer}>
            <div className={styles.chartHeader}>
                <h3>🎯 Distribuição de Atividades</h3>
                <p>Total de atividades: {chartData.reduce((sum, item) => sum + item.quantidade, 0)}</p>
            </div>
            
            <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomLabel}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="quantidade"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip 
                        contentStyle={{
                            backgroundColor: 'var(--bg-secondary, #ffffff)',
                            border: '1px solid var(--border-color, #dee2e6)',
                            borderRadius: '8px',
                            padding: '10px'
                        }}
                        formatter={(value, name, props) => [
                            `${value} (${props.payload.percentual}%)`,
                            props.payload.tipo
                        ]}
                    />
                    <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        iconType="circle"
                    />
                </PieChart>
            </ResponsiveContainer>

            <div className={styles.activityList}>
                {chartData.map((item, index) => (
                    <div key={index} className={styles.activityItem}>
                        <span 
                            className={styles.activityColor}
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></span>
                        <span className={styles.activityType}>{item.tipo}</span>
                        <span className={styles.activityCount}>
                            {item.quantidade} ({item.percentual}%)
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActivityDistributionChart;