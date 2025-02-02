import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import styles from './WeatherDisplay.module.css';

const WeatherDisplay: React.FC = () => {
  const { currentWeather } = useSelector((state: RootState) => state.weather);
  const [isCelsius, setIsCelsius] = useState(true);

  if (!currentWeather) return null;

  const convertTemp = (temp: number) => {
    if (isCelsius) return temp;
    return (temp * 9/5) + 32;
  };

  const getWeatherIcon = (condition: string) => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('rain')) return '🌧️';
    if (lowerCondition.includes('cloud')) return '☁️';
    if (lowerCondition.includes('clear')) return '☀️';
    if (lowerCondition.includes('snow')) return '❄️';
    if (lowerCondition.includes('fog')) return '🌫️';
    if (lowerCondition.includes('mist')) return '🌫️';
    if (lowerCondition.includes('thunder')) return '⛈️';
    return '🌤️';
  };

  const getWeatherBackground = (condition: string) => {
    const conditions: { [key: string]: string } = {
      'Clear': 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
      'Clouds': 'linear-gradient(135deg, #65a5f6 0%, #85b5fd 100%)',
      'Rain': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'Snow': 'linear-gradient(135deg, #e6e9f0 0%, #eef1f5 100%)',
      'Thunderstorm': 'linear-gradient(135deg, #414345 0%, #232526 100%)',
      'Drizzle': 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
      'Mist': 'linear-gradient(135deg, #c1c1c1 0%, #9c9c9c 100%)'
    };
    return conditions[condition] || conditions['Clear'];
  };

  const getWeatherAdvice = (condition: string, temp: number) => {
    if (temp > 30) return "Stay hydrated and seek shade when possible";
    if (temp < 10) return "Bundle up, it's cold outside!";
    if (condition === 'Rain') return "Don't forget your umbrella!";
    if (condition === 'Snow') return "Drive carefully and stay warm";
    return "Great weather for outdoor activities!";
  };

  return (
    <div className={styles.container}>
      <div className={styles.weatherCard}>
        <div className={styles.mainContent}>
          <h2 className={styles.city}>{currentWeather.name}</h2>
          
          <div className={styles.tempContainer}>
            <div className={styles.temperature}>
              {convertTemp(currentWeather.main.temp).toFixed(1)}°
              <button 
                className={styles.unitToggle}
                onClick={() => setIsCelsius(!isCelsius)}
              >
                {isCelsius ? 'C' : 'F'}
              </button>
            </div>
            
            <div className={styles.description}>
              {currentWeather.weather[0].description}
            </div>
          </div>

          <div className={styles.details}>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>Humidity</div>
              <div className={styles.detailValue}>
                💧 {currentWeather.main.humidity}%
              </div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>Wind Speed</div>
              <div className={styles.detailValue}>
                💨 {currentWeather.wind.speed} m/s
              </div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>Weather</div>
              <div className={styles.detailValue}>
                ☁️ {currentWeather.weather[0].main}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherDisplay; 