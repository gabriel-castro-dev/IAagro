import React, { useState } from 'react';
import { FaCalculator, FaSeedling, FaDollarSign, FaChartLine } from 'react-icons/fa';
import { calcularProdutividade } from '../../services/calculatorService';
import styles from './Calculators.module.css';

const ProductivityCalculator = () => {
    const [formData, setFormData] = useState({
        area: '',
        producao: '',
        custoTotal: '',
        precoVenda: '',
        unidade: 'sacas'
    });

    const [resultado, setResultado] = useState(null);
    const [erro, setErro] = useState('');

    const handleCalculate = (e) => {
        e.preventDefault();
        setErro('');
        setResultado(null);

        // Converter para números
        const dados = {
            area: parseFloat(formData.area),
            producao: parseFloat(formData.producao),
            custoTotal: parseFloat(formData.custoTotal),
            precoVenda: formData.precoVenda ? parseFloat(formData.precoVenda) : 0,
            unidade: formData.unidade
        };

        const result = calcularProdutividade(dados);

        if (result.success) {
            setResultado(result.data);
        } else {
            setErro(result.error);
        }
    };

    const handleReset = () => {
        setFormData({
            area: '',
            producao: '',
            custoTotal: '',
            precoVenda: '',
            unidade: 'sacas'
        });
        setResultado(null);
        setErro('');
    };

    return (
        <div className={styles.calculator}>
            <div className={styles.calculatorHeader}>
                <h3><FaCalculator /> Calculadora de Produtividade</h3>
                <p>Calcule produtividade por hectare, custos e lucros</p>
            </div>

            <form onSubmit={handleCalculate} className={styles.form}>
                <div className={styles.formGrid}>
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
                        <label>Produção *</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.producao}
                            onChange={(e) => setFormData({...formData, producao: e.target.value})}
                            placeholder="Ex: 3000"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Unidade *</label>
                        <select
                            value={formData.unidade}
                            onChange={(e) => setFormData({...formData, unidade: e.target.value})}
                        >
                            <option value="sacas">Sacas (60kg)</option>
                            <option value="kg">Quilogramas (kg)</option>
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Custo Total (R$) *</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.custoTotal}
                            onChange={(e) => setFormData({...formData, custoTotal: e.target.value})}
                            placeholder="Ex: 150000"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Preço de Venda (R$/{formData.unidade === 'sacas' ? 'saca' : 'kg'})</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.precoVenda}
                            onChange={(e) => setFormData({...formData, precoVenda: e.target.value})}
                            placeholder="Ex: 120 (opcional)"
                        />
                    </div>
                </div>

                {erro && (
                    <div className={styles.error}>
                        ⚠️ {erro}
                    </div>
                )}

                <div className={styles.formActions}>
                    <button type="submit" className={styles.calculateBtn}>
                        <FaCalculator /> Calcular
                    </button>
                    <button type="button" onClick={handleReset} className={styles.resetBtn}>
                        Limpar
                    </button>
                </div>
            </form>

            {resultado && (
                <div className={styles.results}>
                    <h4>📊 Resultados</h4>

                    <div className={styles.resultSection}>
                        <h5><FaSeedling /> Produtividade</h5>
                        <div className={styles.resultGrid}>
                            <div className={styles.resultCard}>
                                <span className={styles.resultLabel}>Sacas/ha</span>
                                <span className={styles.resultValue}>
                                    {resultado.produtividadeHaSacas}
                                </span>
                            </div>
                            <div className={styles.resultCard}>
                                <span className={styles.resultLabel}>kg/ha</span>
                                <span className={styles.resultValue}>
                                    {resultado.produtividadeHaKg}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.resultSection}>
                        <h5><FaDollarSign /> Custos</h5>
                        <div className={styles.resultGrid}>
                            <div className={styles.resultCard}>
                                <span className={styles.resultLabel}>Custo/ha</span>
                                <span className={styles.resultValue}>
                                    R$ {resultado.custoHa.toLocaleString('pt-BR')}
                                </span>
                            </div>
                            <div className={styles.resultCard}>
                                <span className={styles.resultLabel}>Custo/saca</span>
                                <span className={styles.resultValue}>
                                    R$ {resultado.custoSaca.toLocaleString('pt-BR')}
                                </span>
                            </div>
                            <div className={styles.resultCard}>
                                <span className={styles.resultLabel}>Custo/kg</span>
                                <span className={styles.resultValue}>
                                    R$ {resultado.custoKg.toLocaleString('pt-BR')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {resultado.precoVenda > 0 && (
                        <div className={styles.resultSection}>
                            <h5><FaChartLine /> Análise Financeira</h5>
                            <div className={styles.resultGrid}>
                                <div className={styles.resultCard}>
                                    <span className={styles.resultLabel}>Receita Total</span>
                                    <span className={styles.resultValue} style={{color: '#10b981'}}>
                                        R$ {resultado.receitaTotal.toLocaleString('pt-BR')}
                                    </span>
                                </div>
                                <div className={styles.resultCard}>
                                    <span className={styles.resultLabel}>Lucro Total</span>
                                    <span className={styles.resultValue} style={{
                                        color: resultado.lucroTotal >= 0 ? '#10b981' : '#ef4444'
                                    }}>
                                        R$ {resultado.lucroTotal.toLocaleString('pt-BR')}
                                    </span>
                                </div>
                                <div className={styles.resultCard}>
                                    <span className={styles.resultLabel}>Margem de Lucro</span>
                                    <span className={styles.resultValue} style={{
                                        color: resultado.margemLucro >= 0 ? '#10b981' : '#ef4444'
                                    }}>
                                        {resultado.margemLucro.toFixed(1)}%
                                    </span>
                                </div>
                                <div className={styles.resultCard}>
                                    <span className={styles.resultLabel}>Ponto de Equilíbrio</span>
                                    <span className={styles.resultValue}>
                                        {resultado.pontoEquilibrio.toFixed(0)} {formData.unidade}
                                    </span>
                                </div>
                            </div>

                            {resultado.lucroTotal < 0 && (
                                <div className={styles.alert}>
                                    ⚠️ Atenção: Operação com prejuízo! 
                                    Considere reduzir custos ou buscar melhor preço de venda.
                                </div>
                            )}

                            {resultado.margemLucro > 0 && resultado.margemLucro < 10 && (
                                <div className={styles.warning}>
                                    📊 Margem de lucro baixa. Analise possibilidades de otimização.
                                </div>
                            )}

                            {resultado.margemLucro >= 20 && (
                                <div className={styles.success}>
                                    ✅ Excelente margem de lucro! Operação muito rentável.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProductivityCalculator;