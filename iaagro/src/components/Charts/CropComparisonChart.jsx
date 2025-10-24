import React, { useState, useEffect } from 'react';
import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    Legend,
    ResponsiveContainer,
    Tooltip
} from 'recharts';
import { processCropComparisonData } from '../../services/chartDataService';
import styles from './Charts.module.css';

const CropComparisonChart = ({ historicoData }) => {
    const [chartData, setChartData] = useState([]);
    const [isEmpty, setIsEmpty] = useState(true);

    useEffect(() => {
        if (historicoData && historicoData.length > 0) {
            const processed = processCropComparisonData(historicoData);
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
                    <h3>🌾 Comparação entre Culturas</h3>
                    <p>Análise de desempenho por tipo de cultura</p>
                </div>
                <div className={styles.emptyChart}>
                    <p>📊 Nenhum dado de culturas disponível</p>
                    <span>Adicione culturas diferentes em "Meus Dados"</span>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.chartContainer}>
            <div className={styles.chartHeader}>
                <h3>🌾 Comparação entre Culturas</h3>
                <p>{chartData.length} culturas diferentes analisadas</p>
            </div>
            
            <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={chartData}>
                    <PolarGrid stroke="var(--border-color, #dee2e6)" />
                    <PolarAngleAxis 
                        dataKey="cultura" 
                        stroke="var(--text-secondary, #6c757d)"
                        style={{ fontSize: '0.85rem' }}
                    />
                    <PolarRadiusAxis 
                        stroke="var(--text-secondary, #6c757d)"
                        style={{ fontSize: '0.75rem' }}
                    />
                    <Radar 
                        name="Rendimento Médio (kg/ha)" 
                        dataKey="rendimentoMedio" 
                        stroke="var(--accent-color, #a6bd8c)"
                        fill="var(--accent-color, #a6bd8c)"
                        fillOpacity={0.6}
                    />
                    <Tooltip 
                        contentStyle={{
                            backgroundColor: 'var(--bg-secondary, #ffffff)',
                            border: '1px solid var(--border-color, #dee2e6)',
                            borderRadius: '8px',
                            padding: '10px'
                        }}
                        formatter={(value, name) => {
                            if (name === 'Rendimento Médio (kg/ha)') {
                                return [`${value} kg/ha`, 'Rendimento'];
                            }
                            return [value, name];
                        }}
                    />
                    <Legend />
                </RadarChart>
            </ResponsiveContainer>

            <div className={styles.cropComparisonTable}>
                <table>
                    <thead>
                        <tr>
                            <th>Cultura</th>
                            <th>Rendimento Médio</th>
                            <th>Custo Total</th>
                            <th>Registros</th>
                        </tr>
                    </thead>
                    <tbody>
                        {chartData.map((crop, index) => (
                            <tr key={index}>
                                <td><strong>{crop.cultura}</strong></td>
                                <td>{crop.rendimentoMedio} kg/ha</td>
                                <td>R$ {crop.custoTotal.toLocaleString('pt-BR')}</td>
                                <td>{crop.registros}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CropComparisonChart;