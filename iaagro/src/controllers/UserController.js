import { UserRepository } from '../repositories/UserRepository';
import { User } from '../models/User';

export class UserController {
    constructor() {
        this.userRepository = new UserRepository();
    }

    // Obter usuário por ID
    async getUser(userId) {
        try {
            if (!userId) {
                throw new Error('ID do usuário é obrigatório');
            }

            const user = await this.userRepository.findById(userId);
            
            if (!user) {
                console.warn('Usuário não encontrado no banco, retornando dados básicos');
                return {
                    success: true,
                    data: {
                        id: userId,
                        profile: {
                            nomeCompleto: '',
                            email: '',
                            telefone: '',
                            endereco: '',
                            cidade: '',
                            estado: '',
                            cep: '',
                            tema: 'light'
                        }
                    },
                    needsCreation: true
                };
            }

            return {
                success: true,
                data: user
            };
        } catch (error) {
            console.error('Erro no UserController.getUser:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Método específico para carregar dados do perfil (compatível com Home.jsx)
    async loadUserProfile(userId, userEmail) {
        try {
            const result = await this.getUser(userId);
            
            if (result.success && result.data) {
                // Garantir que email está presente
                if (!result.data.profile.email && userEmail) {
                    result.data.profile.email = userEmail;
                }
                
                return result.data.profile;
            }
            
            // Retornar perfil básico se não encontrou
            return {
                nomeCompleto: '',
                email: userEmail || '',
                telefone: '',
                endereco: '',
                cidade: '',
                estado: '',
                cep: '',
                tema: 'light',
                idioma: 'Português',
                notificacoesEmail: true,
                notificacoesPush: false,
                notificacoesMarketing: false
            };
        } catch (error) {
            console.error('Erro ao carregar perfil:', error);
            throw error;
        }
    }

    // Salvar perfil (compatível com Home.jsx)
    async saveUserProfile(userId, profileData) {
        try {
            if (!userId) {
                throw new Error('ID do usuário é obrigatório');
            }

            // Buscar usuário atual ou criar se não existir
            let user = await this.userRepository.findById(userId);
            
            if (!user) {
                // Criar usuário inicial
                user = await this.userRepository.createInitialUser(
                    userId, 
                    profileData.email || '', 
                    profileData.nomeCompleto || ''
                );
            }

            // Atualizar perfil
            user.updateProfile(profileData);
            
            // Validar
            const validation = user.validateProfile();
            if (!validation.isValid) {
                return {
                    success: false,
                    error: validation.errors.join(', '),
                    validationErrors: validation.errors
                };
            }

            // Salvar
            const savedUser = await this.userRepository.save(user);

            return {
                success: true,
                data: savedUser,
                message: 'Perfil salvo com sucesso'
            };
        } catch (error) {
            console.error('Erro no UserController.saveUserProfile:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Criar usuário inicial
    async createUser(userId, email, name) {
        try {
            if (!userId || !email) {
                throw new Error('ID do usuário e email são obrigatórios');
            }

            // Verificar se já existe
            const existingUser = await this.userRepository.findById(userId);
            if (existingUser) {
                return {
                    success: true,
                    data: existingUser,
                    message: 'Usuário já existia'
                };
            }

            // Criar novo usuário
            const user = await this.userRepository.createInitialUser(userId, email, name || '');

            return {
                success: true,
                data: user,
                message: 'Usuário criado com sucesso'
            };
        } catch (error) {
            console.error('Erro no UserController.createUser:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Atualizar perfil do usuário
    async updateProfile(userId, profileData) {
        try {
            if (!userId) {
                throw new Error('ID do usuário é obrigatório');
            }

            // Buscar usuário atual
            let user = await this.userRepository.findById(userId);
            
            // Se não existe, criar
            if (!user) {
                user = new User(userId, profileData.email || '', profileData.name || '');
            }

            // Validar dados do perfil
            const tempUser = new User(user.id, user.email, user.name, profileData);
            const validation = tempUser.validateProfile();
            
            if (!validation.isValid) {
                return {
                    success: false,
                    error: validation.errors.join(', '),
                    validationErrors: validation.errors
                };
            }

            // Atualizar perfil
            user.updateProfile(profileData);
            const updatedUser = await this.userRepository.save(user);

            return {
                success: true,
                data: updatedUser,
                message: 'Perfil atualizado com sucesso'
            };
        } catch (error) {
            console.error('Erro no UserController.updateProfile:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Verificar se perfil está completo
    async checkProfileCompleteness(userId) {
        try {
            const user = await this.userRepository.findById(userId);
            
            if (!user) {
                return {
                    success: true,
                    data: {
                        isComplete: false,
                        missingFields: ['Perfil não criado']
                    }
                };
            }

            const isComplete = user.isProfileComplete();
            const validation = user.validateProfile();

            return {
                success: true,
                data: {
                    isComplete,
                    missingFields: validation.errors,
                    hasLocation: user.hasLocation()
                }
            };
        } catch (error) {
            console.error('Erro no UserController.checkProfileCompleteness:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Atualizar apenas dados de localização
    async updateLocation(userId, locationData) {
        try {
            const { cep, endereco, cidade, estado } = locationData;
            
            const profileUpdate = {
                cep: cep || '',
                endereco: endereco || '',
                cidade: cidade || '',
                estado: estado || ''
            };

            return await this.updateProfile(userId, profileUpdate);
        } catch (error) {
            console.error('Erro no UserController.updateLocation:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Obter informações para dashboard
    async getDashboardInfo(userId) {
        try {
            const user = await this.userRepository.findById(userId);
            
            if (!user) {
                return {
                    success: false,
                    error: 'Usuário não encontrado'
                };
            }

            return {
                success: true,
                data: {
                    displayName: user.getDisplayName(),
                    fullAddress: user.getFullAddress(),
                    isProfileComplete: user.isProfileComplete(),
                    hasLocation: user.hasLocation(),
                    profile: user.profile,
                    memberSince: user.createdAt
                }
            };
        } catch (error) {
            console.error('Erro no UserController.getDashboardInfo:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Validar dados antes de salvar
    validateProfileData(profileData) {
        const errors = [];

        // Validações básicas
        if (!profileData.nomeCompleto?.trim()) {
            errors.push('Nome completo é obrigatório');
        }

        if (!profileData.telefone?.trim()) {
            errors.push('Telefone é obrigatório');
        }

        // Validar CEP se fornecido
        if (profileData.cep) {
            const cepRegex = /^\d{5}-?\d{3}$/;
            if (!cepRegex.test(profileData.cep)) {
                errors.push('CEP deve ter formato válido (00000-000)');
            }
        }

        // Validar telefone
        if (profileData.telefone) {
            const phoneRegex = /^\(?[1-9]{2}\)?\s?[0-9]{4,5}-?[0-9]{4}$/;
            if (!phoneRegex.test(profileData.telefone.replace(/\s/g, ''))) {
                errors.push('Telefone deve ter formato válido');
            }
        }

        // Validar área da propriedade se fornecida
        if (profileData.tamanhoPropriedade) {
            const area = parseFloat(profileData.tamanhoPropriedade);
            if (isNaN(area) || area <= 0) {
                errors.push('Tamanho da propriedade deve ser um número válido');
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Deletar usuário (GDPR compliance)
    async deleteUser(userId) {
        try {
            if (!userId) {
                throw new Error('ID do usuário é obrigatório');
            }

            const deleted = await this.userRepository.delete(userId);

            return {
                success: deleted,
                message: deleted ? 'Usuário deletado com sucesso' : 'Erro ao deletar usuário'
            };
        } catch (error) {
            console.error('Erro no UserController.deleteUser:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}