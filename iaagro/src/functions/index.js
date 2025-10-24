const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { GoogleGenerativeAI } = require('@google/generative-ai');

admin.initializeApp();


const genAI = new GoogleGenerativeAI(functions.config().gemini.key);

exports.chatWithAI = functions.https.onCall(async (data, context) => {
 
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Usuário deve estar autenticado'
    );
  }

  const { message, userId } = data;

  try {
   
    const userDoc = await admin.firestore()
      .collection('users')
      .doc(userId)
      .get();
    
    const userData = userDoc.data();


    const historicoSnapshot = await admin.firestore()
      .collection('agronomicalData')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(10)
      .get();

    const historicoData = historicoSnapshot.docs.map(doc => doc.data());


    const weatherCache = await admin.firestore()
      .collection('weatherCache')
      .doc(userId)
      .get();

    let weatherData = null;
    if (weatherCache.exists) {
      const cacheData = weatherCache.data();
      const now = Date.now();
      // Se cache tem menos de 30 min, usar
      if (now - cacheData.timestamp < 30 * 60 * 1000) {
        weatherData = cacheData.data;
      }
    }

 
    const systemContext = `
Você é um assistente agrícola especializado brasileiro. Seus dados:

**Usuário**: ${userData.nomeCompleto || 'Agricultor'}
**Localização**: ${userData.cidade}, ${userData.estado}
**Propriedade**: ${userData.propriedadeRural || 'Não especificada'}
**Experiência**: ${userData.experienciaAgro || 'Não informada'}

${historicoData.length > 0 ? `
**Histórico Recente (últimas 10 atividades)**:
${historicoData.map((item, i) => `
${i + 1}. ${item.tipo} - ${item.cultura} (${item.data})
   ${item.descricao || ''}
`).join('\n')}
` : 'Sem histórico registrado ainda.'}

${weatherData ? `
**Clima Atual (${weatherData.city})**:
- Temperatura: ${weatherData.temp}°C (Min: ${weatherData.tempMin}°C, Max: ${weatherData.tempMax}°C)
- Umidade: ${weatherData.humidity}%
- Vento: ${weatherData.windSpeed} m/s
- Condição: ${weatherData.description}
` : ''}

**Instruções**:
- Sempre responda em português brasileiro
- Use os dados do contexto para personalizar suas respostas
- Se sugerir algo, explique baseado no histórico e clima
- Seja prático e objetivo
- Se não tiver informação suficiente, pergunte
`;

    // 5. Chamar Gemini 2.0 Flash
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 1024,
      }
    });

    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: systemContext }],
        },
        {
          role: 'model',
          parts: [{ text: 'Entendido! Estou pronto para ajudar com análises agronômicas personalizadas. Como posso ajudá-lo hoje?' }],
        },
      ],
    });

    const result = await chat.sendMessage(message);
    const response = result.response.text();

    // 6. Salvar conversa no Firestore
    await admin.firestore()
      .collection('chatHistory')
      .add({
        userId,
        userMessage: message,
        aiResponse: response,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        model: 'gemini-2.0-flash-exp',
      });

    return {
      success: true,
      response,
      timestamp: Date.now(),
    };

  } catch (error) {
    console.error('Erro no chatbot:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Erro ao processar mensagem: ' + error.message
    );
  }
});
