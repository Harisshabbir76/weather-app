const BASE_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:5000'
  : '';

export const getWeather = async (city) => {
  try {
    const res = await fetch(`${BASE_URL}/api/weather?city=${encodeURIComponent(city)}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    
    const convertTemp = (temp) => {
      if (typeof temp !== 'number') {
        console.warn('Invalid temperature value:', temp);
        return 0;
      }
      if (temp > -100 && temp < 100) return Math.round(temp);
      return Math.round(temp - 273.15);
    };

    return {
      ...data,
      main: {
        ...data.main,
        temp: convertTemp(data.main.temp),
        temp_max: convertTemp(data.main.temp_max),
        temp_min: convertTemp(data.main.temp_min)
      }
    };
  } catch (e) {
    console.error(`Error fetching weather for city "${city}"`, e);
    return null;
  }
};

export const getWeatherByCoords = async (lat, lon) => {
  try {
    const res = await fetch(`${BASE_URL}/api/weather/coords?lat=${lat}&lon=${lon}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    
    const convertTemp = (temp) => {
      if (typeof temp !== 'number') {
        console.warn('Invalid temperature value:', temp);
        return 0;
      }
      if (temp > -100 && temp < 100) return Math.round(temp);
      return Math.round(temp - 273.15);
    };

    return {
      ...data,
      main: {
        ...data.main,
        temp: convertTemp(data.main.temp),
        temp_max: convertTemp(data.main.temp_max),
        temp_min: convertTemp(data.main.temp_min)
      }
    };
  } catch (e) {
    console.error('Error fetching weather by coordinates', e);
    return null;
  }
};

export const getWeeklyForecast = async (lat, lon) => {
  try {
    const res = await fetch(`${BASE_URL}/api/forecast?lat=${lat}&lon=${lon}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    
    // Transform data to consistent format
    if (data.daily) { // onecall format
      return {
        daily: data.daily.slice(0, 7).map(day => ({
          dt: day.dt,
          temp: {
            day: day.temp.day,
            min: day.temp.min,
            max: day.temp.max
          },
          weather: day.weather
        }))
      };
    }
    
    if (data.list) { // forecast format (5 day / 3 hour)
      // Group by day and get daily min/max
      const dailyData = {};
      data.list.forEach(item => {
        const date = new Date(item.dt * 1000).toLocaleDateString();
        if (!dailyData[date]) {
          dailyData[date] = {
            dt: item.dt,
            temp: {
              day: item.main.temp,
              min: item.main.temp_min,
              max: item.main.temp_max
            },
            weather: item.weather
          };
        } else {
          dailyData[date].temp.min = Math.min(dailyData[date].temp.min, item.main.temp_min);
          dailyData[date].temp.max = Math.max(dailyData[date].temp.max, item.main.temp_max);
        }
      });
      
      return {
        daily: Object.values(dailyData).slice(0, 7)
      };
    }
    
    return { daily: [] };
  } catch (e) {
    console.error('Error fetching weekly forecast:', e);
    return { daily: [] };
  }
};