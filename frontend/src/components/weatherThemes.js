import { FaSnowflake, FaSun, FaFire } from 'react-icons/fa';

export const getWeatherTheme = (temp) => {
  if (temp < 15) return 'cold-theme';
  if (temp > 30) return 'hot-theme';
  return 'moderate-theme';
};

export const WeatherIcon = ({ temp }) => {
  if (temp < 15) return <FaSnowflake className="weather-icon" size={24} />;
  if (temp > 30) return <FaFire className="weather-icon" size={24} />;
  return <FaSun className="weather-icon" size={24} />;
};

export const weatherThemesCSS = `
  .cold-theme {
    background: linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 50%, #80deea 100%);
    border: 1px solid #b2ebf2;
    box-shadow: 0 4px 15px rgba(178, 235, 242, 0.3);
    position: relative;
    overflow: hidden;
    color: #01579b;
  }
  .cold-theme::before {
    content: "";
    position: absolute;
    top: -10px;
    right: -10px;
    width: 50px;
    height: 50px;
    background-image: url('https://www.freepnglogos.com/uploads/snow-png/snow-snowflakes-transparent-png-stickpng-17.png');
    background-size: contain;
    background-repeat: no-repeat;
    opacity: 0.3;
  }
  .cold-theme .weather-icon {
    color: #00bcd4;
  }

  .moderate-theme {
    background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%);
    border: 1px solid #bbdefb;
    box-shadow: 0 4px 15px rgba(187, 222, 251, 0.3);
    position: relative;
    overflow: hidden;
    color: #0d47a1;
  }
  .moderate-theme::before {
    content: "";
    position: absolute;
    top: -10px;
    right: -10px;
    width: 50px;
    height: 50px;
    background-image: url('https://www.freepnglogos.com/uploads/sun-png/sun-png-transparent-sun-images-pluspng-0.png');
    background-size: contain;
    background-repeat: no-repeat;
    opacity: 0.2;
  }
  .moderate-theme .weather-icon {
    color: #2196f3;
  }

  .hot-theme {
    background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 50%, #ef9a9a 100%);
    border: 1px solid #ffcdd2;
    box-shadow: 0 4px 15px rgba(255, 205, 210, 0.3);
    position: relative;
    overflow: hidden;
    color: #b71c1c;
  }
  .hot-theme::before {
    content: "";
    position: absolute;
    top: -10px;
    right: -10px;
    width: 50px;
    height: 50px;
    background-image: url('https://www.freepnglogos.com/uploads/flame-png/flame-fire-png-transparent-images-png-only-27.png');
    background-size: contain;
    background-repeat: no-repeat;
    opacity: 0.3;
  }
  .hot-theme .weather-icon {
    color: #f44336;
  }

  .weather-card {
    min-height: 150px;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
    transition: all 0.3s ease;
  }
  .weather-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  }
  .weather-card h2,
  .weather-card h3 {
    color: inherit;
    font-weight: 600;
  }
  .weather-card p {
    color: inherit;
    opacity: 0.9;
  }
  .gradient-text {
    background: linear-gradient(to right, #4fc3f7, #64ffda);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 600;
  }
`;