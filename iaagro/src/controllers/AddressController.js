import { getAddressByCEP } from '../services/addressService';

export class AddressController {
    constructor() {}

    // Buscar endereço por CEP
    async searchAddressByCEP(cep) {
        try {
            if (!cep) {
                throw new Error('CEP é obrigatório');
            }

            // Limpar CEP (remover caracteres especiais)
            const cleanCEP = cep.replace(/\D/g, '');
            
            if (cleanCEP.length !== 8) {
                throw new Error('CEP deve ter 8 dígitos');
            }

            // Buscar na API ViaCEP
            const result = await getAddressByCEP(cleanCEP);
            
            if (!result.success) {
                return {
                    success: false,
                    error: result.error || 'CEP não encontrado'
                };
            }

            // Formatar dados para o padrão do sistema
            const formattedAddress = this.formatAddressData(result.data);

            return {
                success: true,
                data: formattedAddress
            };
        } catch (error) {
            console.error('Erro no AddressController.searchAddressByCEP:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Validar e formatar dados de endereço
    validateAndFormatAddress(addressData) {
        try {
            const errors = [];
            
            // Validações
            if (!addressData.cep) {
                errors.push('CEP é obrigatório');
            } else if (!/^\d{5}-?\d{3}$/.test(addressData.cep)) {
                errors.push('CEP deve ter formato válido (00000-000)');
            }
            
            if (!addressData.cidade?.trim()) {
                errors.push('Cidade é obrigatória');
            }
            
            if (!addressData.estado?.trim()) {
                errors.push('Estado é obrigatório');
            }

            if (errors.length > 0) {
                return {
                    success: false,
                    error: errors.join(', '),
                    validationErrors: errors
                };
            }

            // Formatar dados
            const formattedData = {
                cep: this.formatCEP(addressData.cep),
                endereco: addressData.endereco?.trim() || '',
                cidade: this.capitalizeWords(addressData.cidade?.trim() || ''),
                estado: addressData.estado?.trim().toUpperCase() || '',
                bairro: this.capitalizeWords(addressData.bairro?.trim() || '')
            };

            return {
                success: true,
                data: formattedData
            };
        } catch (error) {
            console.error('Erro ao validar endereço:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Buscar múltiplos CEPs (para validação em lote)
    async searchMultipleCEPs(ceps) {
        try {
            const results = [];
            
            for (const cep of ceps) {
                const result = await this.searchAddressByCEP(cep);
                results.push({
                    cep,
                    ...result
                });
            }

            return {
                success: true,
                data: results
            };
        } catch (error) {
            console.error('Erro ao buscar múltiplos CEPs:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Métodos utilitários
    formatAddressData(viaCepData) {
        return {
            cep: this.formatCEP(viaCepData.cep),
            endereco: viaCepData.logradouro || '',
            cidade: this.capitalizeWords(viaCepData.localidade || ''),
            estado: viaCepData.uf || '',
            bairro: this.capitalizeWords(viaCepData.bairro || ''),
            complemento: viaCepData.complemento || ''
        };
    }

    formatCEP(cep) {
        const clean = cep.replace(/\D/g, '');
        return clean.replace(/(\d{5})(\d{3})/, '$1-$2');
    }

    capitalizeWords(str) {
        return str.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    }

    // Validar CEP brasileiro
    isValidBrazilianCEP(cep) {
        const cleanCEP = cep.replace(/\D/g, '');
        
        // Verificar se tem 8 dígitos
        if (cleanCEP.length !== 8) return false;
        
        // Verificar se não são todos iguais (00000000, 11111111, etc.)
        if (/^(\d)\1{7}$/.test(cleanCEP)) return false;
        
        return true;
    }

    // Obter sugestões de endereço baseado em texto
    async getAddressSuggestions(searchText) {
        try {
            // Implementar busca por cidade/estado se necessário
            // Por enquanto, retorna array vazio
            return {
                success: true,
                data: []
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}