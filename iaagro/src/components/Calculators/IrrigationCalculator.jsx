import React, { useState } from 'react';
import { FaTint, FaThermometerHalf, FaSeedling, FaExclamationTriangle, FaLightbulb } from 'react-icons/fa';
import { calcularIrrigacao, getRecomendacoesCultura } from '../../services/calculatorService';
import styles from './Calculators.module.css';

const IrrigationCalculator = () => {
    const [formData, setFormData] = useState({
        cultura: 'soja',
        area: '',
        temperatura: '',
        umidadeAr: '',
        estadioDesenvolvimento: 'vegetativo',
        tipoSolo: 'medio'
    });

    const [resultado, setResultado] = useState(null);
    const [recomendacoes, setRecomendacoes] = useState(null);
    const [erro, setErro] = useState('');

    const culturas = [
        { value: 'soja', label: 'Soja' },
        { value: 'milho', label: 'Milho' },
        { value: 'trigo', label: 'Trigo' },
        { value: 'feijao', label: 'Feijão' },
        { value: 'algodao', label: 'Algodão' },
        { value: 'cafe', label: 'Café' },
        { value: 'cana', label: 'Cana-de-açúcar' }
    ];

    const estadios = [
        { value: 'inicial', label: 'Inicial' },
        { value: 'vegetativo', label: 'Vegetativo' },
        { value: 'floracao', label: 'Floração' },
        { value: 'maturacao', label: 'Maturação' }
    ];

    const tiposSolo = [
        { value: 'arenoso', label: 'Arenoso (leve)' },
        { value: 'medio', label: 'Médio (franco)' },
        { value: 'argiloso', label: 'Argiloso (pesado)' }
    ];

    const handleCalculate = (e) => {
        e.preventDefault();
        setErro('');
        setResultado(null);

        const dados = {
            cultura: formData.cultura,
            area: parseFloat(formData.area),
            temperatura: parseFloat(formData.temperatura),
            umidadeAr: formData.umidadeAr ? parseFloat(formData.umidadeAr) : undefined,
            estadioDesenvolvimento: formData.estadioDesenvolvimento,
            tipoSolo: formData.tipoSolo
        };

        const result = calcularIrrigacao(dados);

        if (result.success) {
            setResultado(result.data);
            const rec = getRecomendacoesCultura(formData.cultura);
            setRecomendacoes(rec);
        } else {
            setErro(result.error);
        }
    };

    const handleReset = () => {
        setFormData({
            cultura: 'soja',
            area: '',
            temperatura: '',
            umidadeAr: '',
            estadioDesenvolvimento: 'vegetativo',
            tipoSolo: 'medio'
        });
        setResultado(null);
        setRecomendacoes(null);
        setErro('');
    };

    return (
        <div className={styles.calculator}>
            <div className={styles.calculatorHeader}>
                <h3><FaTint /> Calculadora de Irrigação</h3>
                <p>Calcule a necessidade de água para sua lavoura</p>
            </div>

            <form onSubmit={handleCalculate} className={styles.form}>
                <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                        <label>Cultura *</label>
                        <select
                            value={formData.cultura}
                            onChange={(e) => setFormData({...formData, cultura: e.target.value})}
                            required
                        >
                            {culturas.map(c => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Área (hectares) *</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.area}
                            onChange={(e) => setFormData({...formData, area: e.target.value})}
                            placeholder="Ex: 50"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Temperatura Média (°C) *</label>
                        <input
                            type="number"
                            step="0.1"
                            value={formData.temperatura}
                            onChange={(e) => setFormData({...formData, temperatura: e.target.value})}
                            placeholder="Ex: 28"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Umidade do Ar (%)</label>
                        <input
                            type="number"
                            step="1"
                            min="0"
                            max="100"
                            value={formData.umidadeAr}
                            onChange={(e) => setFormData({...formData, umidadeAr: e.target.value})}
                            placeholder="Ex: 65 (opcional)"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Estádio de Desenvolvimento *</label>
                        <select
                            value={formData.estadioDesenvolvimento}
                            onChange={(e) => setFormData({...formData, estadioDesenvolvimento: e.target.value})}
                            required
                        >
                            {estadios.map(e => (
                                <option key={e.value} value={e.value}>{e.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Tipo de Solo *</label>
                        <select
                            value={formData.tipoSolo}
                            onChange={(e) => setFormData({...formData, tipoSolo: e.target.value})}
                            required
                        >
                            {tiposSolo.map(s => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {erro && (
                    <div className={styles.error}>
                        ⚠️ {erro}
                    </div>
                )}

                <div className={styles.formActions}>
                    <button type="submit" className={styles.calculateBtn}>
                        <FaTint /> Calcular
                    </button>
                    <button type="button" onClick={handleReset} className={styles.resetBtn}>
                        Limpar
                    </button>
                </div>
            </form>

            {resultado && (
                <div className={styles.results}>
                    <h4>💧 Necessidades de Irrigação</h4>

                    <div className={styles.resultSection}>
                        <h5><FaTint /> Volume de Água Necessário</h5>
                        <div className={styles.resultGrid}>
                            <div className={styles.resultCard}>
                                <span className={styles.resultLabel}>Lâmina Diária</span>
                                <span className={styles.resultValue}>
                                    {resultado.laminaDiaria} mm/dia
                                </span>
                            </div>
                            <div className={styles.resultCard}>
                                <span className={styles.resultLabel}>Volume/ha/dia</span>
                                <span className={styles.resultValue}>
                                    {resultado.volumeHaDia} m³
                                </span>
                            </div>
                            <div className={styles.resultCard}>
                                <span className={styles.resultLabel}>Volume Total/dia</span>
                                <span className={styles.resultValue}>
                                    {resultado.volumeTotalDia.toLocaleString('pt-BR')} m³
                                </span>
                            </div>
                            <div className={styles.resultCard}>
                                <span className={styles.resultLabel}>Volume Mensal</span>
                                <span className={styles.resultValue}>
                                    {resultado.volumeMes.toLocaleString('pt-BR')} m³
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.resultSection}>
                        <h5><FaSeedling /> Manejo de Irrigação</h5>
                        <div className={styles.resultGrid}>
                            <div className={styles.resultCard}>
                                <span className={styles.resultLabel}>Frequência</span>
                                <span className={styles.resultValue}>
                                    A cada {resultado.frequenciaDias} dias
                                </span>
                            </div>
                            <div className={styles.resultCard}>
                                <span className={styles.resultLabel}>Lâmina por Vez</span>
                                <span className={styles.resultValue}>
                                    {resultado.laminaPorIrrigacao} mm
                                </span>
                            </div>
                            <div className={styles.resultCard}>
                                <span className={styles.resultLabel}>Coef. Cultura (Kc)</span>
                                <span className={styles.resultValue}>
                                    {resultado.kc}
                                </span>
                            </div>
                            <div className={styles.resultCard}>
                                <span className={styles.resultLabel}>ETo</span>
                                <span className={styles.resultValue}>
                                    {resultado.eto} mm/dia
                                </span>
                            </div>
                        </div>
                    </div>

                    {resultado.alertas && resultado.alertas.length > 0 && (
                        <div className={styles.alertsSection}>
                            <h5><FaExclamationTriangle /> Alertas</h5>
                            {resultado.alertas.map((alerta, index) => (
                                <div key={index} className={styles.alert}>
                                    {alerta}
                                </div>
                            ))}
                        </div>
                    )}

                    {resultado.recomendacoes && resultado.recomendacoes.length > 0 && (
                        <div className={styles.recommendationsSection}>
                            <h5><FaLightbulb /> Recomendações</h5>
                            {resultado.recomendacoes.map((rec, index) => (
                                <div key={index} className={styles.recommendation}>
                                    💡 {rec}
                                </div>
                            ))}
                        </div>
                    )}

                    {recomendacoes && (
                        <div className={styles.cultureInfo}>
                            <h5>📋 Informações da Cultura: {formData.cultura.charAt(0).toUpperCase() + formData.cultura.slice(1)}</h5>
                            <div className={styles.infoGrid}>
                                <div className={styles.infoItem}>
                                    <strong>Fase Crítica:</strong>
                                    <span>{recomendacoes.critico}</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <strong>Frequência Ideal:</strong>
                                    <span>{recomendacoes.frequencia}</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <strong>Lâmina Recomendada:</strong>
                                    <span>{recomendacoes.lamina}</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <strong>Observações:</strong>
                                    <span>{recomendacoes.observacoes}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default IrrigationCalculator;