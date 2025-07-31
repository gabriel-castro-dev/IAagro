/**
 * Serviço para busca de endereços por CEP
 * Utiliza a API do ViaCEP
 */
import React from 'react';
const VIACEP_BASE_URL = process.env.REACT_APP_VIACEP_BASE_URL || 'https://viacep.com.br/ws';
const BACKUP_CEP_API_KEY = process.env.REACT_APP_BACKUP_CEP_API_KEY;

/**
 * Busca endereço por CEP usando a API do ViaCEP
 * @param {string} cep - CEP para busca (com ou sem formatação)
 * @returns {Promise<Object>} - Dados do endereço ou erro
 */
export const getAddressByCEP = async (cep) => {
    try {
        // Remove caracteres não numéricos do CEP
        const cleanCEP = cep.replace(/\D/g, '');
        
        // Valida se o CEP tem 8 dígitos
        if (!cleanCEP || cleanCEP.length !== 8) {
            throw new Error('CEP deve conter exatamente 8 dígitos');
        }

        // Valida formato usando regex
        const cepRegex = /^[0-9]{8}$/;
        if (!cepRegex.test(cleanCEP)) {
            throw new Error('Formato de CEP inválido. Use apenas números.');
        }

        // Monta a URL da API
        const apiUrl = `${VIACEP_BASE_URL}/${cleanCEP}/json/`;
        
        console.log('Buscando CEP:', cleanCEP);
        
        // Faz a requisição para a API
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        // Verifica se a resposta foi bem-sucedida
        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status} - ${response.statusText}`);
        }

        // Converte a resposta para JSON
        const data = await response.json();
        
        console.log('Resposta da API:', data);

        // Verifica se o CEP foi encontrado
        if (data.erro === true || data.erro === "true") {
            throw new Error('CEP não encontrado. Verifique se o CEP está correto.');
        }

        // Retorna os dados formatados
        return {
            success: true,
            data: {
                cep: data.cep || cleanCEP,
                logradouro: data.logradouro || '',
                complemento: data.complemento || '',
                bairro: data.bairro || '',
                localidade: data.localidade || '', // cidade
                uf: data.uf || '', // estado
                ibge: data.ibge || '',
                gia: data.gia || '',
                ddd: data.ddd || '',
                siafi: data.siafi || '',
                // Campos extras formatados
                endereco: data.logradouro || '',
                cidade: data.localidade || '',
                estado: data.uf || ''
            }
        };

    } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        
        return {
            success: false,
            error: error.message,
            data: null
        };
    }
};

/**
 * Busca múltiplos endereços por cidade, estado e logradouro
 * @param {string} uf - Estado (UF)
 * @param {string} cidade - Nome da cidade
 * @param {string} logradouro - Nome da rua/logradouro
 * @returns {Promise<Object>} - Lista de endereços encontrados
 */
export const searchAddressByLocation = async (uf, cidade, logradouro) => {
    try {
        // Valida parâmetros obrigatórios
        if (!uf || !cidade || !logradouro) {
            throw new Error('UF, cidade e logradouro são obrigatórios');
        }

        // Valida UF (deve ter 2 caracteres)
        if (uf.length !== 2) {
            throw new Error('UF deve ter exatamente 2 caracteres');
        }

        // Valida tamanho mínimo do logradouro
        if (logradouro.length < 3) {
            throw new Error('Logradouro deve ter pelo menos 3 caracteres');
        }

        // Monta a URL da API para busca por endereço
        const apiUrl = `${VIACEP_BASE_URL}/${uf}/${encodeURIComponent(cidade)}/${encodeURIComponent(logradouro)}/json/`;
        
        console.log('Buscando endereço:', { uf, cidade, logradouro });
        
        // Faz a requisição
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status}`);
        }

        const data = await response.json();
        
        // Se não encontrou nenhum resultado
        if (!Array.isArray(data) || data.length === 0) {
            throw new Error('Nenhum endereço encontrado para os parâmetros informados');
        }

        return {
            success: true,
            data: data.map(item => ({
                cep: item.cep,
                logradouro: item.logradouro,
                complemento: item.complemento,
                bairro: item.bairro,
                localidade: item.localidade,
                uf: item.uf,
                ibge: item.ibge,
                gia: item.gia,
                ddd: item.ddd,
                siafi: item.siafi
            }))
        };

    } catch (error) {
        console.error('Erro ao buscar endereços:', error);
        
        return {
            success: false,
            error: error.message,
            data: []
        };
    }
};

/**
 * Formata CEP para exibição (00000-000)
 * @param {string} cep - CEP sem formatação
 * @returns {string} - CEP formatado
 */
export const formatCEP = (cep) => {
    if (!cep) return '';
    
    // Remove caracteres não numéricos
    const cleanCEP = cep.replace(/\D/g, '');
    
    // Se não tiver 8 dígitos, retorna como está
    if (cleanCEP.length !== 8) {
        return cleanCEP;
    }
    
    // Formata: 00000-000
    return cleanCEP.replace(/(\d{5})(\d{3})/, '$1-$2');
};

/**
 * Remove formatação do CEP (deixa apenas números)
 * @param {string} cep - CEP formatado
 * @returns {string} - CEP apenas com números
 */
export const cleanCEP = (cep) => {
    if (!cep) return '';
    return cep.replace(/\D/g, '');
};

/**
 * Valida se um CEP está no formato correto
 * @param {string} cep - CEP para validação
 * @returns {boolean} - True se o CEP é válido
 */
export const isValidCEP = (cep) => {
    if (!cep) return false;
    
    const cleanedCEP = cleanCEP(cep);
    
    // Deve ter exatamente 8 dígitos
    if (cleanedCEP.length !== 8) return false;
    
    // Deve conter apenas números
    const cepRegex = /^[0-9]{8}$/;
    if (!cepRegex.test(cleanedCEP)) return false;
    
    // CEPs inválidos conhecidos (todos iguais)
    const invalidCEPs = ['00000000', '11111111', '22222222', '33333333', '44444444', '55555555', '66666666', '77777777', '88888888', '99999999'];
    if (invalidCEPs.includes(cleanedCEP)) return false;
    
    return true;
};

/**
 * Máscara para campo de input CEP
 * @param {string} value - Valor atual do input
 * @returns {string} - Valor com máscara aplicada
 */
export const applyCEPMask = (value) => {
    if (!value) return '';
    
    // Remove tudo que não é número
    let cleanValue = value.replace(/\D/g, '');
    
    // Limita a 8 dígitos
    cleanValue = cleanValue.substring(0, 8);
    
    // Aplica a máscara progressivamente
    if (cleanValue.length >= 6) {
        return cleanValue.replace(/(\d{5})(\d{0,3})/, '$1-$2');
    } else if (cleanValue.length >= 1) {
        return cleanValue;
    }
    
    return '';
};

/**
 * Cria um debounce para busca de CEP
 * Útil para evitar muitas requisições durante a digitação
 * @param {Function} func - Função a ser executada
 * @param {number} delay - Delay em milliseconds
 * @returns {Function} - Função com debounce
 */
export const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
};

/**
 * Hook personalizado para busca de CEP com debounce
 * Pode ser usado em componentes React
 * @param {string} cep - CEP para busca
 * @param {number} delay - Delay do debounce (padrão: 500ms)
 * @returns {Object} - Estado da busca
 */
export const useCEPSearch = (cep, delay = 500) => {
    const [loading, setLoading] = React.useState(false);
    const [data, setData] = React.useState(null);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        if (!isValidCEP(cep)) {
            setData(null);
            setError(null);
            return;
        }

        const searchCEP = debounce(async (searchCep) => {
            setLoading(true);
            setError(null);
            
            try {
                const result = await getAddressByCEP(searchCep);
                
                if (result.success) {
                    setData(result.data);
                } else {
                    setError(result.error);
                    setData(null);
                }
            } catch (err) {
                setError(err.message);
                setData(null);
            } finally {
                setLoading(false);
            }
        }, delay);

        searchCEP(cep);
    }, [cep, delay]);

    return { loading, data, error };
};

/**
 * Estados brasileiros para validação e seleção
 */
export const BRAZILIAN_STATES = [
    { uf: 'AC', name: 'Acre' },
    { uf: 'AL', name: 'Alagoas' },
    { uf: 'AP', name: 'Amapá' },
    { uf: 'AM', name: 'Amazonas' },
    { uf: 'BA', name: 'Bahia' },
    { uf: 'CE', name: 'Ceará' },
    { uf: 'DF', name: 'Distrito Federal' },
    { uf: 'ES', name: 'Espírito Santo' },
    { uf: 'GO', name: 'Goiás' },
    { uf: 'MA', name: 'Maranhão' },
    { uf: 'MT', name: 'Mato Grosso' },
    { uf: 'MS', name: 'Mato Grosso do Sul' },
    { uf: 'MG', name: 'Minas Gerais' },
    { uf: 'PA', name: 'Pará' },
    { uf: 'PB', name: 'Paraíba' },
    { uf: 'PR', name: 'Paraná' },
    { uf: 'PE', name: 'Pernambuco' },
    { uf: 'PI', name: 'Piauí' },
    { uf: 'RJ', name: 'Rio de Janeiro' },
    { uf: 'RN', name: 'Rio Grande do Norte' },
    { uf: 'RS', name: 'Rio Grande do Sul' },
    { uf: 'RO', name: 'Rondônia' },
    { uf: 'RR', name: 'Roraima' },
    { uf: 'SC', name: 'Santa Catarina' },
    { uf: 'SP', name: 'São Paulo' },
    { uf: 'SE', name: 'Sergipe' },
    { uf: 'TO', name: 'Tocantins' }
];

/**
 * Valida se um estado (UF) é válido
 * @param {string} uf - UF para validação
 * @returns {boolean} - True se a UF é válida
 */
export const isValidUF = (uf) => {
    if (!uf || uf.length !== 2) return false;
    return BRAZILIAN_STATES.some(state => state.uf === uf.toUpperCase());
};

/**
 * Obtém o nome completo do estado pela UF
 * @param {string} uf - UF do estado
 * @returns {string} - Nome completo do estado
 */
export const getStateNameByUF = (uf) => {
    if (!uf) return '';
    const state = BRAZILIAN_STATES.find(state => state.uf === uf.toUpperCase());
    return state ? state.name : uf;
};