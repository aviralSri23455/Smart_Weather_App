import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { WeatherData } from '../types/weather';

interface ForecastData {
  dt: number;
  weather: Array<{
    icon: string;
    description: string;
  }>;
  main: {
    temp: number;
  };
}

interface WeatherState {
  currentWeather: WeatherData | null;
  forecast: ForecastData[];
  loading: boolean;
  error: string | null;
  unit: 'celsius' | 'fahrenheit';
}

const initialState: WeatherState = {
  currentWeather: null,
  forecast: [],
  loading: false,
  error: null,
  unit: 'celsius'
};

export const fetchWeather = createAsyncThunk(
  'weather/fetchWeather',
  async (city: string, { rejectWithValue }) => {
    try {
      const cityRegex = /^[a-zA-Z\s-]+$/;
      if (!cityRegex.test(city)) {
        return rejectWithValue('Please enter a valid city name (letters, spaces, and hyphens only)');
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.REACT_APP_API_KEY}&units=metric`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.cod === '404') {
          return rejectWithValue('City not found. Please check the spelling and try again.');
        }
        return rejectWithValue(errorData.message || 'Failed to fetch weather data');
      }
      
      const data = await response.json();
      localStorage.setItem('lastCity', city);
      localStorage.setItem('lastUpdate', new Date().toISOString());
      return data;
    } catch (error) {
      return rejectWithValue('Network error: Please check your connection');
    }
  }
);

export const fetchForecast = createAsyncThunk(
  'weather/fetchForecast',
  async (city: string, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${process.env.REACT_APP_API_KEY}&units=metric`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to fetch forecast data');
      }
      
      return response.json();
    } catch (error) {
      return rejectWithValue('Network error: Please check your connection');
    }
  }
);

const weatherSlice = createSlice({
  name: 'weather',
  initialState,
  reducers: {
    toggleUnit: (state) => {
      state.unit = state.unit === 'celsius' ? 'fahrenheit' : 'celsius';
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
      state.currentWeather = null;  // Clear weather data on error
      state.forecast = [];          // Clear forecast data on error
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWeather.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWeather.fulfilled, (state, action) => {
        state.loading = false;
        state.currentWeather = action.payload;
        state.error = null;
        localStorage.setItem('lastCity', action.payload.name);
        localStorage.setItem('lastUpdate', new Date().toISOString());
      })
      .addCase(fetchWeather.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Something went wrong';
        state.currentWeather = null;  // Clear weather data on error
        state.forecast = [];          // Clear forecast data on error
      })
      .addCase(fetchForecast.fulfilled, (state, action) => {
        state.forecast = action.payload.list;
      });
  },
});

export const { toggleUnit, setError } = weatherSlice.actions;
export default weatherSlice.reducer;