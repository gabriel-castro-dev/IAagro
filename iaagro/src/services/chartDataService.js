/**
 * Serviço para processar dados do Firebase para gráficos
 */

/**
 * Converter string numérica para número (trata ponto como separador de milhar)
 */
const parseNumericValue = (value) => {
    if (!value) return 0;
    
    const str = value.toString();
    
    // Se tem vírgula E ponto: "1.000,50" -> vírgula é decimal
    if (str.includes(',') && str.includes('.')) {
        return parseFloat(str.replace(/\./g, '').replace(',', '.'));
    }
    
    // Se tem apenas vírgula: "1000,50" -> vírgula é decimal
    if (str.includes(',')) {
        return parseFloat(str.replace(',', '.'));
    }
    
    // Se tem apenas ponto: verificar se é milhar ou decimal
    if (str.includes('.')) {
        const parts = str.split('.');
        
        // Se a última parte tem 3 dígitos, é separador de milhar: "100.000" -> 100000
        if (parts.length === 2 && parts[1].length === 3) {
            return parseFloat(str.replace(/\./g, ''));
        }
        
        // Múltiplos pontos ou último com 3 dígitos: é milhar
        if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) {
            return parseFloat(str.replace(/\./g, ''));
        }
        
        // Caso contrário, trata como decimal
        return parseFloat(str);
    }
    
    // Sem separadores, converte direto
    return parseFloat(str);
};

/**
 * Converter data YYYY-MM-DD para objeto Date
 */
const parseDate = (dateString) => {
    if (!dateString) return null;
    
    // Formato YYYY-MM-DD (do Firebase)
    if (dateString.includes('-')) {
        return new Date(dateString);
    }
    
    // Formato DD/MM/YYYY (legado)
    if (dateString.includes('/')) {
        const [day, month, year] = dateString.split('/');
        return new Date(year, month - 1, day);
    }
    
    return null;
};

/**
 * Obter data principal do registro (prioriza dataPlantio > dataColheita)
 */
const getMainDate = (item) => {
    return item.dataPlantio || item.dataColheita || item.data;
};

/**
 * Processar dados de produtividade mensal
 */
export const processProductivityData = (historicoData) => {
    if (!historicoData || historicoData.length === 0) {
        return [];
    }

    console.log('🔍 Dados recebidos:', historicoData);

    // Agrupar por mês/ano
    const monthlyData = {};

    historicoData.forEach(item => {
        const dateString = getMainDate(item);
        if (!dateString) {
            console.warn('⚠️ Item sem data:', item);
            return;
        }

        const date = parseDate(dateString);
        if (!date || isNaN(date.getTime())) {
            console.warn('⚠️ Data inválida:', dateString);
            return;
        }

        const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
        
        if (!monthlyData[monthYear]) {
            monthlyData[monthYear] = {
                mes: getMonthName(date.getMonth()) + '/' + date.getFullYear().toString().slice(2),
                rendimento: 0,
                count: 0,
                custo: 0,
                timestamp: date.getTime()
            };
        }

        // CORRIGIDO: Processar rendimentoFinal
        if (item.rendimentoFinal) {
            const rendimento = parseNumericValue(item.rendimentoFinal);
            console.log(`🔢 Rendimento original: "${item.rendimentoFinal}" -> convertido: ${rendimento}`);
            
            if (!isNaN(rendimento) && rendimento > 0) {
                monthlyData[monthYear].rendimento += rendimento;
                monthlyData[monthYear].count++;
                console.log(`✅ Rendimento adicionado: ${rendimento}`);
            }
        }

        // CORRIGIDO: Processar custosOperacionais
        if (item.custosOperacionais) {
            const custo = parseNumericValue(item.custosOperacionais);
            console.log(`🔢 Custo original: "${item.custosOperacionais}" -> convertido: ${custo}`);
            
            if (!isNaN(custo) && custo > 0) {
                monthlyData[monthYear].custo += custo;
                console.log(`✅ Custo adicionado: ${custo}`);
            }
        }
    });

    // Converter para array e calcular médias
    const result = Object.values(monthlyData)
        .map(item => ({
            mes: item.mes,
            rendimento: item.count > 0 ? Math.round(item.rendimento / item.count) : 0,
            custo: Math.round(item.custo),
            timestamp: item.timestamp
        }))
        .sort((a, b) => a.timestamp - b.timestamp)
        .slice(-6); // Últimos 6 meses

    console.log('📊 Dados de Produtividade processados:', result);
    return result;
};

/**
 * Processar análise de custos por categoria
 */
export const processCostAnalysisData = (historicoData) => {
    if (!historicoData || historicoData.length === 0) {
        return [];
    }

    const costByType = {
        'Plantio': 0,
        'Colheita': 0,
        'Adubação': 0,
        'Defensivos': 0,
        'Irrigação': 0,
        'Outros': 0
    };

    historicoData.forEach(item => {
        const tipo = item.tipo || '';
        
        if (item.custosOperacionais) {
            const custo = parseNumericValue(item.custosOperacionais);
            
            if (!isNaN(custo) && custo > 0) {
                // Categorizar por tipo
                if (tipo.toLowerCase().includes('plantio')) {
                    costByType['Plantio'] += custo;
                } else if (tipo.toLowerCase().includes('colheita')) {
                    costByType['Colheita'] += custo;
                } else if (tipo.toLowerCase().includes('aduba')) {
                    costByType['Adubação'] += custo;
                } else if (tipo.toLowerCase().includes('defensivo') || tipo.toLowerCase().includes('aplicação') || tipo.toLowerCase().includes('aplicacao')) {
                    costByType['Defensivos'] += custo;
                } else if (tipo.toLowerCase().includes('irriga')) {
                    costByType['Irrigação'] += custo;
                } else {
                    costByType['Outros'] += custo;
                }
                console.log(`💰 Custo ${tipo}: R$ ${custo}`);
            }
        }
    });

    // Converter para array e filtrar valores zerados
    const result = Object.entries(costByType)
        .filter(([_, value]) => value > 0)
        .map(([name, value]) => ({
            categoria: name,
            valor: Math.round(value)
        }))
        .sort((a, b) => b.valor - a.valor);

    console.log('💰 Dados de Custos processados:', result);
    return result;
};

/**
 * Processar distribuição de atividades
 */
export const processActivityDistributionData = (historicoData) => {
    if (!historicoData || historicoData.length === 0) {
        return [];
    }

    const activityCount = {};

    historicoData.forEach(item => {
        const tipo = item.tipo || 'Outros';
        activityCount[tipo] = (activityCount[tipo] || 0) + 1;
    });

    const total = Object.values(activityCount).reduce((sum, val) => sum + val, 0);

    const result = Object.entries(activityCount)
        .map(([name, value]) => ({
            tipo: name,
            quantidade: value,
            percentual: ((value / total) * 100).toFixed(1)
        }))
        .sort((a, b) => b.quantidade - a.quantidade);

    console.log('🎯 Dados de Atividades processados:', result);
    return result;
};

/**
 * Processar comparação entre culturas
 */
export const processCropComparisonData = (historicoData) => {
    if (!historicoData || historicoData.length === 0) {
        return [];
    }

    const cropData = {};

    historicoData.forEach(item => {
        const cultura = item.tipoCultura || 'Não especificada';
        
        if (!cropData[cultura]) {
            cropData[cultura] = {
                cultura: cultura,
                rendimento: 0,
                custo: 0,
                count: 0
            };
        }

        // CORRIGIDO: Processar rendimentoFinal
        if (item.rendimentoFinal) {
            const rendimento = parseNumericValue(item.rendimentoFinal);
            if (!isNaN(rendimento) && rendimento > 0) {
                cropData[cultura].rendimento += rendimento;
                cropData[cultura].count++;
            }
        }

        // CORRIGIDO: Processar custosOperacionais
        if (item.custosOperacionais) {
            const custo = parseNumericValue(item.custosOperacionais);
            if (!isNaN(custo) && custo > 0) {
                cropData[cultura].custo += custo;
            }
        }
    });

    const result = Object.values(cropData)
        .filter(item => item.count > 0)
        .map(item => ({
            cultura: item.cultura.charAt(0).toUpperCase() + item.cultura.slice(1),
            rendimentoMedio: Math.round(item.rendimento / item.count),
            custoTotal: Math.round(item.custo),
            registros: item.count
        }))
        .sort((a, b) => b.rendimentoMedio - a.rendimentoMedio);

    console.log('🌾 Dados de Culturas processados:', result);
    return result;
};

/**
 * Processar tendência de produtividade (últimos 12 meses)
 */
export const processProductivityTrendData = (historicoData) => {
    if (!historicoData || historicoData.length === 0) {
        return [];
    }

    const monthlyProduction = {};
    
    historicoData.forEach(item => {
        const dateString = getMainDate(item);
        if (!dateString) return;

        const date = parseDate(dateString);
        if (!date || isNaN(date.getTime())) return;

        const monthYear = `${getMonthName(date.getMonth())}/${date.getFullYear().toString().slice(2)}`;
        const timestamp = date.getTime();

        if (!monthlyProduction[monthYear]) {
            monthlyProduction[monthYear] = {
                mes: monthYear,
                producao: 0,
                timestamp: timestamp
            };
        }

        if (item.rendimentoFinal) {
            const producao = parseNumericValue(item.rendimentoFinal);
            if (!isNaN(producao) && producao > 0) {
                monthlyProduction[monthYear].producao += producao;
            }
        }
    });

    return Object.values(monthlyProduction)
        .map(item => ({
            mes: item.mes,
            producao: Math.round(item.producao),
            timestamp: item.timestamp
        }))
        .sort((a, b) => a.timestamp - b.timestamp)
        .slice(-12); // Últimos 12 meses
};

/**
 * Obter nome do mês
 */
const getMonthName = (monthIndex) => {
    const months = [
        'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
        'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];
    return months[monthIndex];
};

/**
 * Calcular estatísticas gerais
 */
export const calculateGeneralStats = (historicoData) => {
    if (!historicoData || historicoData.length === 0) {
        return {
            totalRegistros: 0,
            totalCustos: 0,
            rendimentoMedio: 0,
            culturasMaisUsadas: []
        };
    }

    let totalCustos = 0;
    let totalRendimento = 0;
    let countRendimento = 0;
    const culturas = {};

    historicoData.forEach(item => {
        if (item.custosOperacionais) {
            const custo = parseNumericValue(item.custosOperacionais);
            if (!isNaN(custo) && custo > 0) {
                totalCustos += custo;
            }
        }

        if (item.rendimentoFinal) {
            const rendimento = parseNumericValue(item.rendimentoFinal);
            if (!isNaN(rendimento) && rendimento > 0) {
                totalRendimento += rendimento;
                countRendimento++;
            }
        }

        const cultura = item.tipoCultura || 'Não especificada';
        culturas[cultura] = (culturas[cultura] || 0) + 1;
    });

    const culturasMaisUsadas = Object.entries(culturas)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([cultura, count]) => ({ cultura, count }));

    return {
        totalRegistros: historicoData.length,
        totalCustos: Math.round(totalCustos),
        rendimentoMedio: countRendimento > 0 ? Math.round(totalRendimento / countRendimento) : 0,
        culturasMaisUsadas
    };
};