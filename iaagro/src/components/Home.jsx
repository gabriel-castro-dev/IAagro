import {React, useState, useEffect } from 'react';
import { useAuth } from '../authContext';
import { doSignOut } from '../firebase/auth';
import { useNavigate, Navigate } from 'react-router-dom';
import SuggestedItemsFooter from './Footer/SuggestedItemsFooter';
import ChatBot from './chatbot/ChatBot.jsx';
import { 
    getUserProfile, 
    saveUserProfile, 
    saveAgronomicalData,
    getUserAgronomicalDataForHistory,
    defaultProfileSettings 
} from '../services/profileService';
import { 
    getWeatherByCity, 
    getWeatherByCoordinates, 
    getCurrentLocation,
    formatTemperature,
    getWeatherIcon 
} from '../services/weatherService';
import { 
    getAddressByCEP, 
    formatCEP, 
    isValidCEP,
    applyCEPMask 
} from '../services/addressService';
import styles from './Home.module.css';
import { UserController } from '../controllers/UserController';
import { WeatherController } from '../controllers/WeatherController';
import { AddressController } from '../controllers/AddressController';
import TaskList from './Tasks/TaskList';
import ProductivityCalculator from './Calculators/ProductivityCalculator';
import IrrigationCalculator from './Calculators/IrrigationCalculator';
import ProductivityChartComponent from './Charts/ProductivityChart';
import CostAnalysisChart from './Charts/CostAnalysisChart';
import ActivityDistributionChart from './Charts/ActivityDistributionChart';
import CropComparisonChart from './Charts/CropComparisonChart';
import { TaskController } from '../controllers/TaskController';
import { checkAndSendTaskReminders, sendTestEmail, checkTasksWithoutEmail } from '../services/emailNotificationService';
import PDFExportButton from './PDF/PDFExportButton';

const Home = () => {
    // Controllers
    const userController = new UserController();
    const weatherController = new WeatherController();
    const addressController = new AddressController();
    // NOVO: Adicionar TaskController
    const taskController = new TaskController();
    
    const { currentUser, userLoggedIn } = useAuth();
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [userName, setUserName] = useState('Usuário');
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Estados para formulários existentes
    const [form, setForm] = useState({
        tipoCultura: '',
        aplicacoesManejo: '',
        dataPlantio: '',
        perdasObservadas: '',
        tipoSolo: '',
        custosOperacionais: '',
        dataColheita: '',
        rendimentoFinal: '',
        dataTipoAdubacao: '',
        producaoRentados: '',
        usoDefensivos: '',
        dardasObservadas: '',
        ocorrenciaPragas: '',
        custosOperacionaisSec: '',
        tipoIrrigacao: '',
    });

    const [profileSettings, setProfileSettings] = useState(defaultProfileSettings);
    const [historicoFilters, setHistoricoFilters] = useState({
        dataInicial: '',
        dataFinal: '',
        tipo: 'Todos',
        cultura: 'Todas',
    });
    const [historicoData, setHistoricoData] = useState([]);
    const [filteredHistoricoData, setFilteredHistoricoData] = useState([]);
    const [loadingHistorico, setLoadingHistorico] = useState(false);

    // NOVOS ESTADOS PARA CLIMA E CEP
    const [weatherData, setWeatherData] = useState(null);
    const [loadingWeather, setLoadingWeather] = useState(false);
    const [weatherError, setWeatherError] = useState(null);
    const [loadingCEP, setLoadingCEP] = useState(false);
    const [cepError, setCepError] = useState(null);

    // NOVOS ESTADOS PARA NOTIFICAÇÕES
    const [lastNotificationCheck, setLastNotificationCheck] = useState(
        localStorage.getItem('lastTaskNotificationCheck') || null
    );
    const [notificationStatus, setNotificationStatus] = useState(null);

    // NOVOS ESTADOS PARA TAREFAS
    const [tasks, setTasks] = useState([]);
    const [loadingTasks, setLoadingTasks] = useState(false);

    // Função para carregar dados do histórico (CORRIGIDA)
    const loadHistoricoData = async () => {
        if (!currentUser?.uid) {
            console.log('Usuário não identificado para carregar histórico');
            return;
        }
        
        try {
            setLoadingHistorico(true);
            console.log('Carregando dados do histórico para usuário:', currentUser.uid);
            
            const data = await getUserAgronomicalDataForHistory(currentUser.uid);
            console.log('Dados do histórico carregados:', data);
            
            // CORRIGIDO: Extrair dados brutos (dadosCompletos) para os gráficos
            const dadosBrutos = data.map(item => ({
                id: item.id,
                ...item.dadosCompletos // ✅ Usa os dados originais do Firebase
            }));
            
            console.log('📊 Dados brutos extraídos para gráficos:', dadosBrutos);
            
            // Para a tabela do histórico (formatado)
            setFilteredHistoricoData(data);
            
            // Para os gráficos (dados brutos)
            setHistoricoData(dadosBrutos);
            
            if (data.length === 0) {
                console.log('Nenhum dado encontrado no histórico');
            } else {
                console.log(`${data.length} registros carregados no histórico`);
            }
            
        } catch (error) {
            console.error('Erro ao carregar histórico:', error);
            setHistoricoData([]);
            setFilteredHistoricoData([]);
        } finally {
            setLoadingHistorico(false);
        }
    };

    // NOVA FUNÇÃO: Carregar dados do clima baseado no CEP do perfil
    const loadWeatherData = async () => {
        if (!profileSettings?.cep) {
            console.log('CEP não encontrado no perfil');
            return;
        }

        try {
            setLoadingWeather(true);
            console.log('🌤️ Carregando dados do clima para CEP:', profileSettings.cep);

            // CORRIGIDO: Usar getWeatherByCEP ao invés de getWeatherByCity
            const result = await weatherController.getWeatherByCEP(profileSettings.cep);

            if (result.success) {
                setWeatherData(result.data);
                console.log('✅ Dados do clima carregados:', result.data);
            } else {
                console.error('❌ Erro ao carregar clima:', result.error);
                
                // FALLBACK: Tentar buscar pela cidade do endereço
                if (profileSettings.cidade) {
                    console.log('🔄 Tentando buscar por cidade:', profileSettings.cidade);
                    const cityResult = await weatherController.getWeatherByCity(profileSettings.cidade);
                    
                    if (cityResult.success) {
                        setWeatherData(cityResult.data);
                        console.log('✅ Clima carregado por cidade');
                    } else {
                        setWeatherData(null);
                    }
                } else {
                    setWeatherData(null);
                }
            }
        } catch (error) {
            console.error('❌ Erro ao carregar dados do clima:', error);
            setWeatherData(null);
        } finally {
            setLoadingWeather(false);
        }
    };

 // NOVA FUNÇÃO: Buscar endereço por CEP com preenchimento automático (CORRIGIDA)
const handleCEPChange = async (e) => {
    const inputValue = e.target.value;
    
    // Aplicar máscara enquanto digita
    const maskedValue = applyCEPMask(inputValue);
    
    // Atualizar o campo imediatamente (permite edição)
    setProfileSettings(prevSettings => ({
        ...prevSettings,
        cep: maskedValue
    }));
    
    // Limpar erros anteriores
    setCepError(null);
    
    // Extrair apenas números
    const cleanCEP = inputValue.replace(/\D/g, '');
    
    // Se tiver 8 dígitos, buscar automaticamente
    if (cleanCEP.length === 8) {
        try {
            setLoadingCEP(true);
            
            console.log('🔍 Buscando CEP:', cleanCEP);
            
            // Usar AddressController
            const result = await addressController.searchAddressByCEP(cleanCEP);
            
            if (result.success) {
                const addressData = result.data;
                
                // Preencher campos automaticamente
                setProfileSettings(prevSettings => ({
                    ...prevSettings,
                    cep: addressData.cep, // CEP formatado
                    endereco: addressData.endereco,
                    cidade: addressData.cidade,
                    estado: addressData.estado
                }));
                
                console.log('✅ CEP encontrado:', addressData);
                
                // Feedback visual de sucesso
                setCepError(null);
            } else {
                setCepError(result.error || 'CEP não encontrado');
                console.log('❌ CEP não encontrado:', result.error);
            }
        } catch (error) {
            console.error('❌ Erro ao buscar CEP:', error);
            setCepError('Erro ao buscar CEP. Tente novamente.');
        } finally {
            setLoadingCEP(false);
        }
    } else if (cleanCEP.length > 8) {
        // Limitar a 8 dígitos
        const limitedValue = applyCEPMask(cleanCEP.substring(0, 8));
        setProfileSettings(prevSettings => ({
            ...prevSettings,
            cep: limitedValue
        }));
    }
};

    // Carregar dados do usuário quando logar (existente)
    useEffect(() => {
        const loadUserData = async () => {
            if (currentUser?.uid) {
                try {
                    setLoading(true);
                    console.log('Carregando dados do usuário:', currentUser.uid);
                    
                    // Usar UserController em vez de chamada direta
                    const userProfile = await userController.loadUserProfile(
                        currentUser.uid, 
                        currentUser.email
                    );
                    
                    setProfileSettings(userProfile);
                    setTheme(userProfile.tema || 'light');
                    
                    if (userProfile.nomeCompleto) {
                        setUserName(userProfile.nomeCompleto.split(' ')[0].toUpperCase());
                    } else {
                        setUserName(currentUser.email.split('@')[0].toUpperCase());
                    }
                    
                    console.log('Dados carregados com sucesso:', userProfile);
                    await loadHistoricoData();
                    
                } catch (error) {
                    console.error('Erro ao carregar dados do usuário:', error);
                    setUserName(currentUser.email.split('@')[0].toUpperCase());
                } finally {
                    setLoading(false);
                }
            }
        };

        loadUserData();
    }, [currentUser, userLoggedIn]);

    // Aplicar tema (existente)
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Carregar histórico quando a página for acessada (existente)
    useEffect(() => {
        if (currentPage === 'historico' && currentUser?.uid) {
            loadHistoricoData();
        }
    }, [currentPage, currentUser]);

    // NOVO: Carregar clima quando a página de análises for acessada (prioriza CEP)
    useEffect(() => {
        if (currentPage === 'analises') {
            loadWeatherData();
        }
    }, [currentPage, profileSettings.cep, profileSettings.cidade, profileSettings.estado]);

    // NOVO: Carregar clima quando os dados terminarem de carregar (prioriza CEP)
    useEffect(() => {
        if (!loading && currentPage === 'analises' && (profileSettings.cep || profileSettings.cidade)) {
            console.log('🌡️ Dados carregados, buscando clima por CEP ou cidade...');
            loadWeatherData();
        }
    }, [loading]);

    // NOVO: Atualizar clima quando CEP mudar (mesmo em outras páginas)
    useEffect(() => {
        if (profileSettings.cep && profileSettings.cep.length === 9) { // CEP completo com máscara
            console.log('🔄 CEP mudou, atualizando clima...');
            loadWeatherData();
        }
    }, [profileSettings.cep]);

    // Funções existentes permanecem iguais
    const handleLogout = async () => {
        try {
            await doSignOut();
            navigate('/', { replace: true });
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    };

    /**
     * Verificação automática de tarefas ao fazer login
     * Roda apenas 1x por dia para não sobrecarregar
     */
    useEffect(() => {
        const checkTasksAutomatically = async () => {
            // Só executa se:
            // 1. Usuário está logado
            // 2. Perfil carregou
            // 3. Não está mais carregando
            // 4. Ainda não checou hoje
            if (!currentUser?.uid || !profileSettings?.email || loading) {
                return;
            }

            const today = new Date().toDateString();
            const lastCheck = localStorage.getItem('lastTaskNotificationCheck');

            // Se já checou hoje, não faz nada
            if (lastCheck === today) {
                console.log('✅ Verificação de tarefas já foi feita hoje');
                return;
            }

            // Aguardar 5 segundos após o login para não interferir no carregamento
            const timeoutId = setTimeout(async () => {
                try {
                    console.log('🔄 Verificação automática de tarefas iniciada...');
                    setNotificationStatus('Verificando tarefas...');

                    const result = await checkAndSendTaskReminders(currentUser.uid);

                    if (result.success) {
                        if (result.count > 0) {
                            console.log(`✅ ${result.count} email(s) de lembrete enviado(s)`);
                            setNotificationStatus(`✅ ${result.count} lembrete(s) enviado(s) por email`);
                            
                            // Mostrar notificação visual (opcional)
                            showNotificationToast(
                                `📧 ${result.count} lembrete(s) de tarefas enviado(s) para ${result.email}`,
                                'success'
                            );
                        } else {
                            console.log('ℹ️ Nenhuma tarefa vencendo nas próximas 24h');
                            setNotificationStatus(null);
                        }

                        // Marca que já checou hoje
                        localStorage.setItem('lastTaskNotificationCheck', today);
                        setLastNotificationCheck(today);

                    } else {
                        console.error('❌ Erro ao verificar tarefas:', result.error);
                        setNotificationStatus(`❌ Erro: ${result.error}`);
                    }

                } catch (error) {
                    console.error('❌ Erro na verificação automática:', error);
                    setNotificationStatus(null);
                }
            }, 5000); // 5 segundos de delay

            // Cleanup: cancela o timeout se o componente desmontar
            return () => clearTimeout(timeoutId);
        };

        checkTasksAutomatically();

    }, [currentUser?.uid, profileSettings?.email, loading]); // Dependências

    // Carregar tarefas (se não existir)
    const loadTasks = async () => {
        if (!currentUser?.uid) return;
        
        try {
            setLoadingTasks(true);
            const result = await taskController.getTasks(currentUser.uid);
            
            if (result.success) {
                setTasks(result.data || []);
            }
        } catch (error) {
            console.error('Erro ao carregar tarefas:', error);
        } finally {
            setLoadingTasks(false);
        }
    };

    // Carregar tarefas quando a página de tarefas for acessada
    useEffect(() => {
        if (currentUser?.uid && currentPage === 'tasks') {
            loadTasks();
        }
    }, [currentUser?.uid, currentPage]);

    if (!userLoggedIn) {
        return <Navigate to="/" replace={true} />;
    }

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}>
                    <div className={styles.spinner}></div>
                    <p>Carregando seus dados...</p>
                </div>
            </div>
        );
    }

    const goToPage = (page) => {
        setCurrentPage(page);
    };

    // Funções existentes (saveAgronomicalDataHandler, saveProfileSettingsHandler, etc.) permanecem iguais
    const saveAgronomicalDataHandler = async (e) => {
        e.preventDefault();
        
        if (!currentUser?.uid) {
            alert('Erro: Usuário não identificado');
            return;
        }

        try {
            setSaving(true);
            console.log('Salvando dados agronômicos:', form);
            
            await saveAgronomicalData(currentUser.uid, form);
            await loadHistoricoData();
            
            setForm({
                tipoCultura: '',
                aplicacoesManejo: '',
                dataPlantio: '',
                perdasObservadas: '',
                tipoSolo: '',
                custosOperacionais: '',
                dataColheita: '',
                rendimentoFinal: '',
                dataTipoAdubacao: '',
                producaoRentados: '',
                usoDefensivos: '',
                dardasObservadas: '',
                ocorrenciaPragas: '',
                custosOperacionaisSec: '',
                tipoIrrigacao: '',
            });
            
            alert('Dados agronômicos salvos com sucesso no banco!');
        } catch (error) {
            console.error('Erro ao salvar dados agronômicos:', error);
            alert('Erro ao salvar dados: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const saveProfileSettingsHandler = async (e) => {
        e.preventDefault();
        
        try {
            setSaving(true);
            
            // Usar UserController
            const result = await userController.saveUserProfile(currentUser.uid, profileSettings);
            
            if (result.success) {
                alert('Configurações salvas com sucesso!');
                console.log('Perfil salvo:', result.data);
            } else {
                alert(`Erro ao salvar: ${result.error}`);
                console.error('Erro ao salvar perfil:', result.error);
            }
        } catch (error) {
            console.error('Erro ao salvar configurações do perfil:', error);
            alert('Erro ao salvar configurações. Tente novamente.');
        } finally {
            setSaving(false);
        }
    };

    const handleThemeChange = (newTheme) => {
        setProfileSettings(prev => ({ ...prev, tema: newTheme }));
        setTheme(newTheme);
    };

    const filterHistorico = () => {
        let filtered = historicoData;

        if (historicoFilters.dataInicial) {
            filtered = filtered.filter(item => {
                const itemDate = new Date(item.data.split('/').reverse().join('-'));
                const filterStart = new Date(historicoFilters.dataInicial);
                return itemDate >= filterStart;
            });
        }

        if (historicoFilters.dataFinal) {
            filtered = filtered.filter(item => {
                const itemDate = new Date(item.data.split('/').reverse().join('-'));
                const filterEnd = new Date(historicoFilters.dataFinal);
                return itemDate <= filterEnd;
            });
        }

        if (historicoFilters.tipo && historicoFilters.tipo !== 'Todos') {
            filtered = filtered.filter(item => 
                item.tipo.toLowerCase().includes(historicoFilters.tipo.toLowerCase())
            );
        }

        if (historicoFilters.cultura && historicoFilters.cultura !== 'Todas') {
            filtered = filtered.filter(item => 
                item.cultura.toLowerCase() === historicoFilters.cultura.toLowerCase()
            );
        }

        setFilteredHistoricoData(filtered);
    };

    const handleFormChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleProfileChange = (field, value) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setProfileSettings(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setProfileSettings(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleFilterChange = (field, value) => {
        setHistoricoFilters(prev => ({ ...prev, [field]: value }));
    };

    const connectSocialMedia = (platform) => {
        alert(`Conectando com ${platform}...`);
    };

    /**
     * Mostrar notificação toast (visual feedback)
     */
    const showNotificationToast = (message, type = 'info') => {
        const toast = document.createElement('div');
        toast.className = styles.notificationToast;
        toast.setAttribute('data-type', type);
        toast.innerHTML = `
            <div class="${styles.toastContent}">
                <span class="${styles.toastIcon}">
                    ${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
                </span>
                <p class="${styles.toastMessage}">${message}</p>
            </div>
        `;

        document.body.appendChild(toast);

        // Animação de entrada
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        }, 100);

        // Remover após 5 segundos
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 5000);
    };

    /**
     * Função manual para testar emails (para botão)
     */
    const handleTestEmailNotification = async () => {
        if (!currentUser?.uid) {
            alert('❌ Usuário não identificado');
            return;
        }

        if (!profileSettings?.email) {
            alert('❌ Email não encontrado no perfil');
            return;
        }

        try {
            setNotificationStatus('Enviando email de teste...');

            const result = await sendTestEmail(
                profileSettings.email,
                profileSettings.nomeCompleto || userName
            );

            if (result.success) {
                alert(`✅ Email de teste enviado para ${profileSettings.email}\n\nVerifique sua caixa de entrada!`);
                setNotificationStatus('✅ Email de teste enviado!');
                
                showNotificationToast(
                    `📧 Email de teste enviado para ${profileSettings.email}`,
                    'success'
                );
            } else {
                alert(`❌ Erro ao enviar email: ${result.error}`);
                setNotificationStatus(`❌ Erro: ${result.error}`);
            }

        } catch (error) {
            console.error('Erro ao enviar email de teste:', error);
            alert('❌ Erro ao enviar email. Verifique o console.');
            setNotificationStatus(null);
        }
    };

    /**
     * Verificar tarefas manualmente (APENAS MOSTRA INFO - NÃO ENVIA EMAIL)
     */
    const handleManualTaskCheck = async () => {
        if (!currentUser?.uid) {
            alert('❌ Usuário não identificado');
            return;
        }

        try {
            setNotificationStatus('Verificando tarefas...');

            // NOVA FUNÇÃO: Apenas verifica, NÃO envia email
            const result = await checkTasksWithoutEmail(currentUser.uid);

            if (result.success) {
                // Montar mensagem detalhada
                let alertMessage = result.message + '\n\n';

                if (result.tasks && result.tasks.length > 0) {
                    alertMessage += '📋 TAREFAS ENCONTRADAS:\n\n';
                    result.tasks.forEach((task, index) => {
                        const status = task.notificada ? '✅ Notificada' : '⏳ Pendente';
                        alertMessage += `${index + 1}. ${task.titulo}\n`;
                        alertMessage += `   📅 Vence: ${formatDateBR(task.dataLimite)}\n`;
                        alertMessage += `   🎯 Prioridade: ${task.prioridade.toUpperCase()}\n`;
                        alertMessage += `   ${status}\n\n`;
                    });

                    if (result.pendingCount > 0) {
                        alertMessage += `\n💡 Dica: O sistema enviará emails automaticamente quando você fizer login.\n`;
                        alertMessage += `Ou use "Enviar Email de Teste" para testar o sistema agora.`;
                    }
                }

                alert(alertMessage);
                setNotificationStatus(result.message);

            } else {
                alert(`❌ Erro: ${result.error}`);
                setNotificationStatus(`❌ Erro: ${result.error}`);
            }

        } catch (error) {
            console.error('Erro ao verificar tarefas:', error);
            alert('❌ Erro ao verificar tarefas. Verifique o console.');
            setNotificationStatus(null);
        }
    };

    /**
     * Formatar data para exibição (DD/MM/YYYY)
     */
    const formatDateBR = (dateString) => {
        if (!dateString) return 'N/A';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    return (
        <div className={styles.homeWrapper} data-theme={theme}>
            <div className={styles.container}>
                {/* Sidebar - permanece igual */}
                <nav className={styles.sidebar}>
                    <div className={styles.logoContainer}>
                        <img 
                            src="/logoSite.png" 
                            alt="IAgro - Inteligência Artificial Agrícola" 
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMTIwIDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTIwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjYTZiZDhjIiByeD0iOCIvPgo8dGV4dCB4PSI2MCIgeT0iNDUiIGZvcnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JQWdybzwvdGV4dD4KPHN2ZyB4PSIyMCIgeT0iMjAiIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgZmlsbD0id2hpdGUiPgo8cGF0aCBkPSJNMTIgMkw0IDlsOCA3IDgtN3ptMCAxNWMtNC40MiAwLTgtMy41OC04LThzMy41OC04IDgtOCA4IDMuNTggOCA4LTMuNTggOC04IDh6bTAtMTRjLTMuMzEgMC02IDIuNjktNiA2czIuNjkgNiA2IDYgNi0yLjY5IDYtNi0yLjY5LTYtNi02eiIvPgo8L3N2Zz4KPC9zdmc+';
                            }}
                        />
                    </div>

                    <ul className={styles.navigationList}>
                        <li className={styles.navigationItem}>
                            <button 
                                onClick={() => goToPage('dashboard')}
                                className={`${styles.navigationButton} ${currentPage === 'dashboard' ? styles.active : ''}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={styles.navigationIcon}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                                </svg>
                                Dashboard
                            </button>
                        </li>
                        <li className={styles.navigationItem}>
                            <button 
                                onClick={() => goToPage('meus-dados')}
                                className={`${styles.navigationButton} ${currentPage === 'meus-dados' ? styles.active : ''}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={styles.navigationIcon}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-5a2 2 0 01-2-2z" />
                                </svg>
                                Meus dados
                            </button>
                        </li>
                        <li className={styles.navigationItem}>
                            <button 
                                onClick={() => goToPage('analises')}
                                className={`${styles.navigationButton} ${currentPage === 'analises' ? styles.active : ''}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={styles.navigationIcon}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 012 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Análises
                            </button>
                        </li>
                        <li className={styles.navigationItem}>
                            <button 
                                onClick={() => goToPage('historico')}
                                className={`${styles.navigationButton} ${currentPage === 'historico' ? styles.active : ''}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={styles.navigationIcon}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Histórico
                            </button>
                        </li>
                        <li className={styles.navigationItem}>
                            <button 
                                onClick={() => goToPage('perfil')}
                                className={`${styles.navigationButton} ${currentPage === 'perfil' ? styles.active : ''}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={styles.navigationIcon}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Perfil
                            </button>
                        </li>
                    </ul>
                </nav>

                {/* Main content */}
                <main className={styles.mainContent}>
                    {/* Top bar - permanece igual */}
                    <div className={styles.topBar}>
                        <button 
                            onClick={() => alert('Não há novas notificações no momento.')}
                            className={styles.topButton}
                            aria-label="Notificações"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                            </svg>
                        </button>
                        <button 
                            onClick={() => goToPage('perfil')}
                            className={styles.topButton}
                            aria-label="Perfil"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                        </button>
                    </div>

                    {/* Page content */}
                    <section className={styles.pageContent}>
                        {/* Dashboard - COM DESTAQUE PARA CHATBOT */}
                        {currentPage === 'dashboard' && (
                            <div className={styles.dashboardContainer}>
                                <h1 className={styles.welcomeTitle}>
                                    🌾 Bem-vindo ao IAgro, {userName}!
                                </h1>
                              

                                {/* Card de Assistente IA (existente) */}
                                <div className={styles.aiAssistantCard}>
                                    <div className={styles.aiAssistantHeader}>
                                        <div className={styles.aiAssistantIcon}>🤖</div>
                                        <div>
                                            <h2>Assistente IA Agronômico</h2>
                                            <p>Seu consultor agrícola pessoal disponível 24/7</p>
                                        </div>
                                    </div>

                                    <div className={styles.aiAssistantContent}>
                                        <p>💬 <strong>Converse comigo sobre:</strong></p>
                                        <div className={styles.aiCapabilities}>
                                            <div className={styles.aiCapability}>
                                                <span className={styles.aiCapabilityIcon}>🌾</span>
                                                <div>
                                                    <strong>Recomendações de Cultivo</strong>
                                                    <p>Descubra quais culturas são ideais para sua região e clima</p>
                                                </div>
                                            </div>
                                            
                                            <div className={styles.aiCapability}>
                                                <span className={styles.aiCapabilityIcon}>📊</span>
                                                <div>
                                                    <strong>Análise de Histórico</strong>
                                                    <p>Insights baseados nos seus {historicoData.length} registros salvos</p>
                                                </div>
                                            </div>
                                            
                                            <div className={styles.aiCapability}>
                                                <span className={styles.aiCapabilityIcon}>☀️</span>
                                                <div>
                                                    <strong>Alertas Climáticos</strong>
                                                    <p>Interpretação das condições meteorológicas para suas atividades</p>
                                                </div>
                                            </div>
                                            
                                            <div className={styles.aiCapability}>
                                                <span className={styles.aiCapabilityIcon}>💰</span>
                                                <div>
                                                    <strong>Otimização de Custos</strong>
                                                    <p>Sugestões para reduzir despesas e aumentar rentabilidade</p>
                                                </div>
                                            </div>
                                        </div>

                                        <button 
                                            className={styles.openChatButton}
                                            onClick={() => {
                                                // O botão flutuante será visível, mas vamos dar um destaque
                                                const floatingButton = document.querySelector(`.${styles.floatingButton}`);
                                                if (floatingButton) {
                                                    floatingButton.style.animation = 'pulse 0.5s ease-in-out 3';
                                                    floatingButton.scrollIntoView({ behavior: 'smooth', block: 'end' });
                                                }
                                            }}
                                        >
                                            💬 Abrir Assistente (clique no botão flutuante →)
                                        </button>

                                        <div className={styles.aiQuickStart}>
                                            <p><strong>🎯 Perguntas rápidas para começar:</strong></p>
                                            <ul>
                                                <li>"Qual a melhor época para plantar soja na minha região?"</li>
                                                <li>"Analise meu histórico de plantio dos últimos 6 meses"</li>
                                                <li>"Como está o clima hoje para aplicação de defensivos?"</li>
                                                <li>"Quais culturas têm melhor rentabilidade atualmente?"</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Estatísticas Rápidas */}
                                {historicoData.length > 0 && (
                                    <div className={styles.quickStats}>
                                        <div className={styles.statCard}>
                                            <span className={styles.statIcon}>📈</span>
                                            <div>
                                                <strong>{historicoData.length}</strong>
                                                <p>Registros Totais</p>
                                            </div>
                                        </div>
                                        
                                        <div className={styles.statCard}>
                                            <span className={styles.statIcon}>🌾</span>
                                            <div>
                                                <strong>{new Set(historicoData.map(item => item.cultura)).size}</strong>
                                                <p>Culturas Diferentes</p>
                                            </div>
                                        </div>
                                        
                                        <div className={styles.statCard}>
                                            <span className={styles.statIcon}>📅</span>
                                            <div>
                                                <strong>{historicoData[0]?.data || 'N/A'}</strong>
                                                <p>Última Atividade</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Meus Dados - permanece igual */}
                        {currentPage === 'meus-dados' && (
                            <div className={styles.formContainer}>
                                <h2 className={styles.formTitle}>Adicionar Dados Agronômicos</h2>
                                <form onSubmit={saveAgronomicalDataHandler} className={styles.form}>
                                    <fieldset className={styles.fieldset}>
                                        <legend className={styles.legend}>Dados da Cultura</legend>
                                        <div className={styles.formGrid}>
                                            <select 
                                                value={form.tipoCultura}
                                                onChange={(e) => handleFormChange('tipoCultura', e.target.value)}
                                                className={styles.formSelect}
                                                required
                                            >
                                                <option value="" disabled>Selecione o tipo de cultura</option>
                                                <option value="soja">Soja</option>
                                                <option value="milho">Milho</option>
                                                <option value="trigo">Trigo</option>
                                                <option value="feijao">Feijão</option>
                                            </select>
                                            
                                            <select 
                                                value={form.tipoSolo}
                                                onChange={(e) => handleFormChange('tipoSolo', e.target.value)}
                                                className={styles.formSelect}
                                                required
                                            >
                                                <option value="" disabled>Tipo de solo</option>
                                                <option value="argiloso">Argiloso</option>
                                                <option value="arenoso">Arenoso</option>
                                                <option value="humoso">Humoso</option>
                                            </select>

                                            <input 
                                                value={form.dataPlantio}
                                                onChange={(e) => handleFormChange('dataPlantio', e.target.value)}
                                                type="date" 
                                                className={styles.formInput}
                                                title="Data do plantio"
                                            />

                                            <input 
                                                value={form.dataColheita}
                                                onChange={(e) => handleFormChange('dataColheita', e.target.value)}
                                                type="date"
                                                className={styles.formInput}
                                                title="Data da colheita"
                                            />

                                            <input 
                                                value={form.custosOperacionais}
                                                onChange={(e) => handleFormChange('custosOperacionais', e.target.value)}
                                                placeholder="Custos operacionais (R$)" 
                                                className={styles.formInput}
                                                type="number"
                                                step="0.01"
                                            />

                                            <input 
                                                value={form.rendimentoFinal}
                                                onChange={(e) => handleFormChange('rendimentoFinal', e.target.value)}
                                                placeholder="Rendimento final (kg/ha)" 
                                                className={styles.formInput}
                                                type="number"
                                            />
                                        </div>
                                    </fieldset>

                                    <fieldset className={styles.fieldset}>
                                        <legend className={styles.legend}>Manejo e Aplicações</legend>
                                        <div className={styles.formGrid}>
                                            <input 
                                                value={form.dataTipoAdubacao}
                                                onChange={(e) => handleFormChange('dataTipoAdubacao', e.target.value)}
                                                placeholder="Tipo de adubação aplicada" 
                                                className={styles.formInput}
                                            />

                                            <input 
                                                value={form.usoDefensivos}
                                                onChange={(e) => handleFormChange('usoDefensivos', e.target.value)}
                                                placeholder="Defensivos utilizados" 
                                                className={styles.formInput}
                                            />

                                            <input 
                                                value={form.ocorrenciaPragas}
                                                onChange={(e) => handleFormChange('ocorrenciaPragas', e.target.value)}
                                                placeholder="Ocorrência de pragas/doenças" 
                                                className={styles.formInput}
                                            />

                                            <input 
                                                value={form.tipoIrrigacao}
                                                onChange={(e) => handleFormChange('tipoIrrigacao', e.target.value)}
                                                placeholder="Sistema de irrigação" 
                                                className={styles.formInput}
                                            />
                                        </div>
                                    </fieldset>

                                    <div className={styles.buttonContainer}>
                                        <button 
                                            type="submit" 
                                            className={styles.submitButton}
                                            disabled={saving}
                                        >
                                            {saving ? 'Salvando...' : 'Salvar Dados'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* ANÁLISES COM CLIMA + GRÁFICOS */}
                        {currentPage === 'analises' && (
                            <div className={styles.pageContent}>
                                <div className={styles.analyticsContainer}>
                                    <h2 className={styles.formTitle}>Análises Agronômicas</h2>
                                    <div className={styles.analyticsGrid}>
                                        <section className={styles.analyticsSection}>
                                            <h3 className={styles.sectionTitle}>Condições Climáticas</h3>
                                            
                                            {loadingWeather ? (
                                                <div className={styles.loadingContainer}>
                                                    <div className={styles.loadingSpinner}>
                                                        <div className={styles.spinner}></div>
                                                        <p>Carregando dados do clima...</p>
                                                    </div>
                                                </div>
                                            ) : weatherError ? (
                                                <div className={styles.weatherError}>
                                                    <p>🌍 {weatherError}</p>
                                                    {weatherError.includes('preencha') && (
                                                        <button 
                                                            onClick={() => goToPage('perfil')}
                                                            className={styles.profileLinkButton}
                                                        >
                                                            📍 Ir para Perfil
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={loadWeatherData}
                                                        className={styles.refreshButton}
                                                    >
                                                        🔄 Tentar novamente
                                                    </button>
                                                </div>
                                            ) : weatherData ? (
                                                <div className={styles.weatherInfo}>
                                                    <div className={styles.weatherHeader}>
                                                        <img 
                                                            src={getWeatherIcon(weatherData.tempIcon)}
                                                            alt={weatherData.description}
                                                            className={styles.weatherIcon}
                                                        />
                                                        <div className={styles.weatherMainInfo}>
                                                            <h4>{weatherData.city}, {weatherData.country}</h4>
                                                            <p className={styles.weatherTemp}>
                                                                {formatTemperature(weatherData.temp)}
                                                            </p>
                                                            <p className={styles.weatherDescription}>
                                                                {weatherData.description.charAt(0).toUpperCase() + weatherData.description.slice(1)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className={styles.weatherDetails}>
                                                        <div className={styles.weatherDetailItem}>
                                                            <span>🌡️ Máxima:</span>
                                                            <span>{formatTemperature(weatherData.tempMax)}</span>
                                                        </div>
                                                        <div className={styles.weatherDetailItem}>
                                                            <span>🌡️ Mínima:</span>
                                                            <span>{formatTemperature(weatherData.tempMin)}</span>
                                                        </div>
                                                        <div className={styles.weatherDetailItem}>
                                                            <span>💧 Umidade:</span>
                                                            <span>{weatherData.humidity}%</span>
                                                        </div>
                                                        <div className={styles.weatherDetailItem}>
                                                            <span>🌪️ Vento:</span>
                                                            <span>{weatherData.windSpeed.toFixed(1)} m/s</span>
                                                        </div>
                                                        <div className={styles.weatherDetailItem}>
                                                            <span>👁️ Visibilidade:</span>
                                                            <span>{weatherData.visibility} km</span>
                                                        </div>
                                                        <div className={styles.weatherDetailItem}>
                                                            <span>🌅 Pressão:</span>
                                                            <span>{weatherData.pressure} hPa</span>
                                                        </div>
                                                    </div>

                                                    {/* Alertas inteligentes em seção separada */}
                                                    {weatherData && (
                                                        <div className={styles.weatherAlertsSection}>
                                                            <h4 className={styles.weatherAlertsTitle}>
                                                                Alertas Agronômicos
                                                            </h4>
                                                            <div className={styles.weatherAlerts}>
                                                                {weatherData.humidity > 80 && (
                                                                    <div className={styles.weatherAlert} data-type="humidity">
                                                                        <strong>Alta Umidade:</strong> {weatherData.humidity}% pode favorecer doenças fúngicas. Considere aplicação preventiva de fungicidas.
                                                                    </div>
                                                                )}
                                                                
                                                                {weatherData.windSpeed > 5 && (
                                                                    <div className={styles.weatherAlert} data-type="wind">
                                                                        <strong>Ventos Fortes:</strong> {weatherData.windSpeed.toFixed(1)} m/s - evite pulverizações para melhor eficiência dos produtos.
                                                                    </div>
                                                                )}
                                                                
                                                                {weatherData.temp > 35 && (
                                                                    <div className={styles.weatherAlert} data-type="temperature-high">
                                                                        <strong>Temperatura Elevada:</strong> Risco de stress térmico nas plantas. Aumente a frequência de irrigação se possível.
                                                                    </div>
                                                                )}
                                                                
                                                                {weatherData.temp < 5 && (
                                                                    <div className={styles.weatherAlert} data-type="temperature-low">
                                                                        <strong>Risco de Geada:</strong> Proteja cultivos sensíveis e monitore temperaturas durante a madrugada.
                                                                    </div>
                                                                )}
                                                                
                                                                {weatherData.humidity < 30 && (
                                                                    <div className={styles.weatherAlert} data-type="humidity">
                                                                        <strong>Baixa Umidade:</strong> {weatherData.humidity}% - considere irrigação adicional para manter solo úmido.
                                                                    </div>
                                                                )}
                                                                
                                                                {/* Alerta quando condições estão ideais */}
                                                                {weatherData.humidity >= 30 && weatherData.humidity <= 80 && 
                                                                 weatherData.temp >= 15 && weatherData.temp <= 30 && 
                                                                 weatherData.windSpeed <= 5 && (
                                                                    <div className={styles.weatherAlert} data-type="humidity">
                                                                        <strong>Condições Ideais:</strong> Temperatura, umidade e vento em níveis adequados para atividades agrícolas.
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    <button 
                                                        onClick={loadWeatherData}
                                                        className={styles.refreshButton}
                                                        style={{ marginTop: '1rem' }}
                                                    >
                                                        🔄 Atualizar dados
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className={styles.weatherError}>
                                                    <p>🌍 Para ver as condições climáticas, preencha sua cidade no perfil.</p>
                                                    <button 
                                                        onClick={() => goToPage('perfil')}
                                                        className={styles.profileLinkButton}
                                                    >
                                                        📍 Ir para Perfil
                                                    </button>
                                                </div>
                                            )}
                                        </section>

                                        <section className={styles.analyticsSection}>
                                            <h3 className={styles.sectionTitle}>Produtividade Mensal</h3>
                                            <ProductivityChartComponent historicoData={historicoData} />
                                        </section>
                                    </div>
                                </div>
                                
                                {/* ========================================
                                    SEÇÃO DE GRÁFICOS - TODOS JUNTOS
                                   ======================================== */}
                                
                                {/* 1️⃣ Gráfico Principal: Produtividade e Custos */}
                                <ProductivityChartComponent historicoData={historicoData} />
                                
                                {/* 2️⃣ Análise de Custos por Categoria */}
                                <CostAnalysisChart historicoData={historicoData} />
                                
                                {/* 3️⃣ Distribuição de Atividades (Pizza) */}
                                <ActivityDistributionChart historicoData={historicoData} />
                                
                                {/* 4️⃣ Comparação entre Culturas (Radar) */}
                                <CropComparisonChart historicoData={historicoData} />
                                
                                {/* ========================================
                                    SEÇÃO DE CALCULADORAS - APÓS GRÁFICOS
                                   ======================================== */}
                                
                                {/* Calculadora de Produtividade */}
                                <ProductivityCalculator />
                                
                                {/* Calculadora de Irrigação */}
                                <IrrigationCalculator />
                            </div>
                        )}

                        {/* Histórico - permanece igual */}
                        {currentPage === 'historico' && (
                            <div className={styles.pageContent}>
                                <div className={styles.historyContainer}>
                                    <h2 className={styles.formTitle}>📊 Histórico de Produtividade</h2>
                                    
                                    {/* Filtros existentes... */}
                                    <form className={styles.filterForm} onSubmit={(e) => { e.preventDefault(); filterHistorico(); }}>
                                        <div className={styles.filterGroup}>
                                            <label className={styles.filterLabel}>Data inicial</label>
                                            <input 
                                                value={historicoFilters.dataInicial}
                                                onChange={(e) => handleFilterChange('dataInicial', e.target.value)}
                                                type="date" 
                                                className={styles.filterInput}
                                            />
                                        </div>
                                        <div className={styles.filterGroup}>
                                            <label className={styles.filterLabel}>Data final</label>
                                            <input 
                                                value={historicoFilters.dataFinal}
                                                onChange={(e) => handleFilterChange('dataFinal', e.target.value)}
                                                type="date" 
                                                className={styles.filterInput}
                                            />
                                        </div>
                                        <div className={styles.filterGroup}>
                                            <label className={styles.filterLabel}>Tipo</label>
                                            <select 
                                                value={historicoFilters.tipo}
                                                onChange={(e) => handleFilterChange('tipo', e.target.value)}
                                                className={styles.filterInput}
                                            >
                                                <option value="Todos">Todos</option>
                                                <option value="Plantio">Plantio</option>
                                                <option value="Colheita">Colheita</option>
                                                <option value="Adubação">Adubação</option>
                                                <option value="Aplicação de Defensivos">Defensivos</option>
                                                <option value="Controle de Pragas">Controle de Pragas</option>
                                            </select>
                                        </div>
                                        <button type="submit" className={styles.filterButton}>
                                            FILTRAR
                                        </button>
                                    </form>

                                    {/* Tabela de histórico existente... */}
                                    {!loadingHistorico && filteredHistoricoData.length > 0 && (
                                        <>
                                            <table className={styles.table}>
                                                <thead className={styles.tableHeader}>
                                                    <tr>
                                                        <th className={styles.tableHeaderCell}>Data</th>
                                                        <th className={styles.tableHeaderCell}>Tipo</th>
                                                        <th className={styles.tableHeaderCell}>Cultura</th>
                                                        <th className={styles.tableHeaderCell}>Descrição</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredHistoricoData.map((item, index) => (
                                                        <tr key={item.id || index} className={styles.tableRow}>
                                                            <td className={styles.tableCell}>{item.data}</td>
                                                            <td className={styles.tableCell}>{item.tipo}</td>
                                                            <td className={styles.tableCell}>{item.cultura}</td>
                                                            <td className={styles.tableCell}>{item.descricao}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>

                                            {/* ✅ BOTÃO DE EXPORTAÇÃO - SEM SEÇÃO EXTRA */}
                                            <div className={styles.exportSection}>
                                                <div className={styles.exportInfo}>
                                                    <span className={styles.exportIcon}>📄</span>
                                                    <div>
                                                        <h3>Exportar Histórico</h3>
                                                        <p>Baixe todos os {filteredHistoricoData.length} registros de produtividade em PDF</p>
                                                    </div>
                                                </div>
                                                <PDFExportButton 
                                                    type="productivity"
                                                    data={filteredHistoricoData}
                                                    userName={profileSettings.nomeCompleto || userName}
                                                    label="📥 EXPORTAR HISTÓRICO EM PDF"
                                                    className={styles.exportButtonLarge}
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* Estado vazio existente... */}
                                    {!loadingHistorico && filteredHistoricoData.length === 0 && (
                                        <div className={styles.emptyState}>
                                            <p>📭 Nenhum registro encontrado</p>
                                            <p>Adicione dados na aba "Meus dados" para visualizar o histórico</p>
                                        </div>
                                    )}

                                    {/* Loading existente... */}
                                    {loadingHistorico && (
                                        <div className={styles.loadingContainer}>
                                            <div className={styles.loadingSpinner}>
                                                <div className={styles.spinner}></div>
                                                <p>Carregando histórico...</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                {/* ✅ TaskList PERMANECE AQUI (já existente) */}
                                <TaskList 
                                    userId={currentUser?.uid} 
                                    taskController={taskController}
                                />
                            </div>
                        )}

                        {/* PERFIL COM CEP AUTOMÁTICO */}
                        {currentPage === 'perfil' && (
                            <div className={styles.profileContainer}>
                                <h2 className={styles.formTitle}>Configurações do Perfil</h2>
                                <form onSubmit={saveProfileSettingsHandler} className={styles.profileForm}>
                                    
                                    {/* Informações Pessoais */}
                                    <div className={styles.profileSection}>
                                        <h3 className={styles.sectionTitle}>Informações Pessoais</h3>
                                        <div className={styles.profileGrid}>
                                            <div className={styles.profileField}>
                                                <label className={styles.profileLabel}>E-mail atual</label>
                                                <input 
                                                    value={profileSettings.email}
                                                    type="email" 
                                                    className={styles.profileInput}
                                                    disabled
                                                />
                                            </div>
                                            
                                            <div className={styles.profileField}>
                                                <label className={styles.profileLabel}>Nome completo</label>
                                                <input 
                                                    value={profileSettings.nomeCompleto}
                                                    onChange={(e) => handleProfileChange('nomeCompleto', e.target.value)}
                                                    type="text" 
                                                    className={styles.profileInput}
                                                    placeholder="Digite seu nome completo"
                                                />
                                            </div>

                                            <div className={styles.profileField}>
                                                <label className={styles.profileLabel}>Telefone</label>
                                                <input 
                                                    value={profileSettings.telefone}
                                                    onChange={(e) => handleProfileChange('telefone', e.target.value)}
                                                    type="tel" 
                                                    className={styles.profileInput}
                                                    placeholder="(11) 99999-9999"
                                                />
                                            </div>

                                            <div className={styles.profileField}>
                                                <label className={styles.profileLabel}>Profissão</label>
                                                <select 
                                                    value={profileSettings.profissao}
                                                    onChange={(e) => handleProfileChange('profissao', e.target.value)}
                                                    className={styles.profileInput}
                                                >
                                                    <option value="">Selecione</option>
                                                    <option value="agricultor">Agricultor</option>
                                                    <option value="agronomo">Agrônomo</option>
                                                    <option value="tecnico">Técnico Agrícola</option>
                                                    <option value="consultor">Consultor</option>
                                                    <option value="estudante">Estudante</option>
                                                    <option value="outro">Outro</option>
                                                </select>
                                            </div>

                                            <div className={styles.profileField}>
                                                <label className={styles.profileLabel}>Experiência em Agricultura</label>
                                                <select 
                                                    value={profileSettings.experienciaAgro}
                                                    onChange={(e) => handleProfileChange('experienciaAgro', e.target.value)}
                                                    className={styles.profileInput}
                                                >
                                                    <option value="">Selecione</option>
                                                    <option value="iniciante">Iniciante (0-2 anos)</option>
                                                    <option value="intermediario">Intermediário (3-10 anos)</option>
                                                    <option value="avancado">Avançado (10+ anos)</option>
                                                </select>
                                            </div>

                                            <div className={styles.profileField}>
                                                <label className={styles.profileLabel}>Tamanho da Propriedade Rural</label>
                                                <select 
                                                    value={profileSettings.propriedadeRural}
                                                    onChange={(e) => handleProfileChange('propriedadeRural', e.target.value)}
                                                    className={styles.profileInput}
                                                >
                                                    <option value="">Selecione</option>
                                                    <option value="pequena">Pequena (até 50ha)</option>
                                                    <option value="media">Média (50-200ha)</option>
                                                    <option value="grande">Grande (200+ ha)</option>
                                                    <option value="nao-possui">Não possuo</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ENDEREÇO COM CEP AUTOMÁTICO */}
                                    <div className={styles.profileSection}>
                                        <h3 className={styles.sectionTitle}>Endereço</h3>
                                        <div className={styles.profileGrid}>
                                            {/* CEP com busca automática - CORRIGIDO */}
                                            <div className={styles.profileField}>
                                                <label className={styles.profileLabel}>
                                                    CEP 
                                                    {loadingCEP && <span style={{ color: '#3b82f6' }}> (Buscando...)</span>}
                                                    {cepError && <span className={styles.errorText}> ❌ {cepError}</span>}
                                                </label>
                                                <input 
                                                    value={profileSettings.cep || ''}
                                                    onChange={handleCEPChange}  // ✅ CORRIGIDO: onChange direto
                                                    type="text" 
                                                    className={`${styles.profileInput} ${cepError ? styles.errorInput : ''} ${loadingCEP ? styles.loadingInput : ''}`}
                                                    placeholder="00000-000"
                                                    maxLength="9"
                                                    disabled={loadingCEP}  // ✅ Desabilita APENAS durante busca
                                                />
                                                {!loadingCEP && !cepError && profileSettings.cep?.length === 9 && (
                                                    <span style={{ color: '#10b981', fontSize: '0.875rem', marginTop: '4px', display: 'block' }}>
                                                        ✅ Endereço carregado
                                                    </span>
                                                )}
                                            </div>
                                            
                                            {/* Endereço - preenchido automaticamente */}
                                            <div className={styles.profileField}>
                                                <label className={styles.profileLabel}>Endereço</label>
                                                <input 
                                                    value={profileSettings.endereco || ''}
                                                    onChange={(e) => handleProfileChange('endereco', e.target.value)}
                                                    type="text" 
                                                    className={styles.profileInput}
                                                    placeholder="Rua, número, complemento"
                                                />
                                            </div>
                                            
                                            {/* Cidade - preenchida automaticamente */}
                                            <div className={styles.profileField}>
                                                <label className={styles.profileLabel}>Cidade</label>
                                                <input 
                                                    value={profileSettings.cidade || ''}
                                                    onChange={(e) => handleProfileChange('cidade', e.target.value)}
                                                    type="text" 
                                                    className={styles.profileInput}
                                                    placeholder="Nome da cidade"
                                                />
                                            </div>
                                            
                                            {/* Estado - preenchido automaticamente */}
                                            <div className={styles.profileField}>
                                                <label className={styles.profileLabel}>Estado</label>
                                                <select 
                                                    value={profileSettings.estado || ''}
                                                    onChange={(e) => handleProfileChange('estado', e.target.value)}
                                                    className={styles.profileInput}
                                                >
                                                    <option value="">Selecione</option>
                                                    <option value="AC">Acre</option>
                                                    <option value="AL">Alagoas</option>
                                                    <option value="AP">Amapá</option>
                                                    <option value="AM">Amazonas</option>
                                                    <option value="BA">Bahia</option>
                                                    <option value="CE">Ceará</option>
                                                    <option value="DF">Distrito Federal</option>
                                                    <option value="ES">Espírito Santo</option>
                                                    <option value="GO">Goiás</option>
                                                    <option value="MA">Maranhão</option>
                                                    <option value="MT">Mato Grosso</option>
                                                    <option value="MS">Mato Grosso do Sul</option>
                                                    <option value="MG">Minas Gerais</option>
                                                    <option value="PA">Pará</option>
                                                    <option value="PB">Paraíba</option>
                                                    <option value="PR">Paraná</option>
                                                    <option value="PE">Pernambuco</option>
                                                    <option value="PI">Piauí</option>
                                                    <option value="RJ">Rio de Janeiro</option>
                                                    <option value="RN">Rio Grande do Norte</option>
                                                    <option value="RS">Rio Grande do Sul</option>
                                                    <option value="RO">Rondônia</option>
                                                    <option value="RR">Roraima</option>
                                                    <option value="SC">Santa Catarina</option>
                                                    <option value="SP">São Paulo</option>
                                                    <option value="SE">Sergipe</option>
                                                    <option value="TO">Tocantins</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Redes Sociais */}
                                    <div className={styles.profileSection}>
                                        <h3 className={styles.sectionTitle}>Redes Sociais</h3>
                                        <div className={styles.socialSection}>
                                            <div className={styles.socialConnections}>
                                                <div className={styles.socialButton} onClick={() => connectSocialMedia('Facebook')}>
                                                    <svg className={styles.socialIcon} viewBox="0 0 24 24" fill="#1877F2">
                                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                                    </svg>
                                                    <span>Conectar Facebook</span>
                                                </div>
                                                
                                                <div className={styles.socialButton} onClick={() => connectSocialMedia('Instagram')}>
                                                    <svg className={styles.socialIcon} viewBox="0 0 24 24" fill="#E4405F">
                                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                                    </svg>
                                                    <span>Conectar Instagram</span>
                                                </div>
                                                
                                                <div className={styles.socialButton} onClick={() => connectSocialMedia('LinkedIn')}>
                                                    <svg className={styles.socialIcon} viewBox="0 0 24 24" fill="#0A66C2">
                                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                                    </svg>
                                                    <span>Conectar LinkedIn</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Preferências do Sistema */}
                                    <div className={styles.profileSection}>
                                        <h3 className={styles.sectionTitle}>Preferências do Sistema</h3>
                                        <div className={styles.profileGrid}>
                                            <div className={styles.profileField}>
                                                <label className={styles.profileLabel}>Tema</label>
                                                <div className={styles.themeSelector}>
                                                    <button 
                                                        type="button"
                                                        className={`${styles.themeButton} ${profileSettings.tema === 'light' ? styles.active : ''}`}
                                                        onClick={() => handleThemeChange('light')}
                                                    >
                                                        ☀️ Claro
                                                    </button>
                                                    <button 
                                                        type="button"
                                                        className={`${styles.themeButton} ${profileSettings.tema === 'dark' ? styles.active : ''}`}
                                                        onClick={() => handleThemeChange('dark')}
                                                    >
                                                        🌙 Escuro
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Seção de Notificações por Email */}
                                    <div className={styles.profileSection}>
                                        <h3 className={styles.sectionTitle}>Notificações por Email</h3>
                                        <div className={styles.notificationSettings}>
                                            <div className={styles.notificationInfo}>
                                                <p>
                                                    <strong>📧 Sistema de Lembretes Automáticos</strong>
                                                </p>
                                                <p>
                                                    Quando você faz login, o sistema verifica automaticamente se há tarefas 
                                                    vencendo nas próximas 24 horas e envia um email com os lembretes.
                                                </p>
                                                <p>
                                                    <strong>Email cadastrado:</strong> {profileSettings.email}
                                                </p>
                                                {lastNotificationCheck && (
                                                    <p>
                                                        <strong>Última verificação:</strong>{' '}
                                                        {new Date(lastNotificationCheck).toLocaleDateString('pt-BR', {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                )}
                                            </div>

                                            <div className={styles.notificationActions}>
                                                <button 
                                                    type="button"
                                                    onClick={handleTestEmailNotification}
                                                    className={styles.testEmailButton}
                                                    disabled={!profileSettings.email}
                                                    title="Envia 2 tarefas fictícias para testar o sistema de email"
                                                >
                                                    📧 Enviar Email de Teste
                                                </button>

                                                <button 
                                                    type="button"
                                                    onClick={handleManualTaskCheck}
                                                    className={styles.checkTasksButton}
                                                    title="Verifica quantas tarefas vencem em 24h (não envia email)"
                                                >
                                                    🔍 Verificar Tarefas Agora
                                                </button>
                                            </div>

                                            <div className={styles.notificationHints}>
                                                <p><strong>💡 Como funciona:</strong></p>
                                                <ul>
                                                    <li><strong>Verificar Tarefas:</strong> Mostra quantas tarefas vencem em 24h (sem enviar email)</li>
                                                    <li><strong>Email de Teste:</strong> Envia 2 tarefas fictícias para testar o sistema</li>
                                                    <li><strong>Automático:</strong> Ao fazer login, emails são enviados automaticamente</li>
                                                </ul>
                                            </div>

                                            {notificationStatus && (
                                                <div className={styles.notificationStatusInline}>
                                                    {notificationStatus}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Botões de Ação */}
                                    <div className={styles.profileActions}>
                                        <button 
                                            type="submit" 
                                            className={styles.saveButton}
                                            disabled={saving}
                                        >
                                            {saving ? 'Salvando...' : 'SALVAR CONFIGURAÇÕES'}
                                        </button>
                                        
                                        <button 
                                            type="button"
                                            onClick={handleLogout}
                                            className={styles.logoutButton}
                                        >
                                            LOGOUT
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </section>
                </main>
            </div>
            
            {/* CHATBOT FLUTUANTE - Visível em TODAS as páginas */}
            <ChatBot />

            {/* Footer com sugestões de compra */}
            <SuggestedItemsFooter />
        </div>
    );
};

export default Home;
