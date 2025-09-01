export class User {
    constructor(id, email, name, profile = {}) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.profile = {
            nomeCompleto: profile.nomeCompleto || '',
            telefone: profile.telefone || '',
            cep: profile.cep || '',
            cidade: profile.cidade || '',
            estado: profile.estado || '',
            endereco: profile.endereco || '',
            nomePropriedade: profile.nomePropriedade || '',
            tamanhoPropriedade: profile.tamanhoPropriedade || '',
            principaisCulturas: profile.principaisCulturas || '',
            experienciaAgricola: profile.experienciaAgricola || '',
            ...profile
        };
        this.createdAt = profile.createdAt || new Date();
        this.updatedAt = profile.updatedAt || new Date();
    }

    // Métodos de negócio
    updateProfile(newData) {
        this.profile = { ...this.profile, ...newData };
        this.updatedAt = new Date();
        return this;
    }

    isProfileComplete() {
        const required = ['nomeCompleto', 'telefone', 'cep', 'cidade', 'estado'];
        return required.every(field => this.profile[field] && this.profile[field].trim() !== '');
    }

    getFullAddress() {
        const { endereco, cidade, estado, cep } = this.profile;
        if (!cidade || !estado) return '';
        
        let address = '';
        if (endereco) address += `${endereco}, `;
        address += `${cidade} - ${estado}`;
        if (cep) address += ` - CEP: ${cep}`;
        
        return address;
    }

    getDisplayName() {
        return this.profile.nomeCompleto || this.name || this.email.split('@')[0];
    }

    hasLocation() {
        return !!(this.profile.cep || (this.profile.cidade && this.profile.estado));
    }

    // Validações
    validateProfile() {
        const errors = [];
        
        if (!this.profile.nomeCompleto?.trim()) {
            errors.push('Nome completo é obrigatório');
        }
        
        if (!this.profile.telefone?.trim()) {
            errors.push('Telefone é obrigatório');
        }
        
        if (this.profile.cep && !/^\d{5}-?\d{3}$/.test(this.profile.cep)) {
            errors.push('CEP deve ter formato válido (00000-000)');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Serialização para Firebase
    toFirestore() {
        return {
            email: this.email,
            name: this.name,
            profile: this.profile,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    // Factory method
    static fromFirestore(id, data) {
        return new User(id, data.email, data.name, {
            ...data.profile,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
        });
    }
}