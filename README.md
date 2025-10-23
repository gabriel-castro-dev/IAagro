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
├── models/ # MODEL - Classes de dados
│ ├── User.js
│ ├── AgricultureData.js
│ └── WeatherData.js
│
├── views/ # VIEW - Componentes React
│ └── components/
│
├── controllers/ # CONTROLLER - Lógica de negócio
│ ├── UserController.js
│ ├── DataController.js
│ ├── WeatherController.js
│ └── AddressController.js
│
├── repositories/ # REPOSITORY - Camada de persistência
│ ├── UserRepository.js
│ ├── DataRepository.js
│ └── WeatherRepository.js
│
└── services/ # Integrações externas
```
---

## ✅ Checklist de Funcionalidades

### Funcionalidades Obrigatórias
- [x] Cadastro de usuários  
- [x] Login com autenticação  
- [x] Redefinição de senha  
- [x] Notificações de lembrete (climáticas, agrícolas)  
- [x] Histórico de atividades  
- [x] Configurações personalizáveis  
- [x] Dashboard com métricas de uso  
- [x] Calculadora Inteligente de Produtividade e Irrigação 
- [ ] Exportação de relatórios em PDF  
- [x] Lista de tarefas  
- [x] Cadastro de Culturas, Insumos e Boas Práticas  
- [x] Busca de endereço por CEP  
- [x] Interação IA ↔ Usuário  
- [x] Notificações por E-mail  
- [x] Integração com APIs de previsão do tempo  
- [ ] Backup de dados para cliente  
- [x] Atualização automática de recomendações  
- [x] Relatórios de produtividade por período  
- [ ] Exibição de ações valorizadas do mercado agrícola  
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
    
## 🏆 Padrões e Boas Práticas
### 🎯 Orientação a Objetos

Classes bem estruturadas

Encapsulamento e validações integradas

Uso de herança e composição

### 🏛️ Padrão MVC

Model: User, AgricultureData, WeatherData

View: Componentes React reutilizáveis

Controller: Lógica de negócio organizada

### 🗄️ Padrão Repository

Abstração da persistência de dados

Separação clara entre Controllers e banco

Repositórios específicos por entidade

### 🔧 APIs Integradas

OpenWeather API → dados climáticos em tempo real

ViaCEP API → busca automática por CEP

Firebase APIs → autenticação, banco de dados, notificações

---
# 🌱 IAagro - Tecnologia a serviço da agricultura sustentável 🚀
