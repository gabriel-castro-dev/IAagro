import { WeatherRepository } from '../repositories/WeatherRepository';
import { WeatherData } from '../models/WeatherData';
import { getWeatherByCity, getWeatherByCoordinates, getCurrentLocation } from '../services/weatherService';

export class WeatherController {
    constructor() {
        this.weatherRepository = new WeatherRepository();
    }

    // Obter dados climáticos por cidade (com cache)
    async getWeatherByCity(cityName, userId = null) {
        try {
            if (!cityName) {
                throw new Error('Nome da cidade é obrigatório');
            }

            // Tentar buscar no cache primeiro
            let weatherData = await this.weatherRepository.findByCity(cityName);

            if (!weatherData) {
                // Se não está no cache, buscar na API
                const apiResponse = await getWeatherByCity(cityName);
                
                if (!apiResponse.success) {
                    return {
                        success: false,
                        error: apiResponse.error || 'Erro ao buscar dados climáticos'
                    };
                }

                // Converter para modelo
                weatherData = WeatherData.fromAPIResponse(apiResponse.data);
                
                // Salvar no cache
                await this.weatherRepository.saveWeatherCache(weatherData);
            }

            // Se tem userId, salvar no histórico do usuário
            if (userId) {
                await this.weatherRepository.saveUserWeatherHistory(userId, weatherData);
            }

            return {
                success: true,
                data: weatherData,
                fromCache: !!weatherData
            };
        } catch (error) {
            console.error('Erro no WeatherController.getWeatherByCity:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Obter dados climáticos por coordenadas
    async getWeatherByCoordinates(lat, lon, userId = null) {
        try {
            if (!lat || !lon) {
                throw new Error('Latitude e longitude são obrigatórias');
            }

            // Tentar buscar no cache
            let weatherData = await this.weatherRepository.findByCoordinates(lat, lon);

            if (!weatherData) {
                // Buscar na API
                const apiResponse = await getWeatherByCoordinates(lat, lon);
                
                if (!apiResponse.success) {
                    return {
                        success: false,
                        error: apiResponse.error || 'Erro ao buscar dados climáticos'
                    };
                }

                // Converter para modelo
                weatherData = WeatherData.fromAPIResponse(apiResponse.data);
                
                // Salvar no cache
                await this.weatherRepository.saveCoordinatesCache(lat, lon, weatherData);
            }

            // Salvar no histórico do usuário
            if (userId) {
                await this.weatherRepository.saveUserWeatherHistory(userId, weatherData);
            }

            return {
                success: true,
                data: weatherData,
                fromCache: !!weatherData
            };
        } catch (error) {
            console.error('Erro no WeatherController.getWeatherByCoordinates:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Obter clima atual do usuário baseado no perfil
    async getCurrentUserWeather(user) {
        try {
            if (!user) {
                throw new Error('Dados do usuário são obrigatórios');
            }

            let result;

            // Prioridade 1: CEP
            if (user.profile.cep) {
                const cityName = `${user.profile.cidade}, ${user.profile.estado}`;
                result = await this.getWeatherByCity(cityName, user.id);
                
                if (result.success) {
                    return {
                        ...result,
                        source: 'cep'
                    };
                }
            }

            // Prioridade 2: Cidade/Estado manual
            if (user.profile.cidade && user.profile.estado) {
                const cityName = `${user.profile.cidade}, ${user.profile.estado}`;
                result = await this.getWeatherByCity(cityName, user.id);
                
                if (result.success) {
                    return {
                        ...result,
                        source: 'cidade'
                    };
                }
            }

            // Prioridade 3: Geolocalização (se disponível)
            try {
                const location = await getCurrentLocation();
                result = await this.getWeatherByCoordinates(location.lat, location.lon, user.id);
                
                if (result.success) {
                    return {
                        ...result,
                        source: 'geolocation'
                    };
                }
            } catch (geoError) {
                console.warn('Geolocalização não disponível:', geoError.message);
            }

            return {
                success: false,
                error: 'Não foi possível obter dados climáticos. Verifique seu perfil.'
            };
        } catch (error) {
            console.error('Erro no WeatherController.getCurrentUserWeather:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Obter histórico climático do usuário
    async getUserWeatherHistory(userId, limit = 30) {
        try {
            const history = await this.weatherRepository.findUserWeatherHistory(userId, limit);

            return {
                success: true,
                data: history,
                count: history.length
            };
        } catch (error) {
            console.error('Erro no WeatherController.getUserWeatherHistory:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Analisar condições climáticas para agricultura
    async analyzeWeatherForAgriculture(weatherData) {
        try {
            if (!weatherData || !weatherData.isValidData()) {
                throw new Error('Dados climáticos inválidos');
            }

            const analysis = {
                temperature: weatherData.getTemperatureStatus(),
                humidity: weatherData.getHumidityStatus(),
                wind: weatherData.getWindStatus(),
                recommendations: weatherData.getAgricultureRecommendations(),
                
                // Índices personalizados
                plantingCondition: this.calculatePlantingCondition(weatherData),
                irrigationNeed: this.calculateIrrigationNeed(weatherData),
                sprayingCondition: this.calculateSprayingCondition(weatherData),
                
                // Alertas
                alerts: this.generateWeatherAlerts(weatherData)
            };

            return {
                success: true,
                data: analysis
            };
        } catch (error) {
            console.error('Erro no WeatherController.analyzeWeatherForAgriculture:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Obter alertas climáticos para região
    async getWeatherAlerts(cityName) {
        try {
            const alerts = await this.weatherRepository.findWeatherAlerts(cityName);

            return {
                success: true,
                data: alerts,
                count: alerts.length
            };
        } catch (error) {
            console.error('Erro no WeatherController.getWeatherAlerts:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Limpar cache antigo
    async cleanOldCache(hoursOld = 24) {
        try {
            const deletedCount = await this.weatherRepository.cleanOldCache(hoursOld);

            return {
                success: true,
                message: `${deletedCount} registros de cache antigo removidos`
            };
        } catch (error) {
            console.error('Erro no WeatherController.cleanOldCache:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Métodos auxiliares para análise
    calculatePlantingCondition(weatherData) {
        let score = 100;
        
        // Temperatura ideal: 15-30°C
        if (weatherData.temp < 15 || weatherData.temp > 30) {
            score -= 30;
        }
        
        // Umidade ideal: 40-70%
        if (weatherData.humidity < 40 || weatherData.humidity > 70) {
            score -= 20;
        }
        
        // Vento: não muito forte
        if (weatherData.windSpeed > 8) {
            score -= 25;
        }
        
        score = Math.max(0, score);
        
        if (score >= 80) return { level: 'excellent', text: 'Excelente', color: '#7ED321' };
        if (score >= 60) return { level: 'good', text: 'Boa', color: '#F5A623' };
        if (score >= 40) return { level: 'fair', text: 'Regular', color: '#BD10E0' };
        return { level: 'poor', text: 'Ruim', color: '#D0021B' };
    }

    calculateIrrigationNeed(weatherData) {
        let need = 0;
        
        // Base na umidade
        if (weatherData.humidity < 40) need += 3;
        else if (weatherData.humidity < 60) need += 1;
        
        // Base na temperatura
        if (weatherData.temp > 30) need += 2;
        else if (weatherData.temp > 25) need += 1;
        
        // Base no vento (resseca o solo)
        if (weatherData.windSpeed > 5) need += 1;
        
        if (need >= 4) return { level: 'high', text: 'Alta necessidade', color: '#D0021B' };
        if (need >= 2) return { level: 'medium', text: 'Necessidade moderada', color: '#F5A623' };
        return { level: 'low', text: 'Baixa necessidade', color: '#7ED321' };
    }

    calculateSprayingCondition(weatherData) {
        let score = 100;
        
        // Vento ideal: menos de 10 km/h (2.8 m/s)
        if (weatherData.windSpeed > 2.8) {
            score -= 40;
        }
        
        // Temperatura: não muito quente
        if (weatherData.temp > 30) {
            score -= 30;
        }
        
        // Umidade: não muito alta
        if (weatherData.humidity > 80) {
            score -= 20;
        }
        
        score = Math.max(0, score);
        
        if (score >= 80) return { level: 'excellent', text: 'Excelente', color: '#7ED321' };
        if (score >= 60) return { level: 'good', text: 'Boa', color: '#F5A623' };
        if (score >= 40) return { level: 'caution', text: 'Cuidado', color: '#BD10E0' };
        return { level: 'avoid', text: 'Evitar', color: '#D0021B' };
    }

    generateWeatherAlerts(weatherData) {
        const alerts = [];
        
        // Alertas de temperatura
        if (weatherData.temp < 5) {
            alerts.push({
                type: 'freeze',
                severity: 'high',
                message: 'Risco de geada - Proteja as culturas!'
            });
        } else if (weatherData.temp > 40) {
            alerts.push({
                type: 'heat',
                severity: 'high',
                message: 'Temperatura muito alta - Monitore estresse hídrico!'
            });
        }
        
        // Alertas de vento
        if (weatherData.windSpeed > 15) {
            alerts.push({
                type: 'wind',
                severity: 'medium',
                message: 'Ventos fortes - Evite aplicações e proteja estruturas!'
            });
        }
        
        // Alertas de umidade
        if (weatherData.humidity > 90) {
            alerts.push({
                type: 'humidity',
                severity: 'medium',
                message: 'Umidade muito alta - Monitore doenças fúngicas!'
            });
        }
        
        return alerts;
    }
}