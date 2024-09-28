import React, { useState, useEffect } from 'react'; 
import { Radio, Select, Input, Button } from 'antd';
import WeatherDisplay from './WeatherDisplay';
import axios from 'axios';

const { Option } = Select;

const App = () => {
  const [selectedOption, setSelectedOption] = useState('city');
  const [city, setCity] = useState('');
  const [cities, setCities] = useState([]);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [detectedCity, setDetectedCity] = useState('');
  const [resetWeather, setResetWeather] = useState(false);

  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
    setDetectedCity('');
    setCity('');
    setLatitude('');
    setLongitude('');
    setResetWeather(true);
  };

  // Fetch city options from the GeoDB Cities API
  const fetchCities = async (query) => {
    if (query.length < 2) return;  // Only start searching after 2 characters
    try {
      const response = await axios.get(
        `https://wft-geo-db.p.rapidapi.com/v1/geo/cities`, 
        {
          params: { namePrefix: query },
          headers: {
            'X-RapidAPI-Key': '06d4363d14mshddd98adbf84a07cp1c9e96jsn1d6f392c76ee',
            'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com'
          }
        }
      );
      const cityOptions = response.data.data.map(city => ({
        value: city.city,
        label: `${city.city}, ${city.countryCode}`
      }));
      setCities(cityOptions);
    } catch (error) {
      console.error("Error fetching cities", error);
    }
  };

  // Handle city selection from the dropdown
  const handleCityChange = (value) => {
    setCity(value);
    setDetectedCity(value); 
    setResetWeather(false); 
  };
  

  // Handle reverse geocoding to find the city by coordinates
  const handleReverseGeocode = async () => {
    if (latitude && longitude) {
      try {
        const response = await axios.get(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );
        console.log('Reverse Geocode Response:', response.data);  // Add this log
        setDetectedCity(response.data.city);
        setResetWeather(false);
      } catch (error) {
        console.error("Error fetching city from coordinates", error);
      }
    }
  };

  // Handle geolocation for the current location
  const handleGeolocation = () => {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      setLatitude(lat);
      setLongitude(lon);
      try {
        const response = await axios.get(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
        );
        console.log('Geolocation Response:', response.data);  // Add this log
        setDetectedCity(response.data.city);
        setResetWeather(false);
      } catch (error) {
        console.error("Error fetching city from geolocation", error);
      }
    });
  };

  return (
    <div className="center-container">
    <div className="location-heading">
      <h2>Select Location Type</h2>
    </div>
    <div className="radio-group-container">
      <Radio.Group onChange={handleOptionChange} value={selectedOption}>
        <Radio value="city">City</Radio>
        <Radio value="coordinates">Coordinates</Radio>
        <Radio value="currentLocation">Current Location</Radio>
      </Radio.Group>
    </div>
  
    <div style={{ marginTop: 20,marginLeft: '280px' }}>
      {selectedOption === 'city' && (
        <Select
          showSearch
          style={{ width: 300 }}
          placeholder="Select a city"
          onSearch={fetchCities}
          onChange={handleCityChange}
          filterOption={false}  // Use server-side filtering, disable client-side filtering
        >
          {cities.map((city) => (
            <Option key={city.value} value={city.value}>
              {city.label}
            </Option>
          ))}
        </Select>
      )}
  
      {selectedOption === 'coordinates' && (
        <div>
          <Input
            placeholder="Latitude"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            style={{ width: 200, marginBottom: 8 }}
          />
          <Input
            placeholder="Longitude"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            style={{ width: 200, marginBottom: 8 }}
          />
          <Button type="primary" onClick={handleReverseGeocode}>
            Find City
          </Button>
        </div>
      )}
  
      {selectedOption === 'currentLocation' && (
        <Button type="primary" onClick={handleGeolocation}>
          Detect My Location
        </Button>
      )}
  
      {detectedCity && <p>Detected City: {detectedCity}</p>}
      <WeatherDisplay detectedCity={detectedCity} resetWeather={resetWeather} />
    </div>
  </div>
  
  );
};

export default App;

