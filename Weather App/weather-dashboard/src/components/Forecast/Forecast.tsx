import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import styles from './Forecast.module.css';

const Forecast = () => {
  const { forecast, unit } = useSelector((state: RootState) => state.weather);

  const convertTemp = (temp: number) => {
    return unit === 'fahrenheit' ? (temp * 9/5) + 32 : temp;
  };

  return (
    <div className={styles.forecast}>
      <h2>5-Day Forecast</h2>
      <div className={styles.forecastGrid}>
        {forecast.filter((item, idx) => idx % 8 === 0).map((item, idx) => (
          <div key={idx} className={styles.forecastCard}>
            <div>{new Date(item.dt * 1000).toLocaleDateString()}</div>
            <img 
              src={`http://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
              alt={item.weather[0].description}
            />
            <div>{Math.round(convertTemp(item.main.temp))}°{unit === 'celsius' ? 'C' : 'F'}</div>
            <div>{item.weather[0].description}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Forecast;