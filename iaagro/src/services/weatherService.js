/**
 * Serviço para dados meteorológicos
 * Utiliza a API do OpenWeatherMap
 */

// Configurações da API usando variáveis de ambiente
const API_KEY = process.env.REACT_APP_WEATHER_API_KEY || '8a60b2de14f7a17c7a11706b2cfcd87c'; // Fallback temporário
const BASE_URL = process.env.REACT_APP_WEATHER_BASE_URL || 'https://api.openweathermap.org/data/2.5';

// Verificação de API Key
if (!process.env.REACT_APP_WEATHER_API_KEY && process.env.NODE_ENV === 'production') {
    console.warn('⚠️ Weather API Key não encontrada nas variáveis de ambiente');
}

/**
 * Busca dados do clima por nome da cidade
 * @param {string} cityName - Nome da cidade
 * @returns {Promise<Object>} - Dados do clima
 */
export const getWeatherByCity = async (cityName) => {
    try {
        if (!cityName) {
            throw new Error('Nome da cidade é obrigatório');
        }

        const apiUrl = `${BASE_URL}/weather?q=${encodeURI(cityName)}&appid=${API_KEY}&units=metric&lang=pt_br`;
        
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.cod !== 200) {
            throw new Error(data.message || 'Cidade não encontrada');
        }

        return {
            success: true,
            data: {
                city: data.name,
                country: data.sys.country,
                temp: data.main.temp,
                tempMax: data.main.temp_max,
                tempMin: data.main.temp_min,
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
        console.error('Erro ao buscar dados do clima:', error);
        return {
            success: false,
            error: error.message
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
                temp: data.main.temp,
                tempMax: data.main.temp_max,
                tempMin: data.main.temp_min,
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
        console.error('Erro ao buscar dados do clima por coordenadas:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Busca previsão de 5 dias
 * @param {string} cityName - Nome da cidade
 * @returns {Promise<Object>} - Previsão do tempo
 */
export const getWeatherForecast = async (cityName) => {
    try {
        if (!cityName) {
            throw new Error('Nome da cidade é obrigatório');
        }

        const apiUrl = `${BASE_URL}/forecast?q=${encodeURI(cityName)}&appid=${API_KEY}&units=metric&lang=pt_br`;
        
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
                    temp: item.main.temp,
                    tempMax: item.main.temp_max,
                    tempMin: item.main.temp_min,
                    description: item.weather[0].description,
                    icon: item.weather[0].icon,
                    humidity: item.main.humidity,
                    windSpeed: item.wind.speed
                }))
            }
        };
    } catch (error) {
        console.error('Erro ao buscar previsão do tempo:', error);
        return {
            success: false,
            error: error.message
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
    return `${temp.toFixed(1).toString().replace('.', ',')}°C`;
};

/**
 * Obtém ícone do clima da OpenWeather
 * @param {string} iconCode - Código do ícone
 * @returns {string} - URL do ícone
 */
export const getWeatherIcon = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
};