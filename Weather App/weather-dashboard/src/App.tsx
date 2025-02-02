import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import SearchBar from './components/SearchBar/SearchBar';
import WeatherInfo from './components/WeatherInfo/WeatherInfo';
import Forecast from './components/Forecast/Forecast';
import ErrorMessage from './components/ErrorMessage/ErrorMessage';
import WeatherAI from './components/WeatherAI/WeatherAI';
import { fetchWeather, fetchForecast } from './store/weatherSlice';
import { AppDispatch } from './store/store';
import styles from './App.module.css';

function App() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const lastCity = localStorage.getItem('lastCity');
    if (lastCity) {
      dispatch(fetchWeather(lastCity));
      dispatch(fetchForecast(lastCity));
    }
  }, [dispatch]);

  useEffect(() => {
    const interval = setInterval(() => {
      const lastCity = localStorage.getItem('lastCity');
      if (lastCity) {
        dispatch(fetchWeather(lastCity));
        dispatch(fetchForecast(lastCity));
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <h1>Weather Dashboard</h1>
        <SearchBar />
        <ErrorMessage />
        <WeatherAI />
        <Forecast />
      </div>
    </div>
  );
}

export default App;