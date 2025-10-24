import emailjs from '@emailjs/browser';
import { 
    collection, 
    query, 
    where, 
    getDocs, 
    updateDoc, 
    doc,
    getDoc  // ✅ ADICIONE ESTE IMPORT
} from 'firebase/firestore';
import { db } from '../firebase/firebase';

// Configuração do EmailJS
const EMAILJS_SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

// Inicializar EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

/**
 * Verificar tarefas que vencem em 24h e enviar email (CORRIGIDA)
 */
export const checkAndSendTaskReminders = async (userId) => {
    try {
        console.log('🔔 Verificando tarefas para notificação...');

        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        const todayStr = now.toISOString().split('T')[0];

        // Buscar tarefas que vencem nas próximas 24h
        const tasksRef = collection(db, 'userTasks');
        const q = query(
            tasksRef,
            where('userId', '==', userId),
            where('concluida', '==', false),
            where('dataLimite', '>=', todayStr),
            where('dataLimite', '<=', tomorrowStr)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.log('✅ Nenhuma tarefa vencendo em 24h');
            return { success: true, count: 0, message: 'Nenhuma tarefa vencendo' };
        }

        // Filtrar tarefas que ainda não foram notificadas
        const tasks = [];
        querySnapshot.forEach((docSnap) => {
            const taskData = docSnap.data();
            if (!taskData.notificacaoEnviada || isOldNotification(taskData.dataNotificacao)) {
                tasks.push({
                    id: docSnap.id,
                    ...taskData
                });
            }
        });

        if (tasks.length === 0) {
            console.log('✅ Todas as tarefas já foram notificadas');
            return { success: true, count: 0, message: 'Tarefas já notificadas' };
        }

        console.log(`📊 ${tasks.length} tarefa(s) encontrada(s) para notificar`);

        // ✅ CORRIGIDO: Buscar perfil usando sintaxe modular v9
        let userEmail = null;
        let userName = 'Usuário';

        try {
            // Método correto: doc(db, 'collection', 'documentId')
            const userProfileRef = doc(db, 'userProfiles', userId);
            const userProfileDoc = await getDoc(userProfileRef);
            
            console.log('🔍 Documento existe?', userProfileDoc.exists());
            
            if (userProfileDoc.exists()) {
                const userProfile = userProfileDoc.data();
                console.log('📄 Dados do perfil:', userProfile);
                
                userEmail = userProfile.email;
                userName = userProfile.nomeCompleto || userProfile.nome || userProfile.name || 'Usuário';
                
                console.log('✅ Perfil encontrado pelo ID do documento');
                console.log('📧 Email:', userEmail);
                console.log('👤 Nome:', userName);
            } else {
                console.error('❌ Documento não existe no path: userProfiles/' + userId);
                
                // Fallback: tentar buscar por query
                const userProfilesRef = collection(db, 'userProfiles');
                const userQuery = query(userProfilesRef, where('userId', '==', userId));
                const userSnapshot = await getDocs(userQuery);

                if (!userSnapshot.empty) {
                    const userProfile = userSnapshot.docs[0].data();
                    userEmail = userProfile.email;
                    userName = userProfile.nomeCompleto || userProfile.nome || userProfile.name || 'Usuário';
                    console.log('✅ Perfil encontrado via query por userId');
                } else {
                    console.error('❌ Perfil não encontrado nem por ID nem por query');
                }
            }
        } catch (error) {
            console.error('❌ Erro ao buscar perfil:', error);
        }

        // Se não encontrou o email
        if (!userEmail) {
            console.error('❌ Email não encontrado em nenhum método');
            console.error('🔍 UserId procurado:', userId);
            return { 
                success: false, 
                error: 'Email não encontrado. Verifique se o perfil está completo.',
                message: 'Perfil incompleto'
            };
        }

        console.log('📧 Email encontrado:', userEmail);

        // Gerar HTML da lista de tarefas
        const taskListHTML = generateTaskListHTML(tasks);

        // Preparar parâmetros do email
        const templateParams = {
            to_email: userEmail,
            user_name: userName,
            task_count: tasks.length,
            task_list: taskListHTML,
            current_year: new Date().getFullYear()
        };

        console.log('📧 Enviando email para:', userEmail);

        // Enviar email via EmailJS
        const response = await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            templateParams
        );

        console.log('✅ Email enviado com sucesso:', response);

        // Marcar tarefas como notificadas
        const updatePromises = tasks.map(task => 
            updateDoc(doc(db, 'userTasks', task.id), {
                notificacaoEnviada: true,
                dataNotificacao: new Date().toISOString()
            })
        );

        await Promise.all(updatePromises);
        console.log('✅ Tarefas marcadas como notificadas');

        return { 
            success: true, 
            count: tasks.length, 
            email: userEmail,
            message: `${tasks.length} email(s) enviado(s) com sucesso!`
        };

    } catch (error) {
        console.error('❌ Erro ao enviar notificação:', error);
        return { 
            success: false, 
            error: error.message || 'Erro desconhecido',
            message: 'Falha ao enviar email'
        };
    }
};

/**
 * Verificar se a notificação é antiga (mais de 1 dia)
 */
const isOldNotification = (dataNotificacao) => {
    if (!dataNotificacao) return true;
    
    const notificationDate = new Date(dataNotificacao);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    return notificationDate < oneDayAgo;
};

/**
 * Gerar HTML da lista de tarefas
 */
const generateTaskListHTML = (tasks) => {
    return tasks.map((task, index) => {
        const priorityColor = getPriorityColor(task.prioridade);
        const priorityIcon = getPriorityIcon(task.prioridade);
        
        return `
            <div style="background: ${index % 2 === 0 ? '#ffffff' : '#f9fafb'}; padding: 16px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid ${priorityColor};">
                <div style="display: flex; align-items: start; gap: 12px;">
                    <span style="font-size: 24px;">${priorityIcon}</span>
                    <div style="flex: 1;">
                        <h3 style="margin: 0 0 8px 0; color: #111827; font-size: 16px; font-weight: 600;">
                            ${task.titulo}
                        </h3>
                        ${task.descricao ? `
                            <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                                ${task.descricao}
                            </p>
                        ` : ''}
                        <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
                            <span style="background: ${priorityColor}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                                ${task.prioridade.toUpperCase()}
                            </span>
                            <span style="color: #6b7280; font-size: 14px;">
                                📅 Vence: ${formatDate(task.dataLimite)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
};

/**
 * Obter cor da prioridade
 */
const getPriorityColor = (priority) => {
    const colors = {
        'alta': '#ef4444',
        'media': '#f59e0b',
        'baixa': '#10b981'
    };
    return colors[priority?.toLowerCase()] || '#6b7280';
};

/**
 * Obter ícone da prioridade
 */
const getPriorityIcon = (priority) => {
    const icons = {
        'alta': '🔴',
        'media': '🟡',
        'baixa': '🟢'
    };
    return icons[priority?.toLowerCase()] || '⚪';
};

/**
 * Formatar data DD/MM/YYYY
 */
const formatDate = (dateString) => {
    if (!dateString) return 'Data não definida';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
};

/**
 * Enviar email de teste
 */
export const sendTestEmail = async (userEmail, userName) => {
    try {
        const mockTasks = [
            {
                id: 'test1',
                titulo: 'Irrigação do Talhão 3',
                descricao: 'Verificar sistema de irrigação por gotejamento',
                dataLimite: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                prioridade: 'alta'
            },
            {
                id: 'test2',
                titulo: 'Aplicação de Defensivos',
                descricao: 'Aplicar herbicida na área de milho',
                dataLimite: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                prioridade: 'media'
            }
        ];

        const taskListHTML = generateTaskListHTML(mockTasks);

        const templateParams = {
            to_email: userEmail,
            user_name: userName,
            task_count: mockTasks.length,
            task_list: taskListHTML,
            current_year: new Date().getFullYear()
        };

        const response = await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            templateParams
        );

        return { success: true, response };

    } catch (error) {
        console.error('Erro ao enviar email de teste:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Apenas verificar quantidade de tarefas SEM enviar email
 */
export const checkTasksWithoutEmail = async (userId) => {
    try {
        console.log('🔍 Verificando tarefas (SEM enviar email)...');

        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        const todayStr = now.toISOString().split('T')[0];

        // Buscar tarefas que vencem nas próximas 24h
        const tasksRef = collection(db, 'userTasks');
        const q = query(
            tasksRef,
            where('userId', '==', userId),
            where('concluida', '==', false),
            where('dataLimite', '>=', todayStr),
            where('dataLimite', '<=', tomorrowStr)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.log('✅ Nenhuma tarefa vencendo em 24h');
            return { 
                success: true, 
                count: 0, 
                message: '✅ Nenhuma tarefa vencendo nas próximas 24 horas',
                tasks: []
            };
        }

        // Coletar tarefas
        const tasks = [];
        querySnapshot.forEach((docSnap) => {
            const taskData = docSnap.data();
            tasks.push({
                id: docSnap.id,
                titulo: taskData.titulo,
                dataLimite: taskData.dataLimite,
                prioridade: taskData.prioridade,
                notificada: taskData.notificacaoEnviada || false
            });
        });

        console.log(`📊 ${tasks.length} tarefa(s) encontrada(s)`);

        // Contar quantas já foram notificadas
        const notificadas = tasks.filter(t => t.notificada).length;
        const pendentes = tasks.length - notificadas;

        let message = '';
        if (pendentes > 0) {
            message = `⚠️ ${pendentes} tarefa(s) vencendo nas próximas 24 horas`;
            if (notificadas > 0) {
                message += ` (${notificadas} já notificada(s))`;
            }
        } else {
            message = `ℹ️ ${tasks.length} tarefa(s) encontrada(s), mas todas já foram notificadas`;
        }

        return { 
            success: true, 
            count: tasks.length,
            pendingCount: pendentes,
            notifiedCount: notificadas,
            message: message,
            tasks: tasks
        };

    } catch (error) {
        console.error('❌ Erro ao verificar tarefas:', error);
        return { 
            success: false, 
            error: error.message,
            message: '❌ Erro ao verificar tarefas'
        };
    }
};