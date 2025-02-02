import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { toggleUnit } from '../../store/weatherSlice';
import styles from './WeatherInfo.module.css';

const WeatherInfo = () => {
  const dispatch = useDispatch();
  const { currentWeather, unit } = useSelector((state: RootState) => state.weather);

  if (!currentWeather) return null;

  const convertTemp = (temp: number) => {
    return unit === 'fahrenheit' ? (temp * 9/5) + 32 : temp;
  };

  return (
    <div className={styles.weatherInfo}>
      <h2>{currentWeather.name}</h2>
      <img 
        src={`http://openweathermap.org/img/wn/${currentWeather.weather[0].icon}@2x.png`}
        alt={currentWeather.weather[0].description}
      />
      <div className={styles.temperature}>
        {Math.round(convertTemp(currentWeather.main.temp))}°
        <button onClick={() => dispatch(toggleUnit())}>
          {unit === 'celsius' ? 'C' : 'F'}
        </button>
      </div>
      <div>{currentWeather.weather[0].description}</div>
      <div>Humidity: {currentWeather.main.humidity}%</div>
      <div>Wind Speed: {currentWeather.wind.speed} m/s</div>
    </div>
  );
};

export default WeatherInfo;