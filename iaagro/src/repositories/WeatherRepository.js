import { 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    setDoc, 
    deleteDoc,  // ← ADICIONAR ESTE IMPORT
    query, 
    where, 
    orderBy, 
    limit 
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { WeatherData } from '../models/WeatherData';

export class WeatherRepository {
    constructor() {
        this.collection = 'weather_cache';
    }

    // Buscar dados climáticos em cache por cidade
    async findByCity(cityName) {
        try {
            const docId = this.generateCityId(cityName);
            const weatherDoc = await getDoc(doc(db, this.collection, docId));
            
            if (weatherDoc.exists()) {
                const data = weatherDoc.data();
                const weatherData = new WeatherData(data);
                
                // Verificar se os dados não estão muito antigos (30 minutos)
                if (weatherData.isDataFresh(30)) {
                    return weatherData;
                }
            }
            
            return null;
        } catch (error) {
            throw new Error(`Erro ao buscar dados climáticos em cache: ${error.message}`);
        }
    }

    // Salvar dados climáticos no cache
    async saveWeatherCache(weatherData) {
        try {
            const docId = this.generateCityId(weatherData.city);
            
            await setDoc(doc(db, this.collection, docId), {
                ...weatherData.toJSON(),
                cachedAt: new Date()
            });
            
            return weatherData;
        } catch (error) {
            throw new Error(`Erro ao salvar cache climático: ${error.message}`);
        }
    }

    // Buscar histórico climático de um usuário
    async findUserWeatherHistory(userId, limitCount = 30) {
        try {
            const q = query(
                collection(db, 'user_weather_history'),
                where('userId', '==', userId),
                orderBy('timestamp', 'desc'),
                limit(limitCount)
            );
            
            const querySnapshot = await getDocs(q);
            const weatherHistory = [];
            
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                weatherHistory.push(new WeatherData(data));
            });
            
            return weatherHistory;
        } catch (error) {
            throw new Error(`Erro ao buscar histórico climático: ${error.message}`);
        }
    }

    // Salvar no histórico do usuário
    async saveUserWeatherHistory(userId, weatherData) {
        try {
            const historyData = {
                userId,
                ...weatherData.toJSON(),
                savedAt: new Date()
            };
            
            // Usar timestamp como ID para evitar duplicatas do mesmo momento
            const docId = `${userId}_${weatherData.timestamp.getTime()}`;
            
            await setDoc(doc(db, 'user_weather_history', docId), historyData);
            
            return weatherData;
        } catch (error) {
            throw new Error(`Erro ao salvar histórico climático: ${error.message}`);
        }
    }

    // Buscar dados climáticos por coordenadas (cache)
    async findByCoordinates(lat, lon) {
        try {
            const docId = this.generateCoordinatesId(lat, lon);
            const weatherDoc = await getDoc(doc(db, this.collection, docId));
            
            if (weatherDoc.exists()) {
                const data = weatherDoc.data();
                const weatherData = new WeatherData(data);
                
                if (weatherData.isDataFresh(30)) {
                    return weatherData;
                }
            }
            
            return null;
        } catch (error) {
            throw new Error(`Erro ao buscar dados por coordenadas: ${error.message}`);
        }
    }

    // Salvar cache por coordenadas
    async saveCoordinatesCache(lat, lon, weatherData) {
        try {
            const docId = this.generateCoordinatesId(lat, lon);
            
            await setDoc(doc(db, this.collection, docId), {
                ...weatherData.toJSON(),
                coordinates: { lat, lon },
                cachedAt: new Date()
            });
            
            return weatherData;
        } catch (error) {
            throw new Error(`Erro ao salvar cache por coordenadas: ${error.message}`);
        }
    }

    // Buscar alertas climáticos para uma região
    async findWeatherAlerts(cityName) {
        try {
            const q = query(
                collection(db, 'weather_alerts'),
                where('city', '==', cityName),
                where('active', '==', true),
                orderBy('severity', 'desc')
            );
            
            const querySnapshot = await getDocs(q);
            const alerts = [];
            
            querySnapshot.forEach((doc) => {
                alerts.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            return alerts;
        } catch (error) {
            throw new Error(`Erro ao buscar alertas climáticos: ${error.message}`);
        }
    }

    // Métodos utilitários
    generateCityId(cityName) {
        return cityName.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove acentos
            .replace(/[^a-z0-9]/g, '_');
    }

    generateCoordinatesId(lat, lon) {
        // Arredonda coordenadas para criar cache regional
        const roundedLat = Math.round(lat * 100) / 100;
        const roundedLon = Math.round(lon * 100) / 100;
        return `coord_${roundedLat}_${roundedLon}`;
    }

    // Limpar cache antigo (executar periodicamente)
    async cleanOldCache(hoursOld = 24) {
        try {
            const cutoffTime = new Date(Date.now() - (hoursOld * 60 * 60 * 1000));
            
            const q = query(
                collection(db, this.collection),
                where('cachedAt', '<', cutoffTime)
            );
            
            const querySnapshot = await getDocs(q);
            const deletePromises = [];
            
            querySnapshot.forEach((doc) => {
                deletePromises.push(deleteDoc(doc.ref));
            });
            
            await Promise.all(deletePromises);
            
            return deletePromises.length;
        } catch (error) {
            throw new Error(`Erro ao limpar cache antigo: ${error.message}`);
        }
    }
}