import axios from 'axios';

const initialState = {
  data: null,
  loading: false,
  error: null,
};

const FETCH_WEATHER_REQUEST = 'FETCH_WEATHER_REQUEST';
const FETCH_WEATHER_SUCCESS = 'FETCH_WEATHER_SUCCESS';
const FETCH_WEATHER_FAILURE = 'FETCH_WEATHER_FAILURE';

export const fetchWeather = (location) => async (dispatch) => {
  dispatch({ type: FETCH_WEATHER_REQUEST });

  try {
    let url = '';
    if (location.city) {
      url = `https://api.openweathermap.org/data/2.5/weather?q=${location.city}&appid=YOUR_API_KEY`;
    } else if (location.latitude && location.longitude) {
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${location.latitude}&lon=${location.longitude}&appid=YOUR_API_KEY`;
    }

    const response = await axios.get(url);
    dispatch({ type: FETCH_WEATHER_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({ type: FETCH_WEATHER_FAILURE, error: error.message });
  }
};

export const weatherReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_WEATHER_REQUEST:
      return { ...state, loading: true };
    case FETCH_WEATHER_SUCCESS:
      return { ...state, loading: false, data: action.payload };
    case FETCH_WEATHER_FAILURE:
      return { ...state, loading: false, error: action.error };
    default:
      return state;
  }
};
