# 🌱 IAagro - Sistema de Gestão Agronômica Inteligente

**👥 Integrantes do Grupo:**
- Gabriel Castro Inacio - 12300543  
- Guilherme Kaab - 12301230  
- Matheus Brum - 12303046  
- Vitor Zamana - 12301205  
- Giovanna Limotyrakis - 12302392  
- Mateus Crespo Marra - 1230144  
- Bernardo Agostinho de Freitas - 22403213  

**Turma:** [3B1]  

---

## 📋 Sobre o Projeto
O **IAagro** é uma plataforma digital desenvolvida com o objetivo de auxiliar agricultores de micro e médio porte no **controle, análise e tomada de decisão** sobre suas lavouras.  
A proposta central é oferecer uma ferramenta **inteligente, acessível e personalizada**, integrando:

- Dados agronômicos  
- Históricos de produção  
- Alertas climáticos  
- Recomendações técnicas com apoio de **Inteligência Artificial**  

---

## 🎯 Objetivo
O projeto visa **empoderar pequenos e médios produtores** com tecnologia de ponta para:

- 📊 Acompanhar desempenho das lavouras  
- 🌦️ Receber alertas climáticos e de pragas  
- 🤖 Obter recomendações técnicas personalizadas  
- 🌱 Compartilhar boas práticas e interagir com a comunidade agrícola  
- 📈 Tomar decisões baseadas em dados, dashboards e relatórios  

---

## 🌾 Contexto
O setor agrícola enfrenta desafios na adoção de tecnologia acessível. O IAagro busca:

- Reduzir a distância entre produtor e informação qualificada  
- Facilitar o uso de **IA na agricultura de precisão**  
- Criar uma comunidade de troca de conhecimento agrícola  

---

## 🏗️ Especificações Técnicas

### 🎨 Front-end
- Framework: **React.js**
- Componentização reutilizável  
- Recharts (Gráficos e vizualização)
- Integração com APIs externas (clima, recomendações, etc.)  
- Rotas protegidas para usuários autenticados  

### ⚙️ Back-end
- Ambiente: **Node.js**  
- API RESTful para comunicação entre front, DB e serviços externos  
- Segurança: **Firebase Authentication**  

### 🗄️ Banco de Dados e Autenticação
- Plataforma: **Firebase**  
- Firestore: armazenamento em tempo real  
- Authentication: login seguro e redefinição de senha  
- EmailJS: notificações em tempo real  

### 🗄️ Inteligência Artificial
- Google Gemini AI
---

## 🏛️ Arquitetura MVC + Repository Pattern
```
src/
├── authContext/
├── models/ # MODEL - Classes de dados
│ ├── User.js
│ ├── AgricultureData.js
│ └── WeatherData.js
│
├── components/ # VIEW - Componentes React
│ └── Home.jsx
│ └── Home.module.css
│ ├── auth/
│ ├── Calculators/
│ ├── Charts/
│ ├── chatBot/
│ ├── Footer/
│ ├── PDF/
│ ├── Tasks/
│
├── controllers/ # CONTROLLER - Lógica de negócio
│ ├── UserController.js
│ ├── DataController.js
│ ├── WeatherController.js
│ └── AddressController.js
│ └── ChatbotController.js
│ └── PDFController.js
│ └── TaskController.js
│
├── repositories/ # REPOSITORY - Camada de persistência
│ ├── UserRepository.js
│ ├── DataRepository.js
│ └── WeatherRepository.js
│
└── services/ # Integrações externas
│ ├── addressService.js
│ ├── calculatorService.js
│ └── chartDataService.js
│ ├── chatbotService.js
│ ├── emailNotificationService.js
│ └── pdfService.js
│ ├── profileService.js
│ ├── taskService.js
│ └── weatherService.js
```
---
# Padrões de Projeto GoF Implementados

## 1. Singleton (Conexão Firebase)
**Arquivo:** `src/firebase/firebase.js`
- Garante uma única instância da conexão com Firebase
- Compartilhada em toda aplicação

## 2. Factory Method (Templates de Email)
**Arquivo:** `src/services/EmailNotificationService.js`
- Cria diferentes tipos de templates baseado no tipo de tarefa
- Método `createEmailTemplate(task)`

## 3. Strategy (Busca de Clima)
**Arquivo:** `src/controllers/WeatherController.js`
- Diferentes estratégias: CEP, Cidade/Estado, Coordenadas
- Método `getWeatherData(params)`

## 4. Observer (Autenticação)
**Arquivo:** `src/contexts/authContext/index.jsx`
- Context API notifica componentes sobre mudanças de autenticação
- `AuthProvider` e `useAuth()`

## 5. Facade (Controllers)
**Arquivo:** `src/controllers/TaskController.js`
- Simplifica operações complexas do Firebase
- Interface única para múltiplos serviços

## ✅ Checklist de Funcionalidades

### Funcionalidades Obrigatórias
- [x] Cadastro de usuários  
- [x] Login com autenticação  
- [x] Redefinição de senha  
- [x] Notificações de lembrete (climáticas, agrícolas)  
- [x] Histórico de atividades  
- [x] Configurações personalizáveis  
- [x] Dashboard com métricas de uso  
- [x] Calculadora Inteligente de Produtividade
- [x] Calculadora Inteligente de Irrigação 
- [x] Exportação de relatórios em PDF  
- [x] Lista de tarefas  
- [x] Cadastro de Culturas, Insumos e Boas Práticas  
- [x] Busca de endereço por CEP  
- [x] Interação IA ↔ Usuário  
- [x] Notificações por E-mail  
- [x] Integração com APIs de previsão do tempo  
- [x] Backup de dados para cliente  
- [x] Atualização automática de recomendações  
- [x] Relatórios de produtividade por período   
- [x] Recomendação de itens para compra  

---

## 🚀 Como Executar o Projeto

### 📋 Pré-requisitos
- Node.js **16+**  
- NPM ou Yarn  
- Conta Firebase configurada  

### 🔧 Instalação
1. Clone o repositório:
   ```
   git clone https://github.com/gabriel-castro-dev/IAagro.git
   cd IAagro
2. Instale as dependências:
   ```
      npm install
3. Configure as variáveis de ambiente (.env na raiz):
   ```
      REACT_APP_FIREBASE_API_KEY=sua_api_key
      REACT_APP_FIREBASE_AUTH_DOMAIN=seu_auth_domain
      REACT_APP_FIREBASE_PROJECT_ID=seu_project_id
      REACT_APP_FIREBASE_STORAGE_BUCKET=seu_storage_bucket
      REACT_APP_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
      REACT_APP_FIREBASE_APP_ID=seu_app_id
      REACT_APP_WEATHER_API_KEY=sua_weather_api_key
4.Execute o projeto:  
```
      npm start
      Acesse em: http://localhost:3000
```

# 🌱 IAagro - Tecnologia a serviço da agricultura sustentável 🚀
