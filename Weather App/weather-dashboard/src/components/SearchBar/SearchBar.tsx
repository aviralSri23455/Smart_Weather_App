import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store/store';
import { fetchWeather, fetchForecast, setError } from '../../store/weatherSlice';
import styles from './SearchBar.module.css';

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds

// Common animal names to check against
const COMMON_ANIMALS = [
  'dog', 'cat', 'lion', 'tiger', 'elephant', 'giraffe', 'zebra', 'monkey',
  'bear', 'wolf', 'fox', 'deer', 'rabbit', 'mouse', 'rat', 'snake', 'bird',
  'fish', 'whale', 'dolphin', 'shark', 'octopus', 'eagle', 'hawk', 'owl'
];

const SearchBar: React.FC = () => {
  const [city, setCity] = useState('');
  const dispatch = useDispatch<AppDispatch>();

  const validateCityName = (cityName: string) => {
    // Convert to lowercase for comparison
    const lowercaseCity = cityName.toLowerCase();
    
    // Check if it's an animal name
    if (COMMON_ANIMALS.includes(lowercaseCity)) {
      dispatch(setError('Please enter a valid city name, not an animal name'));
      return false;
    }

    // Check for valid characters
    if (!/^[a-zA-Z\s-]+$/.test(cityName)) {
      dispatch(setError('City name should only contain letters, spaces, and hyphens'));
      return false;
    }

    return true;
  };

  const fetchWeatherData = useCallback(async (cityName: string) => {
    try {
      if (!validateCityName(cityName)) {
        return;
      }

      // Pre-validate with a quick API check
      const validateResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${process.env.REACT_APP_API_KEY}&units=metric`
      );

      if (!validateResponse.ok) {
        dispatch(setError('City not found. Please enter a valid city name.'));
        return;
      }

      // If validation passes, fetch the weather data
      await dispatch(fetchWeather(cityName));
      await dispatch(fetchForecast(cityName));
    } catch (error) {
      dispatch(setError('Failed to fetch weather data. Please try again.'));
    }
  }, [dispatch]);

  // Auto-refresh weather data
  useEffect(() => {
    const refreshData = () => {
      const lastCity = localStorage.getItem('lastCity');
      const lastUpdate = localStorage.getItem('lastUpdate');

      if (lastCity && lastUpdate) {
        const timeSinceLastUpdate = Date.now() - new Date(lastUpdate).getTime();
        if (timeSinceLastUpdate >= REFRESH_INTERVAL) {
          console.log('Auto-refreshing weather data...');
          fetchWeatherData(lastCity);
        }
      }
    };

    // Initial check
    refreshData();

    // Set up interval
    const intervalId = setInterval(refreshData, REFRESH_INTERVAL);

    // Cleanup
    return () => clearInterval(intervalId);
  }, [fetchWeatherData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedCity = city.trim();
    
    if (!trimmedCity) {
      dispatch(setError('Please enter a city name'));
      return;
    }

    await fetchWeatherData(trimmedCity);
    setCity('');
  };

  return (
    <form className={styles.searchBar} onSubmit={handleSubmit}>
      <div className={styles.inputWrapper}>
        <i className="fas fa-search"></i>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city name..."
          className={styles.input}
        />
      </div>
      <button type="submit" className={styles.button}>
        Search
      </button>
    </form>
  );
};

export default SearchBar; 