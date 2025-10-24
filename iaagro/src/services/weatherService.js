/**
 * Serviço para dados meteorológicos
 * Utiliza a API do OpenWeatherMap
 */

// Configurações da API usando variáveis de ambiente
const API_KEY = process.env.REACT_APP_WEATHER_API_KEY || 'cc11141a4c6ee7ff6a52fb92d7b16c29';
const BASE_URL = process.env.REACT_APP_WEATHER_BASE_URL || 'https://api.openweathermap.org/data/2.5';

// Verificação de API Key
if (!process.env.REACT_APP_WEATHER_API_KEY) {
    console.warn('⚠️ Weather API Key não encontrada nas variáveis de ambiente. Usando fallback.');
}

/**
 * Limpar nome da cidade (remove país e formatações extras)
 */
const cleanCityName = (cityName) => {
    if (!cityName) return '';
    
    // Remove ", BR" ou ", Brasil" do final
    let cleaned = cityName.replace(/,\s*(BR|Brasil)$/i, '').trim();
    
    // Remove acentos para melhor compatibilidade
    cleaned = cleaned.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    return cleaned;
};

/**
 * Busca dados do clima por nome da cidade
 * @param {string} cityName - Nome da cidade
 * @param {string} countryCode - Código do país (opcional, padrão: BR)
 * @returns {Promise<Object>} - Dados do clima
 */
export const getWeatherByCity = async (cityName, countryCode = 'BR') => {
    try {
        if (!cityName) {
            throw new Error('Nome da cidade é obrigatório');
        }

        // Limpar o nome da cidade
        const cleanedCity = cleanCityName(cityName);
        
        console.log('🌤️ Buscando clima para:', cleanedCity);

        // Montar query: "cidade,código_país"
        const query = `${cleanedCity},${countryCode}`;
        
        const apiUrl = `${BASE_URL}/weather?q=${encodeURIComponent(query)}&appid=${API_KEY}&units=metric&lang=pt_br`;
        
        console.log('📡 URL da API:', apiUrl.replace(API_KEY, 'API_KEY_HIDDEN'));
        
        const response = await fetch(apiUrl);
        const data = await response.json();

        console.log('📊 Resposta da API:', data);

        if (data.cod !== 200) {
            console.error('❌ Erro da API:', data.message);
            throw new Error(data.message || 'Cidade não encontrada');
        }

        return {
            success: true,
            data: {
                city: data.name,
                country: data.sys.country,
                temp: Math.round(data.main.temp),
                tempMax: Math.round(data.main.temp_max),
                tempMin: Math.round(data.main.temp_min),
                description: data.weather[0].description,
                tempIcon: data.weather[0].icon,
                windSpeed: data.wind.speed,
                humidity: data.main.humidity,
                pressure: data.main.pressure,
                visibility: data.visibility / 1000, // em km
                sunrise: new Date(data.sys.sunrise * 1000),
                sunset: new Date(data.sys.sunset * 1000),
                coordinates: {
                    lat: data.coord.lat,
                    lon: data.coord.lon
                }
            }
        };
    } catch (error) {
        console.error('❌ Erro ao buscar dados do clima:', error);
        return {
            success: false,
            error: error.message,
            data: null
        };
    }
};

/**
 * Busca dados do clima por CEP (usando ViaCEP + OpenWeather)
 * @param {string} cep - CEP da localidade
 * @returns {Promise<Object>} - Dados do clima
 */
export const getWeatherByCEP = async (cep) => {
    try {
        if (!cep) {
            throw new Error('CEP é obrigatório');
        }

        // Limpar CEP
        const cleanedCEP = cep.replace(/\D/g, '');
        
        console.log('🔍 Buscando localização por CEP:', cleanedCEP);

        // Buscar endereço pelo CEP
        const cepResponse = await fetch(`https://viacep.com.br/ws/${cleanedCEP}/json/`);
        const cepData = await cepResponse.json();

        if (cepData.erro) {
            throw new Error('CEP não encontrado');
        }

        const cidade = cepData.localidade;
        const estado = cepData.uf;

        console.log('📍 Localização encontrada:', cidade, estado);

        // Buscar clima pela cidade
        return await getWeatherByCity(cidade, 'BR');

    } catch (error) {
        console.error('❌ Erro ao buscar clima por CEP:', error);
        return {
            success: false,
            error: error.message,
            data: null
        };
    }
};

/**
 * Busca dados do clima por coordenadas
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} - Dados do clima
 */
export const getWeatherByCoordinates = async (lat, lon) => {
    try {
        if (!lat || !lon) {
            throw new Error('Coordenadas são obrigatórias');
        }

        console.log('🌍 Buscando clima por coordenadas:', { lat, lon });

        const apiUrl = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=pt_br`;
        
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.cod !== 200) {
            throw new Error(data.message || 'Localização não encontrada');
        }

        return {
            success: true,
            data: {
                city: data.name,
                country: data.sys.country,
                temp: Math.round(data.main.temp),
                tempMax: Math.round(data.main.temp_max),
                tempMin: Math.round(data.main.temp_min),
                description: data.weather[0].description,
                tempIcon: data.weather[0].icon,
                windSpeed: data.wind.speed,
                humidity: data.main.humidity,
                pressure: data.main.pressure,
                visibility: data.visibility / 1000,
                sunrise: new Date(data.sys.sunrise * 1000),
                sunset: new Date(data.sys.sunset * 1000),
                coordinates: {
                    lat: data.coord.lat,
                    lon: data.coord.lon
                }
            }
        };
    } catch (error) {
        console.error('❌ Erro ao buscar clima por coordenadas:', error);
        return {
            success: false,
            error: error.message,
            data: null
        };
    }
};

/**
 * Busca previsão de 5 dias
 * @param {string} cityName - Nome da cidade
 * @param {string} countryCode - Código do país (opcional)
 * @returns {Promise<Object>} - Previsão do tempo
 */
export const getWeatherForecast = async (cityName, countryCode = 'BR') => {
    try {
        if (!cityName) {
            throw new Error('Nome da cidade é obrigatório');
        }

        const cleanedCity = cleanCityName(cityName);
        const query = `${cleanedCity},${countryCode}`;

        const apiUrl = `${BASE_URL}/forecast?q=${encodeURIComponent(query)}&appid=${API_KEY}&units=metric&lang=pt_br`;
        
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.cod !== "200") {
            throw new Error(data.message || 'Cidade não encontrada');
        }

        return {
            success: true,
            data: {
                city: data.city.name,
                country: data.city.country,
                forecast: data.list.map(item => ({
                    date: new Date(item.dt * 1000),
                    temp: Math.round(item.main.temp),
                    tempMax: Math.round(item.main.temp_max),
                    tempMin: Math.round(item.main.temp_min),
                    description: item.weather[0].description,
                    icon: item.weather[0].icon,
                    humidity: item.main.humidity,
                    windSpeed: item.wind.speed
                }))
            }
        };
    } catch (error) {
        console.error('❌ Erro ao buscar previsão do tempo:', error);
        return {
            success: false,
            error: error.message,
            data: null
        };
    }
};

/**
 * Obtém localização atual do usuário
 * @returns {Promise<Object>} - Coordenadas
 */
export const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocalização não suportada'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                });
            },
            (error) => {
                reject(new Error('Erro ao obter localização: ' + error.message));
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minutos
            }
        );
    });
};

/**
 * Formata temperatura para exibição
 * @param {number} temp - Temperatura
 * @returns {string} - Temperatura formatada
 */
export const formatTemperature = (temp) => {
    return `${Math.round(temp)}°C`;
};

/**
 * Obtém ícone do clima da OpenWeather
 * @param {string} iconCode - Código do ícone
 * @returns {string} - URL do ícone
 */
export const getWeatherIcon = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
};

/**
 * Mapear códigos de clima para emojis
 */
export const getWeatherEmoji = (iconCode) => {
    const emojiMap = {
        '01d': '☀️', // céu limpo (dia)
        '01n': '🌙', // céu limpo (noite)
        '02d': '⛅', // poucas nuvens (dia)
        '02n': '☁️', // poucas nuvens (noite)
        '03d': '☁️', // nuvens dispersas
        '03n': '☁️',
        '04d': '☁️', // nuvens quebradas
        '04n': '☁️',
        '09d': '🌧️', // chuva
        '09n': '🌧️',
        '10d': '🌦️', // chuva (dia)
        '10n': '🌧️', // chuva (noite)
        '11d': '⛈️', // tempestade
        '11n': '⛈️',
        '13d': '❄️', // neve
        '13n': '❄️',
        '50d': '🌫️', // neblina
        '50n': '🌫️'
    };
    
    return emojiMap[iconCode] || '🌤️';
};