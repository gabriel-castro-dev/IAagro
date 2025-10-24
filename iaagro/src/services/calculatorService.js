/**
 * Serviço para calculadoras agrícolas
 * Produtividade e Irrigação
 */

/**
 * Calculadora de Produtividade
 * Calcula: produtividade/ha, custo/saca, lucro estimado
 */
export const calcularProdutividade = (dados) => {
    try {
        const { 
            area,           // hectares
            producao,       // sacas ou kg
            custoTotal,     // R$
            precoVenda,     // R$ por saca/kg
            unidade = 'sacas' // 'sacas' ou 'kg'
        } = dados;

        // Validações
        if (!area || area <= 0) {
            throw new Error('Área deve ser maior que zero');
        }
        if (!producao || producao <= 0) {
            throw new Error('Produção deve ser maior que zero');
        }
        if (!custoTotal || custoTotal < 0) {
            throw new Error('Custo total inválido');
        }

        // Conversão para kg se necessário (1 saca = 60kg)
        const producaoKg = unidade === 'sacas' ? producao * 60 : producao;
        const producaoSacas = unidade === 'kg' ? producao / 60 : producao;

        // Cálculos
        const produtividadeHa = producaoSacas / area; // sacas/ha
        const produtividadeKgHa = producaoKg / area; // kg/ha
        
        const custoHa = custoTotal / area; // R$/ha
        const custoSaca = custoTotal / producaoSacas; // R$/saca
        const custoKg = custoTotal / producaoKg; // R$/kg

        let receitaTotal = 0;
        let lucroTotal = 0;
        let margemLucro = 0;
        let pontoEquilibrio = 0;

        if (precoVenda && precoVenda > 0) {
            receitaTotal = unidade === 'sacas' 
                ? producaoSacas * precoVenda 
                : producaoKg * precoVenda;
            
            lucroTotal = receitaTotal - custoTotal;
            margemLucro = (lucroTotal / receitaTotal) * 100;
            
            pontoEquilibrio = unidade === 'sacas'
                ? custoTotal / precoVenda
                : custoTotal / precoVenda;
        }

        const resultado = {
            // Produtividade
            produtividadeHaSacas: Number(produtividadeHa.toFixed(2)),
            produtividadeHaKg: Number(produtividadeKgHa.toFixed(2)),
            
            // Custos
            custoHa: Number(custoHa.toFixed(2)),
            custoSaca: Number(custoSaca.toFixed(2)),
            custoKg: Number(custoKg.toFixed(2)),
            
            // Financeiro
            custoTotal: Number(custoTotal.toFixed(2)),
            receitaTotal: Number(receitaTotal.toFixed(2)),
            lucroTotal: Number(lucroTotal.toFixed(2)),
            margemLucro: Number(margemLucro.toFixed(2)),
            pontoEquilibrio: Number(pontoEquilibrio.toFixed(2)),
            
            // Dados de entrada
            area,
            producaoSacas: Number(producaoSacas.toFixed(2)),
            producaoKg: Number(producaoKg.toFixed(2)),
            precoVenda: precoVenda || 0,
            unidade
        };

        return {
            success: true,
            data: resultado
        };

    } catch (error) {
        console.error('❌ Erro ao calcular produtividade:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Calculadora de Irrigação
 * Calcula necessidade de água baseado em cultura, área e clima
 */
export const calcularIrrigacao = (dados) => {
    try {
        const {
            cultura,        // tipo de cultura
            area,           // hectares
            temperatura,    // °C
            umidadeAr,      // %
            estadioDesenvolvimento = 'vegetativo', // 'inicial', 'vegetativo', 'floração', 'maturação'
            tipoSolo = 'medio' // 'arenoso', 'medio', 'argiloso'
        } = dados;

        // Validações
        if (!cultura) {
            throw new Error('Cultura não especificada');
        }
        if (!area || area <= 0) {
            throw new Error('Área deve ser maior que zero');
        }
        if (temperatura === undefined) {
            throw new Error('Temperatura não fornecida');
        }

        // Coeficientes de cultura (Kc) por estádio
        const kcCulturas = {
            soja: { inicial: 0.4, vegetativo: 0.8, floracao: 1.15, maturacao: 0.5 },
            milho: { inicial: 0.3, vegetativo: 0.8, floracao: 1.2, maturacao: 0.6 },
            trigo: { inicial: 0.3, vegetativo: 0.7, floracao: 1.15, maturacao: 0.4 },
            feijao: { inicial: 0.4, vegetativo: 0.7, floracao: 1.05, maturacao: 0.35 },
            algodao: { inicial: 0.35, vegetativo: 0.7, floracao: 1.15, maturacao: 0.7 },
            cafe: { inicial: 0.9, vegetativo: 0.9, floracao: 0.95, maturacao: 0.95 },
            cana: { inicial: 0.4, vegetativo: 0.9, floracao: 1.25, maturacao: 0.75 }
        };

        // Capacidade de retenção de água do solo (mm/m)
        const capacidadeSolo = {
            arenoso: 60,
            medio: 100,
            argiloso: 140
        };

        // Buscar Kc da cultura e estádio
        const culturaKey = cultura.toLowerCase();
        const kc = kcCulturas[culturaKey]?.[estadioDesenvolvimento] || 1.0;

        // Calcular ETo (Evapotranspiração de Referência) - Fórmula simplificada de Penman
        // ETo aproximado baseado em temperatura
        const etoBase = 0.0023 * (temperatura + 17.8) * Math.sqrt(temperatura - 0);
        
        // Ajustar por umidade
        const fatorUmidade = umidadeAr ? (100 - umidadeAr) / 100 : 0.5;
        const eto = etoBase * (1 + fatorUmidade);

        // ETc (Evapotranspiração da Cultura) = ETo * Kc
        const etc = eto * kc;

        // Lâmina de irrigação diária (mm/dia)
        const laminaDiaria = etc;

        // Volume de água por hectare
        const volumeHaDia = laminaDiaria * 10; // 1mm = 10m³/ha
        const volumeTotalDia = volumeHaDia * area;

        // Volume mensal (30 dias)
        const volumeMes = volumeTotalDia * 30;

        // Frequência de irrigação recomendada
        const capacidade = capacidadeSolo[tipoSolo] || 100;
        const frequenciaDias = Math.ceil(capacidade / laminaDiaria);

        // Alertas e recomendações
        const alertas = [];
        const recomendacoes = [];

        if (temperatura > 35) {
            alertas.push('⚠️ Temperatura muito alta - risco de estresse hídrico');
            recomendacoes.push('Aumentar frequência de irrigação em 20-30%');
        }

        if (umidadeAr && umidadeAr < 30) {
            alertas.push('⚠️ Umidade do ar muito baixa - maior evapotranspiração');
            recomendacoes.push('Considerar irrigação no período noturno');
        }

        if (estadioDesenvolvimento === 'floracao') {
            alertas.push('🌸 Estádio de floração - fase crítica de água');
            recomendacoes.push('Manter solo sempre úmido, evitar déficit hídrico');
        }

        if (tipoSolo === 'arenoso') {
            recomendacoes.push('Solo arenoso: aumentar frequência, reduzir volume por vez');
        }

        if (tipoSolo === 'argiloso') {
            recomendacoes.push('Solo argiloso: reduzir frequência, aumentar volume por vez');
        }

        const resultado = {
            // Necessidades hídricas
            etc: Number(etc.toFixed(2)), // mm/dia
            laminaDiaria: Number(laminaDiaria.toFixed(2)), // mm/dia
            
            // Volumes
            volumeHaDia: Number(volumeHaDia.toFixed(2)), // m³/ha/dia
            volumeTotalDia: Number(volumeTotalDia.toFixed(2)), // m³/dia total
            volumeMes: Number(volumeMes.toFixed(2)), // m³/mês total
            
            // Manejo
            frequenciaDias: frequenciaDias, // dias entre irrigações
            laminaPorIrrigacao: Number((laminaDiaria * frequenciaDias).toFixed(2)), // mm por vez
            
            // Coeficientes
            kc: Number(kc.toFixed(2)),
            eto: Number(eto.toFixed(2)),
            
            // Dados de entrada
            cultura,
            area,
            temperatura,
            umidadeAr: umidadeAr || 'N/A',
            estadioDesenvolvimento,
            tipoSolo,
            
            // Orientações
            alertas,
            recomendacoes
        };

        return {
            success: true,
            data: resultado
        };

    } catch (error) {
        console.error('❌ Erro ao calcular irrigação:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Obter recomendações de irrigação por cultura
 */
export const getRecomendacoesCultura = (cultura) => {
    const recomendacoes = {
        soja: {
            critico: 'Floração e enchimento de grãos',
            frequencia: '5-7 dias',
            lamina: '25-35 mm',
            observacoes: 'Evitar déficit hídrico na floração'
        },
        milho: {
            critico: 'Pendoamento e enchimento de grãos',
            frequencia: '4-6 dias',
            lamina: '30-40 mm',
            observacoes: 'Fase crítica: 15 dias antes até 30 dias após florescimento'
        },
        feijao: {
            critico: 'Floração e formação de vagens',
            frequencia: '3-5 dias',
            lamina: '20-30 mm',
            observacoes: 'Sensível a excesso de água no início'
        },
        trigo: {
            critico: 'Alongamento e enchimento de grãos',
            frequencia: '6-8 dias',
            lamina: '25-30 mm',
            observacoes: 'Reduzir irrigação próximo à colheita'
        }
    };

    return recomendacoes[cultura.toLowerCase()] || null;
};