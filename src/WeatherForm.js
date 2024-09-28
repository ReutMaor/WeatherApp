import React, { useState } from 'react';
import { Radio } from 'antd';

const WeatherForm = ({ onSubmit }) => {
  const [inputType, setInputType] = useState('city'); // Manage radio selection
  const [city, setCity] = useState('');               // Manage city name input
  const [latitude, setLatitude] = useState('');       // Manage latitude input
  const [longitude, setLongitude] = useState('');     // Manage longitude input

  // Handle radio button selection change
  const handleInputChange = (e) => {
    setInputType(e.target.value);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputType === 'city') {
      onSubmit({ city });
    } else if (inputType === 'coordinates') {
      onSubmit({ latitude, longitude });
    }
  };

  // Handle browser geolocation
  const handleGeolocation = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      onSubmit({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Radio.Group onChange={handleInputChange} value={inputType}>
        <Space direction="vertical">
          {/* Option 1: City Name */}
          <Radio value="city">City Name</Radio>
          {inputType === 'city' && (
            <Input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter city name"
            />
          )}

          {/* Option 2: Coordinates */}
          <Radio value="coordinates">Coordinates</Radio>
          {inputType === 'coordinates' && (
            <div>
              <Input
                type="text"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="Latitude"
                style={{ marginBottom: 10 }}
              />
              <Input
                type="text"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="Longitude"
              />
            </div>
          )}

          {/* Option 3: Use Current Location */}
          <Radio value="geolocation">Use Current Location</Radio>
          {inputType === 'geolocation' && (
            <Button type="button" onClick={handleGeolocation}>
              Use My Location
            </Button>
          )}
        </Space>
      </Radio.Group>

      {/* Submit Button */}
      {inputType !== 'geolocation' && (
        <Button type="submit" style={{ marginTop: 10 }}>
          Submit
        </Button>
      )}
    </form>
  );
};

export default WeatherForm;
