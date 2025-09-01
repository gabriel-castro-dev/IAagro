export class AgricultureData {
    constructor(userId, data = {}) {
        this.id = data.id || null;
        this.userId = userId;
        this.tipo = data.tipo || ''; // plantio, colheita, aplicacao, etc
        this.cultura = data.cultura || '';
        this.area = data.area || 0;
        this.quantidade = data.quantidade || 0;
        this.unidade = data.unidade || '';
        this.data = data.data || new Date();
        this.observacoes = data.observacoes || '';
        this.coordenadas = data.coordenadas || null;
        this.clima = data.clima || null; // dados climáticos do dia
        this.custos = data.custos || 0;
        this.status = data.status || 'planejado'; // planejado, em_andamento, concluido
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
    }

    // Métodos de negócio
    updateData(newData) {
        Object.assign(this, newData);
        this.updatedAt = new Date();
        return this;
    }

    markAsCompleted() {
        this.status = 'concluido';
        this.updatedAt = new Date();
        return this;
    }

    markAsInProgress() {
        this.status = 'em_andamento';
        this.updatedAt = new Date();
        return this;
    }

    // Validações
    validate() {
        const errors = [];
        
        if (!this.tipo?.trim()) {
            errors.push('Tipo de atividade é obrigatório');
        }
        
        if (!this.cultura?.trim()) {
            errors.push('Cultura é obrigatória');
        }
        
        if (this.area <= 0) {
            errors.push('Área deve ser maior que zero');
        }
        
        if (!this.data) {
            errors.push('Data é obrigatória');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Formatações
    getFormattedArea() {
        return `${this.area} hectares`;
    }

    getFormattedQuantity() {
        return `${this.quantidade} ${this.unidade}`;
    }

    getFormattedCosts() {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(this.custos);
    }

    getFormattedDate() {
        return this.data.toLocaleDateString('pt-BR');
    }

    getStatusDisplay() {
        const statusMap = {
            'planejado': { text: 'Planejado', color: '#F5A623' },
            'em_andamento': { text: 'Em Andamento', color: '#4A90E2' },
            'concluido': { text: 'Concluído', color: '#7ED321' }
        };
        return statusMap[this.status] || statusMap['planejado'];
    }

    getTipoDisplay() {
        const tipoMap = {
            'plantio': 'Plantio',
            'colheita': 'Colheita',
            'aplicacao': 'Aplicação',
            'irrigacao': 'Irrigação',
            'adubacao': 'Adubação',
            'pulverizacao': 'Pulverização',
            'manutencao': 'Manutenção'
        };
        return tipoMap[this.tipo] || this.tipo;
    }

    // Análises
    isOverdue() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const activityDate = new Date(this.data);
        activityDate.setHours(0, 0, 0, 0);
        
        return activityDate < today && this.status !== 'concluido';
    }

    isToday() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const activityDate = new Date(this.data);
        activityDate.setHours(0, 0, 0, 0);
        
        return activityDate.getTime() === today.getTime();
    }

    getDaysUntilDue() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const activityDate = new Date(this.data);
        activityDate.setHours(0, 0, 0, 0);
        
        const diffTime = activityDate.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Produtividade
    calculateProductivity() {
        if (this.tipo === 'colheita' && this.quantidade > 0 && this.area > 0) {
            return {
                value: this.quantidade / this.area,
                unit: `${this.unidade}/hectare`
            };
        }
        return null;
    }

    // ROI (Return on Investment)
    calculateROI(revenue = 0) {
        if (this.custos > 0) {
            const profit = revenue - this.custos;
            return (profit / this.custos) * 100;
        }
        return 0;
    }

    // Serialização para Firebase
    toFirestore() {
        return {
            userId: this.userId,
            tipo: this.tipo,
            cultura: this.cultura,
            area: this.area,
            quantidade: this.quantidade,
            unidade: this.unidade,
            data: this.data,
            observacoes: this.observacoes,
            coordenadas: this.coordenadas,
            clima: this.clima,
            custos: this.custos,
            status: this.status,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    // Factory method
    static fromFirestore(id, data) {
        return new AgricultureData(data.userId, {
            id,
            ...data,
            data: data.data?.toDate() || new Date(),
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
        });
    }

    // Método para criar dados de exemplo/teste
    static createSampleData(userId) {
        return [
            new AgricultureData(userId, {
                tipo: 'plantio',
                cultura: 'Milho',
                area: 10.5,
                quantidade: 0,
                unidade: 'sacas',
                data: new Date(),
                observacoes: 'Plantio de milho safrinha',
                custos: 2500.00,
                status: 'planejado'
            }),
            new AgricultureData(userId, {
                tipo: 'adubacao',
                cultura: 'Soja',
                area: 15.0,
                quantidade: 300,
                unidade: 'kg',
                data: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                observacoes: 'Adubação de cobertura',
                custos: 1800.00,
                status: 'planejado'
            })
        ];
    }
}