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

## 📋 Sobre o Projeto - IAagro
O IAagro é uma plataforma digital desenvolvida com o objetivo de auxiliar agricultores de micro e médio porte no controle, análise e tomada de decisão sobre suas lavouras. A proposta central é oferecer uma ferramenta inteligente, acessível e personalizada que integre dados agronômicos, históricos de produção, alertas climáticos e recomendações técnicas com o apoio de inteligência artificial.

Desenvolvido utilizando arquitetura MVC e padrão Repository, garantindo código organizado, escalável e de fácil manutenção.

## 🎯 Objetivo
Nosso principal objetivo é empoderar pequenos e médios produtores rurais com tecnologia de ponta para que possam:

Acompanhar o desempenho das lavouras, com base em dados históricos, produtividade, clima e insumos aplicados.
Receber alertas climáticos e pragas, permitindo agir de forma preventiva.
Obter recomendações técnicas personalizadas, otimizadas com base nos dados cadastrados e atualizações automáticas.
Compartilhar boas práticas e interagir com a comunidade agrícola, por meio de integração com redes sociais.
Tomar decisões baseadas em dados, com suporte de dashboards, análises e relatórios exportáveis.
## 🌾 Contexto
O setor agrícola ainda enfrenta muitos desafios quanto ao uso de tecnologia acessível para pequenos produtores. A carência de soluções simples, eficientes e adaptáveis à realidade do campo motivou o desenvolvimento do IAagro, que busca:

Reduzir a distância entre o produtor e a informação qualificada.
Facilitar o uso de dados e inteligência artificial na agricultura de precisão.
Fomentar uma comunidade de troca de conhecimento agrícola.
## 🏗️ Especificações Técnicas
O IAagro foi desenvolvido utilizando tecnologias modernas e escaláveis para garantir uma experiência fluida, segura e responsiva ao usuário, tanto no desktop quanto no mobile.

## 🎨 Front-end
Framework: React.js
Principais recursos:
Componentização reutilizável
Interface responsiva (com suporte mobile)
Integração com APIs externas (clima, recomendações, etc.)
Rotas protegidas para usuários autenticados
## ⚙️ Back-end
Ambiente de execução: Node.js
API RESTful: Gerencia as requisições entre o front-end, banco de dados e serviços externos
Segurança: Implementação de autenticação Firebase e gerenciamento de sessões de forma segura
## 🗄️ Banco de Dados e Autenticação
Plataforma: Firebase
Serviços utilizados:
Firestore: Armazenamento em tempo real de dados agronômicos, históricos e perfis de usuário
Firebase Authentication: Gerenciamento de contas e login seguro com suporte a redefinição de senha
Firebase Cloud Messaging: Envio de notificações em tempo real
## 🏛️ Arquitetura MVC + Repository Pattern
src/
├── models/            MODEL - Classes de dados
│   ├── User.js
│   ├── AgricultureData.js
│   └── WeatherData.js
├── views/             VIEW - Componentes React
│   └── components/   
├── controllers/       CONTROLLER - Lógica de negócio
│   ├── UserController.js
│   ├── DataController.js
│   ├── WeatherController.js
│   └── AddressController.js
├── repositories/      REPOSITORY - Camada de persistência
│   ├── UserRepository.js
│   ├── DataRepository.js
│   └── WeatherRepository.js
└── services/          Integrações externas

## Checklist das Funcionalidades

### Funcionalidades Obrigatórias
- [x] Cadastro de usuários
- [x] Login com autenticação
- [x] O usuário deve poder redefinir a senha
- [ ] O sistema deve enviar notificações de lembrete (ex: alertas climáticos, práticas agrícolas).
- [x] O usuário deve conseguir visualizar um histórico de atividades (ex: práticas aplicadas, alertas recebidos).
- [x] O usuário deve poder personalizar as configurações da interface (ex: escolher culturas de interesse, definir preferências de     
      notificação).
- [ ] Deve haver um dashboard com métricas de uso (ex: produtividade, práticas aplicadas, histórico climático).
- [ ] O sistema deve oferecer suporte a múltiplos idiomas.
- [ ] Deve ser possível exportar relatórios em PDF (ex: relatórios de produtividade, recomendações técnicas).
- [ ] O sistema deve ter um sistema de busca eficiente, permitindo filtrar por culturas, recomendações técnicas, alertas climáticos e 
      insumos.
- [x] Cadastro de Culturas, Insumos e Boas Práticas Agrícolas
- [x] Busca de endereço por CEP
- [ ]  Interação entre IA e Usuário
- [ ]  Notificações por E-mail
- [x]  Integração com APIs de Previsão do Tempo e Monitoramento Climático
- [ ]  Opção de Backups para o cliente
- [ ]  Atualização Automática de Recomendações Técnicas
- [x]  Relatórios de Produtividade por Período
- [ ]  O sistema deve mostrar as ações mais valorizadas do mercado de agricola.
- [x]  Recomendar itens para compra(ex: Insumo, Sementes)

## 🚀 Como Executar o Projeto:

##📋 Pré-requisitos
Node.js 16+ instalado
NPM ou Yarn
Conta Firebase configurada
##🔧 Passos de Instalação

Clone o repositório:
git clone https://github.com/gabriel-castro-dev/IAagro.git
cd IAagro

Instale as dependências:
npm install

Configure as variáveis de ambiente: Crie um arquivo .env na raiz do projeto:

REACT_APP_FIREBASE_API_KEY=sua_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=seu_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=seu_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=seu_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
REACT_APP_FIREBASE_APP_ID=seu_app_id
REACT_APP_WEATHER_API_KEY=sua_weather_api_key

Execute o projeto:
npm start

Acesse a aplicação: Abra http://localhost:3000 no seu navegador

## 🏆 Arquitetura e Padrões Implementados

## 🎯 Orientação a Objetos
Classes bem estruturadas com métodos específicos
Encapsulamento adequado de dados e comportamentos
Validações integradas nos modelos
Herança e composição onde apropriado

## 🏛️ Padrão MVC
Model: Classes User, AgricultureData, WeatherData
View: Componentes React organizados e reutilizáveis
Controller: Lógica de negócio separada em controllers específicos

## 🗄️ Padrão Repository
Camada de abstração para persistência de dados
Separação clara entre Controllers e acesso ao banco
Repositories especializados para cada entidade

## 🔧 APIs Integradas
OpenWeather API - Dados climáticos em tempo real
ViaCEP API - Busca automática por CEP
Firebase APIs - Autenticação e banco de dados

## 📊 Funcionalidades Técnicas Implementadas

## 🔐 Sistema de Autenticação Completo
Login seguro com Firebase Authentication
Cadastro com validações robustas
Recuperação e redefinição de senha

## 👤 Gestão de Perfil Avançada
Perfil completo com informações da propriedade
Preenchimento automático de endereço via CEP
Configurações personalizáveis (tema, notificações)

## 🌤️ Sistema Climático Inteligente
Dados meteorológicos em tempo real
Cache inteligente para performance
Análises e recomendações agronômicas


# 🌱 IAagro - Tecnologia a serviço da agricultura sustentável 🚀
---
