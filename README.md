# IAagro

**Integrantes do Grupo:**
- Gabriel Castro Inacio - 12300543
- Guilherme Kaab - 12301230
- Matheus Brum - 12303046
- Vitor Zamana - 12301205
- Giovanna Limotyrakis - 12302392
- Mateus Crespo Marra - 1230144
- Bernardo Agostinho de Freitas - 22403213

**Turma:** [3B1] 

---
## Sobre o Projeto - IAagro
O IAagro é uma plataforma digital desenvolvida com o objetivo de auxiliar agricultores de micro e médio porte no controle, análise e tomada de decisão sobre suas lavouras. A proposta central é oferecer uma ferramenta inteligente, acessível e personalizada que integre dados agronômicos, históricos de produção, alertas climáticos e recomendações técnicas com o apoio de inteligência artificial.

## Objetivo
Nosso principal objetivo é empoderar pequenos e médios produtores rurais com tecnologia de ponta para que possam:

Acompanhar o desempenho das lavouras, com base em dados históricos, produtividade, clima e insumos aplicados.

Receber alertas climáticos e pragas, permitindo agir de forma preventiva.

Obter recomendações técnicas personalizadas, otimizadas com base nos dados cadastrados e atualizações automáticas.

Compartilhar boas práticas e interagir com a comunidade agrícola, por meio de integração com redes sociais.

Tomar decisões baseadas em dados, com suporte de dashboards, análises e relatórios exportáveis.

## Contexto
O setor agrícola ainda enfrenta muitos desafios quanto ao uso de tecnologia acessível para pequenos produtores. A carência de soluções simples, eficientes e adaptáveis à realidade do campo motivou o desenvolvimento do IAagro, que busca:

Reduzir a distância entre o produtor e a informação qualificada.

Facilitar o uso de dados e inteligência artificial na agricultura de precisão.

Fomentar uma comunidade de troca de conhecimento agrícola.
---
## Especificações Técnicas
O IAagro foi desenvolvido utilizando tecnologias modernas e escaláveis para garantir uma experiência fluida, segura e responsiva ao usuário, tanto no desktop quanto no mobile.

## Front-end
Framework: React.js

Principais recursos:

Componentização reutilizável

Interface responsiva (com suporte mobile)

Integração com APIs externas (clima, recomendações, etc.)

Rotas protegidas para usuários autenticados

## Back-end
Ambiente de execução: Node.js

API RESTful: Gerencia as requisições entre o front-end, banco de dados e serviços externos

Segurança: Implementação de autenticação JWT e gerenciamento de sessões de forma segura

## Banco de Dados e Autenticação
Plataforma: Firebase

Serviços utilizados:

Firestore: Armazenamento em tempo real de dados agronômicos, históricos e perfis de usuário

Firebase Authentication: Gerenciamento de contas e login seguro com suporte a redefinição de senha

Firebase Cloud Messaging: Envio de notificações em tempo real
---
## Checklist das Funcionalidades

### Funcionalidades Obrigatórias
- [x] Cadastro de usuários
- [x] Login com autenticação
- [x] O usuário deve poder redefinir a senha
- [ ] O sistema deve enviar notificações de lembrete (ex: alertas climáticos, práticas agrícolas).
- [x] O usuário deve conseguir visualizar um histórico de atividades (ex: práticas aplicadas, alertas recebidos).
- [ ] O sistema deve permitir integração com redes sociais para compartilhamento de boas práticas e interação com a comunidade     
      agrícola.
- [x] O usuário deve poder personalizar as configurações da interface (ex: escolher culturas de interesse, definir preferências de     
      notificação).
- [ ] Deve haver um dashboard com métricas de uso (ex: produtividade, práticas aplicadas, histórico climático).
- [ ] O sistema deve oferecer suporte a múltiplos idiomas.
- [ ] Deve ser possível exportar relatórios em PDF (ex: relatórios de produtividade, recomendações técnicas).
- [ ] O sistema deve ter um sistema de busca eficiente, permitindo filtrar por culturas, recomendações técnicas, alertas climáticos e 
      insumos.
- [x] Cadastro de Culturas, Insumos e Boas Práticas Agrícolas
- [x]  Interação entre IA e Usuário
- [ ]  Notificações por E-mail
- [x]  Integração com APIs de Previsão do Tempo e Monitoramento Climático
- [ ]  Opção de Backups para o cliente
- [ ]  Atualização Automática de Recomendações Técnicas
- [x]  Relatórios de Produtividade por Período
- [ ]  O sistema deve mostrar as ações mais valorizadas do mercado de agricola.
- [x]  Recomendar itens para compra(ex: Insumo, Sementes)
### Funcionalidades Extras

- [ ] Responsividade para mobile

---
