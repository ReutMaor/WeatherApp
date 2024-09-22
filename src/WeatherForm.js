import React, { useState } from 'react';


const WeatherForm = ({ onSubmit }) => {
  const [inputType, setInputType] = useState('city');
  const [city, setCity] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');


  const handleInputChange = (e) => {
    setInputType(e.target.value);
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputType === 'city') {
      onSubmit({ city });
    } else if (inputType === 'coordinates') {
      onSubmit({ latitude, longitude });
    }
  };


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
      <div>
        <label>
          <input
            type="radio"
            value="city"
            checked={inputType === 'city'}
            onChange={handleInputChange}
          />
          City Name
        </label>
        <label>
          <input
            type="radio"
            value="coordinates"
            checked={inputType === 'coordinates'}
            onChange={handleInputChange}
          />
          Coordinates
        </label>
        <label>
          <input
            type="radio"
            value="geolocation"
            checked={inputType === 'geolocation'}
            onChange={handleInputChange}
          />
          Use Current Location
        </label>
      </div>


      {inputType === 'city' && (
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city name"
        />
      )}


      {inputType === 'coordinates' && (
        <div>
          <input
            type="text"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            placeholder="Latitude"
          />
          <input
            type="text"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            placeholder="Longitude"
          />
        </div>
      )}


      {inputType === 'geolocation' && (
        <button type="button" onClick={handleGeolocation}>
          Use My Location
        </button>
      )}


      {inputType !== 'geolocation' && <button type="submit">Submit</button>}
    </form>
  );
};


export default WeatherForm;
