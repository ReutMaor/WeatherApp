import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Radio, Card, Typography, Select } from 'antd';
import './WeatherDisplay.css';
const { Title } = Typography;
const { Option } = Select;

const WeatherDisplay = ({ detectedCity, resetWeather }) => {
  const [forecastType, setForecastType] = useState('current');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchedCities, setSearchedCities] = useState([]); // To store previously searched cities
  const [selectedCity, setSelectedCity] = useState(detectedCity); // To store selected city


  const API_KEY = '4c247480902a513074a5929c2c9cd4f6';
  const CACHE_DURATION = 5 * 60 * 1000;
  const POLLING_INTERVAL = 5 * 60 * 1000; 
  const cache = useRef({});
  const pollingIntervalId = useRef(null); 

  const isCacheValid = (timestamp) => {
    const currentTime = new Date().getTime();
    return currentTime - timestamp < CACHE_DURATION;
  }

  
  const fetchWeatherData = async (city) => {
    setLoading(true);
    let url = '';

    const normalizedCity = city.trim().toLowerCase();

  
    switch (forecastType) {
      case 'current':
        url = `https://api.openweathermap.org/data/2.5/weather?q=${detectedCity}&appid=${API_KEY}&units=metric`;
        break;
      case '3-day':
        url = `https://api.openweathermap.org/data/2.5/forecast?q=${detectedCity}&appid=${API_KEY}&units=metric`;
        break;
      case '7-day':
        url = `https://api.openweathermap.org/data/2.5/forecast?q=${detectedCity}&appid=${API_KEY}&units=metric`;
        break;
      default:
        url = `https://api.openweathermap.org/data/2.5/weather?q=${detectedCity}&appid=${API_KEY}&units=metric`;
        break;
    }

    const cacheKey = `${normalizedCity}-${forecastType}`;
    console.log("Checking cache for", cacheKey);
    if (cache.current[cacheKey] && isCacheValid(cache.current[cacheKey].timestamp)) {
      console.log('Using cached data for ${cacheKey}');
      setWeatherData(cache.current[cacheKey].data);
      setLoading(false);
      return;
    }
  
    try {
      console.log(`Fetching new data from API for ${cacheKey}`);
      const response = await axios.get(url);
      const data = response.data;
      console.log("Data received from API:", data)
  
      // For 3-day and 7-day, process the data from the 5-day forecast
      if (forecastType === '3-day' || forecastType === '7-day') {
        const days = forecastType === '3-day' ? 3 : 7;
        // Group data by day
        const dailyData = [];
        const today = new Date().getDate();
  
        data.list.forEach((item) => {
          const date = new Date(item.dt_txt).getDate();
          if (date !== today && dailyData.length < days) {
            dailyData.push(item);
          }
        });
  
        setWeatherData({ list: dailyData });
        cache.current[cacheKey] = { data: { list: dailyData }, timestamp: new Date().getTime() };
      } else {
        setWeatherData(data);
        cache.current[cacheKey] = { data, timestamp: new Date().getTime() };
      }

      setSearchedCities((prevCities) => {
        if (!prevCities.includes(city)) {
          return [...prevCities, city]; // Add city only if it isn't already in the list
        }
        return prevCities; // Return the same list if city is already included
      });

    } catch (error) {
      console.error('Error fetching weather data', error);
    }
  
    setLoading(false);
  };
  

  useEffect(() => {
    if (detectedCity && !resetWeather) {
      setSelectedCity(detectedCity);
      fetchWeatherData(detectedCity);
    }
  }, [detectedCity, forecastType, resetWeather]);

  useEffect(() => {
    if (resetWeather) {
      setWeatherData(null);  // Clear weather data on reset
    }
  }, [resetWeather]);

  useEffect(() => {
    // Start polling when there's a selected city
    if (selectedCity) {
      // Clear any existing interval
      if (pollingIntervalId.current) {
        clearInterval(pollingIntervalId.current);
      }

      // Set up polling to refresh weather data every 5 minutes
      pollingIntervalId.current = setInterval(() => {
        console.log(`Refreshing weather data for ${selectedCity}`);
        fetchWeatherData(selectedCity);
      }, POLLING_INTERVAL);

      // Cleanup interval when component unmounts or selectedCity changes
      return () => clearInterval(pollingIntervalId.current);
    }
  }, [selectedCity]);

  const handleForecastChange = (e) => {
    setForecastType(e.target.value);
    setWeatherData(null);  // Clear weather data when switching forecast types
  };

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    fetchWeatherData(city); // Fetch data for the newly selected city
  };

  return (
    <div>
      <Title level={3}>Weather in {detectedCity}</Title>
      <Radio.Group onChange={handleForecastChange} value={forecastType}>
        <Radio.Button value="current">Current Weather</Radio.Button>
        <Radio.Button value="3-day">3-Day Forecast</Radio.Button>
        <Radio.Button value="7-day">7-Day Forecast</Radio.Button>
      </Radio.Group>

      {loading ? (
        <p>Loading weather data...</p>
      ) : weatherData ? (
        <div style={{ marginTop: 16 }}>
          {forecastType === 'current' && weatherData.main ? (
            <Card title="Current Weather">
              <p>Temperature: {weatherData.main.temp}°C</p>
              <p>Humidity: {weatherData.main.humidity}%</p>
              <p>Wind Speed: {weatherData.wind.speed} m/s</p>
              <p>Weather: {weatherData.weather[0].description}</p>
            </Card>
          ) : null}

{(forecastType === '3-day' || forecastType === '7-day') && weatherData.list ? (
  <div className="weather-forecast">
  {weatherData.list.map((day, index) => (
    <div className="day-card" key={index}>
      <Card title={`Day ${index + 1}`}>
        <p>Temperature: {day.main.temp}°C</p>
        <p>Humidity: {day.main.humidity}%</p>
        <p>Wind Speed: {day.wind.speed} m/s</p>
        <p>Weather: {day.weather[0].description}</p>
      </Card>
    </div>
  ))}
</div>
) : null}
        </div>
      ) : (
        <p>No weather data available</p>
      )}
    </div>
  );
};

export default WeatherDisplay;
