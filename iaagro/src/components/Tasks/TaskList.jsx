import React, { useState, useEffect } from 'react';
import { FaPlus, FaCheck, FaTrash, FaEdit, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import styles from './TaskList.module.css';
import PDFExportButton from '../PDF/PDFExportButton'; // ✅ ADICIONAR IMPORT

const TaskList = ({ userId, taskController }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [filter, setFilter] = useState('todas');
    const [stats, setStats] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    
    // Form state
    const [formData, setFormData] = useState({
        titulo: '',
        descricao: '',
        categoria: 'Geral',
        dataLimite: '',
        prioridade: 'media'
    });

    useEffect(() => {
        if (userId) {
            loadTasks();
            loadStats();
        }
    }, [userId, filter, refreshKey]);

    const loadTasks = async () => {
        setLoading(true);
        try {
            const filters = filter === 'pendentes' 
                ? { concluida: false } 
                : filter === 'concluidas' 
                ? { concluida: true } 
                : {};

            const result = await taskController.getTasks(userId, filters);
            
            if (result.success) {
                setTasks(result.data);
                console.log('✅ Tarefas carregadas:', result.data.length);
            } else {
                console.error('❌ Erro ao carregar tarefas:', result.error);
            }
        } catch (error) {
            console.error('❌ Erro ao carregar tarefas:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const result = await taskController.getStatistics(userId);
            if (result.success) {
                setStats(result.data);
            }
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.titulo || !formData.dataLimite) {
            alert('Preencha título e data limite');
            return;
        }

        console.log('📤 Criando tarefa:', formData);

        const result = await taskController.createTask(userId, formData);
        
        if (result.success) {
            console.log('✅ Tarefa criada com sucesso');
            
            setFormData({
                titulo: '',
                descricao: '',
                categoria: 'Geral',
                dataLimite: '',
                prioridade: 'media'
            });
            
            setShowForm(false);
            setRefreshKey(prev => prev + 1);
            
            alert('✅ Tarefa criada com sucesso!');
        } else {
            console.error('❌ Erro ao criar tarefa:', result.error);
            alert('❌ Erro ao criar tarefa: ' + result.error);
        }
    };

    const handleToggle = async (taskId, currentStatus) => {
        const result = await taskController.toggleTask(taskId, !currentStatus);
        if (result.success) {
            setRefreshKey(prev => prev + 1);
        }
    };

    const handleDelete = async (taskId) => {
        if (!window.confirm('Deseja realmente excluir esta tarefa?')) return;
        
        const result = await taskController.removeTask(taskId);
        if (result.success) {
            setRefreshKey(prev => prev + 1);
        }
    };

    const isOverdue = (dataLimite) => {
        const today = new Date().toISOString().split('T')[0];
        return dataLimite < today;
    };

    const isToday = (dataLimite) => {
        const today = new Date().toISOString().split('T')[0];
        return dataLimite === today;
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('pt-BR');
    };

    const getPriorityColor = (prioridade) => {
        switch(prioridade) {
            case 'alta': return '#ef4444';
            case 'media': return '#f59e0b';
            case 'baixa': return '#10b981';
            default: return '#6b7280';
        }
    };

    const getCategoryIcon = (categoria) => {
        const icons = {
            'Plantio': '🌱',
            'Colheita': '🌾',
            'Irrigação': '💧',
            'Aplicação': '🚜',
            'Manutenção': '🔧',
            'Compras': '🛒',
            'Vistoria': '👁️',
            'Geral': '📋'
        };
        return icons[categoria] || '📋';
    };

    if (!userId) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    ⚠️ Usuário não identificado. Faça login para acessar suas tarefas.
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Header com Estatísticas */}
            <div className={styles.header}>
                <h2>📝 Lembretes de Tarefas</h2>
                
                {stats && (
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <span className={styles.statLabel}>Total</span>
                            <span className={styles.statValue}>{stats.total}</span>
                        </div>
                        <div className={styles.statCard}>
                            <span className={styles.statLabel}>Pendentes</span>
                            <span className={styles.statValue} style={{color: '#f59e0b'}}>{stats.pendentes}</span>
                        </div>
                        <div className={styles.statCard}>
                            <span className={styles.statLabel}>Concluídas</span>
                            <span className={styles.statValue} style={{color: '#10b981'}}>{stats.concluidas}</span>
                        </div>
                        {stats.atrasadas > 0 && (
                            <div className={styles.statCard}>
                                <span className={styles.statLabel}>Atrasadas</span>
                                <span className={styles.statValue} style={{color: '#ef4444'}}>{stats.atrasadas}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Filtros */}
            <div className={styles.filters}>
                <button 
                    className={filter === 'todas' ? styles.filterActive : styles.filterBtn}
                    onClick={() => setFilter('todas')}
                >
                    Todas
                </button>
                <button 
                    className={filter === 'pendentes' ? styles.filterActive : styles.filterBtn}
                    onClick={() => setFilter('pendentes')}
                >
                    Pendentes
                </button>
                <button 
                    className={filter === 'concluidas' ? styles.filterActive : styles.filterBtn}
                    onClick={() => setFilter('concluidas')}
                >
                    Concluídas
                </button>
                
                <button 
                    className={styles.addBtn}
                    onClick={() => setShowForm(!showForm)}
                >
                    <FaPlus /> Nova Tarefa
                </button>
            </div>

            {/* Formulário */}
            {showForm && (
                <form className={styles.form} onSubmit={handleSubmit}>
                    <h3>Nova Tarefa</h3>
                    
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label>Título *</label>
                            <input
                                type="text"
                                value={formData.titulo}
                                onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                                placeholder="Ex: Aplicar herbicida no Talhão 3"
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Data Limite *</label>
                            <input
                                type="date"
                                value={formData.dataLimite}
                                onChange={(e) => setFormData({...formData, dataLimite: e.target.value})}
                                min={new Date().toISOString().split('T')[0]}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Categoria</label>
                            <select
                                value={formData.categoria}
                                onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                            >
                                <option value="Geral">Geral</option>
                                <option value="Plantio">Plantio</option>
                                <option value="Colheita">Colheita</option>
                                <option value="Irrigação">Irrigação</option>
                                <option value="Aplicação">Aplicação</option>
                                <option value="Manutenção">Manutenção</option>
                                <option value="Compras">Compras</option>
                                <option value="Vistoria">Vistoria</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Prioridade</label>
                            <select
                                value={formData.prioridade}
                                onChange={(e) => setFormData({...formData, prioridade: e.target.value})}
                            >
                                <option value="baixa">Baixa</option>
                                <option value="media">Média</option>
                                <option value="alta">Alta</option>
                            </select>
                        </div>

                        <div className={styles.formGroup} style={{gridColumn: '1 / -1'}}>
                            <label>Descrição</label>
                            <textarea
                                value={formData.descricao}
                                onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                                placeholder="Detalhes da tarefa..."
                                rows="3"
                            />
                        </div>
                    </div>

                    <div className={styles.formActions}>
                        <button type="submit" className={styles.submitBtn}>
                            Adicionar
                        </button>
                        <button 
                            type="button" 
                            className={styles.cancelBtn}
                            onClick={() => setShowForm(false)}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            )}

            {/* Lista de Tarefas */}
            <div className={styles.taskList}>
                {loading ? (
                    <div className={styles.loading}>Carregando tarefas...</div>
                ) : tasks.length === 0 ? (
                    <div className={styles.empty}>
                        <p>Nenhuma tarefa encontrada</p>
                        <button onClick={() => setShowForm(true)}>
                            Adicionar primeira tarefa
                        </button>
                    </div>
                ) : (
                    tasks.map(task => (
                        <div 
                            key={task.id} 
                            className={`${styles.taskCard} ${task.concluida ? styles.completed : ''}`}
                            style={{
                                borderLeft: `4px solid ${getPriorityColor(task.prioridade)}`
                            }}
                        >
                            <div className={styles.taskHeader}>
                                <div className={styles.taskTitle}>
                                    <button
                                        className={styles.checkBtn}
                                        onClick={() => handleToggle(task.id, task.concluida)}
                                    >
                                        {task.concluida && <FaCheck />}
                                    </button>
                                    
                                    <div>
                                        <h4>{task.titulo}</h4>
                                        {task.descricao && (
                                            <p className={styles.taskDesc}>{task.descricao}</p>
                                        )}
                                    </div>
                                </div>

                                <button
                                    className={styles.deleteBtn}
                                    onClick={() => handleDelete(task.id)}
                                    title="Excluir"
                                >
                                    <FaTrash />
                                </button>
                            </div>

                            <div className={styles.taskFooter}>
                                <div className={styles.taskMeta}>
                                    <span className={styles.category}>
                                        {getCategoryIcon(task.categoria)} {task.categoria}
                                    </span>
                                    
                                    <span 
                                        className={`${styles.date} ${
                                            isOverdue(task.dataLimite) && !task.concluida 
                                                ? styles.overdue 
                                                : isToday(task.dataLimite) && !task.concluida
                                                ? styles.today
                                                : ''
                                        }`}
                                    >
                                        <FaClock /> {formatDate(task.dataLimite)}
                                        {isOverdue(task.dataLimite) && !task.concluida && (
                                            <FaExclamationTriangle style={{marginLeft: '5px'}} />
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* ✅ ADICIONAR BOTÃO DE EXPORTAÇÃO NO FINAL */}
            {tasks.length > 0 && !loading && (
                <div className={styles.exportSection}>
                    <div className={styles.exportInfo}>
                        <span className={styles.exportIcon}>📋</span>
                        <div>
                            <h3>Exportar Tarefas</h3>
                            <p>Baixe sua lista de {tasks.length} tarefa(s) em PDF</p>
                        </div>
                    </div>
                    <PDFExportButton 
                        type="tasks"
                        data={tasks}
                        userName="Usuário" // ou pegar do contexto se tiver
                        label="📥 EXPORTAR TAREFAS EM PDF"
                        className={styles.exportButtonLarge}
                    />
                </div>
            )}
        </div>
    );
};

export default TaskList;