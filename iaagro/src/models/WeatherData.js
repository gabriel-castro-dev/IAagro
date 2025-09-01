export class WeatherData {
    constructor(data = {}) {
        this.city = data.city || '';
        this.country = data.country || '';
        this.temp = data.temp || 0;
        this.tempMin = data.tempMin || 0;
        this.tempMax = data.tempMax || 0;
        this.humidity = data.humidity || 0;
        this.pressure = data.pressure || 0;
        this.windSpeed = data.windSpeed || 0;
        this.windDeg = data.windDeg || 0;
        this.visibility = data.visibility || 0;
        this.weather = data.weather || {
            main: '',
            description: '',
            icon: ''
        };
        this.sunrise = data.sunrise || null;
        this.sunset = data.sunset || null;
        this.coordinates = data.coordinates || { lat: 0, lon: 0 };
        this.timestamp = data.timestamp || new Date();
    }

    // Métodos de formatação
    getFormattedTemperature() {
        return `${Math.round(this.temp)}°C`;
    }

    getTemperatureRange() {
        return `${Math.round(this.tempMin)}°C - ${Math.round(this.tempMax)}°C`;
    }

    getFormattedHumidity() {
        return `${this.humidity}%`;
    }

    getFormattedWindSpeed() {
        return `${this.windSpeed} m/s`;
    }

    getFormattedVisibility() {
        return `${this.visibility} km`;
    }

    getWindDirection() {
        const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
        const index = Math.round(this.windDeg / 22.5) % 16;
        return directions[index];
    }

    getWeatherIconUrl() {
        if (!this.weather.icon) return '';
        return `https://openweathermap.org/img/wn/${this.weather.icon}@2x.png`;
    }

    // Análises climáticas
    getTemperatureStatus() {
        if (this.temp < 10) return { status: 'cold', text: 'Muito Frio', color: '#4A90E2' };
        if (this.temp < 20) return { status: 'cool', text: 'Fresco', color: '#7ED321' };
        if (this.temp < 30) return { status: 'warm', text: 'Agradável', color: '#F5A623' };
        return { status: 'hot', text: 'Quente', color: '#D0021B' };
    }

    getHumidityStatus() {
        if (this.humidity < 30) return { status: 'low', text: 'Baixa', color: '#D0021B' };
        if (this.humidity < 60) return { status: 'normal', text: 'Normal', color: '#7ED321' };
        if (this.humidity < 80) return { status: 'high', text: 'Alta', color: '#F5A623' };
        return { status: 'very-high', text: 'Muito Alta', color: '#4A90E2' };
    }

    getWindStatus() {
        if (this.windSpeed < 3) return { status: 'calm', text: 'Calmo', color: '#7ED321' };
        if (this.windSpeed < 7) return { status: 'light', text: 'Brisa Leve', color: '#F5A623' };
        if (this.windSpeed < 12) return { status: 'moderate', text: 'Vento Moderado', color: '#D0021B' };
        return { status: 'strong', text: 'Vento Forte', color: '#B91C3C' };
    }

    // Recomendações agrícolas
    getAgricultureRecommendations() {
        const recommendations = [];
        
        // Temperatura
        if (this.temp < 5) {
            recommendations.push({
                type: 'warning',
                message: 'Risco de geada - proteja culturas sensíveis'
            });
        } else if (this.temp > 35) {
            recommendations.push({
                type: 'warning',
                message: 'Temperatura alta - aumente irrigação'
            });
        }
        
        // Umidade
        if (this.humidity > 80) {
            recommendations.push({
                type: 'info',
                message: 'Umidade alta - monitore doenças fúngicas'
            });
        } else if (this.humidity < 30) {
            recommendations.push({
                type: 'warning',
                message: 'Umidade baixa - considere irrigação'
            });
        }
        
        // Vento
        if (this.windSpeed > 10) {
            recommendations.push({
                type: 'warning',
                message: 'Vento forte - evite aplicações de defensivos'
            });
        }
        
        return recommendations;
    }

    // Verificações
    isDataFresh(maxAgeMinutes = 30) {
        const now = new Date();
        const ageMinutes = (now - this.timestamp) / (1000 * 60);
        return ageMinutes <= maxAgeMinutes;
    }

    isValidData() {
        return !!(this.city && this.temp !== undefined && this.humidity !== undefined);
    }

    // Serialização
    toJSON() {
        return {
            city: this.city,
            country: this.country,
            temp: this.temp,
            tempMin: this.tempMin,
            tempMax: this.tempMax,
            humidity: this.humidity,
            pressure: this.pressure,
            windSpeed: this.windSpeed,
            windDeg: this.windDeg,
            visibility: this.visibility,
            weather: this.weather,
            sunrise: this.sunrise,
            sunset: this.sunset,
            coordinates: this.coordinates,
            timestamp: this.timestamp
        };
    }

    // Factory method
    static fromAPIResponse(apiData) {
        return new WeatherData({
            city: apiData.name,
            country: apiData.sys?.country,
            temp: apiData.main?.temp,
            tempMin: apiData.main?.temp_min,
            tempMax: apiData.main?.temp_max,
            humidity: apiData.main?.humidity,
            pressure: apiData.main?.pressure,
            windSpeed: apiData.wind?.speed,
            windDeg: apiData.wind?.deg,
            visibility: apiData.visibility / 1000,
            weather: {
                main: apiData.weather?.[0]?.main,
                description: apiData.weather?.[0]?.description,
                icon: apiData.weather?.[0]?.icon
            },
            sunrise: apiData.sys?.sunrise ? new Date(apiData.sys.sunrise * 1000) : null,
            sunset: apiData.sys?.sunset ? new Date(apiData.sys.sunset * 1000) : null,
            coordinates: {
                lat: apiData.coord?.lat,
                lon: apiData.coord?.lon
            },
            timestamp: new Date()
        });
    }
}