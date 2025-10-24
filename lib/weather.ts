// lib/weather.ts
import { fetchWeatherApi } from 'openmeteo';

export async function getWeatherData() {
  const params = {
    "latitude": 42.4076,
    "longitude": 18.71949,
    "current": ["temperature_2m", "weather_code", "precipitation", "wind_speed_10m", "relative_humidity_2m", "apparent_temperature"],
    "hourly": ["temperature_2m", "weather_code", "precipitation_probability", "wind_speed_10m"],
    "timezone": "Europe/Berlin",
    "forecast_days": 1
  };

  const url = "https://api.open-meteo.com/v1/forecast";
  
  try {
    const responses = await fetchWeatherApi(url, params);
    const response = responses[0];

    const utcOffsetSeconds = response.utcOffsetSeconds();
    const current = response.current()!;
    const hourly = response.hourly()!;

    const weatherData = {
      current: {
        time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
        temperature_2m: current.variables(0)!.value(),
        weather_code: current.variables(1)!.value(),
        precipitation: current.variables(2)!.value(),
        wind_speed_10m: current.variables(3)!.value(),
        relative_humidity_2m: current.variables(4)!.value(),
        apparent_temperature: current.variables(5)!.value(),
      },
      hourly: {
        time: [...Array(24)].map((_, i) => 
          new Date((Number(hourly.time()) + i * hourly.interval() + utcOffsetSeconds) * 1000)
        ),
        temperature_2m: hourly.variables(0)!.valuesArray()!,
        weather_code: hourly.variables(1)!.valuesArray()!,
        precipitation_probability: hourly.variables(2)!.valuesArray()!,
        wind_speed_10m: hourly.variables(3)!.valuesArray()!,
      }
    };

    return weatherData;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return null;
  }
}

// Funkcija za konvertovanje weather code u opis i ikonu
export function getWeatherInfo(weatherCode: number) {
  const weatherCodes: { [key: number]: { description: string; icon: string; severity: string } } = {
    0: { description: "Vedro", icon: "sun", severity: "clear" },
    1: { description: "Uglavnom vedro", icon: "sun", severity: "clear" },
    2: { description: "Djelimično oblačno", icon: "cloud-sun", severity: "partly-cloudy" },
    3: { description: "Oblačno", icon: "cloud", severity: "cloudy" },
    45: { description: "Magla", icon: "cloud-fog", severity: "fog" },
    48: { description: "Magla", icon: "cloud-fog", severity: "fog" },
    51: { description: "Slaba kiša", icon: "cloud-drizzle", severity: "light-rain" },
    53: { description: "Umjerena kiša", icon: "cloud-rain", severity: "rain" },
    55: { description: "Jaka kiša", icon: "cloud-rain", severity: "heavy-rain" },
    61: { description: "Slaba kiša", icon: "cloud-drizzle", severity: "light-rain" },
    63: { description: "Umjerena kiša", icon: "cloud-rain", severity: "rain" },
    65: { description: "Jaka kiša", icon: "cloud-rain", severity: "heavy-rain" },
    80: { description: "Pljuskovi kiše", icon: "cloud-rain", severity: "showers" },
    81: { description: "Umjereni pljuskovi", icon: "cloud-rain", severity: "showers" },
    82: { description: "Jaki pljuskovi", icon: "cloud-rain", severity: "heavy-showers" },
    95: { description: "Grmljavina", icon: "cloud-lightning", severity: "thunderstorm" },
    96: { description: "Grmljavina sa gradom", icon: "cloud-lightning", severity: "thunderstorm" },
    99: { description: "Jaka grmljavina", icon: "cloud-lightning", severity: "thunderstorm" },
  };

  return weatherCodes[weatherCode] || { description: "Nepoznato", icon: "help-circle", severity: "unknown" };
}

// lib/weather.ts - ažurirana getExtendedForecast funkcija
export async function getExtendedForecast() {
  const params = {
    "latitude": 42.4076,
    "longitude": 18.71949,
    "daily": [
      "weather_code",
      "temperature_2m_max", 
      "temperature_2m_min",
      "precipitation_sum",
      "precipitation_probability_max",
      "wind_speed_10m_max",
      "sunrise",
      "sunset",
      "uv_index_max"
    ],
    "timezone": "Europe/Berlin",
    "forecast_days": 7
  };

  const url = "https://api.open-meteo.com/v1/forecast";
  
  try {
    const responses = await fetchWeatherApi(url, params);
    const response = responses[0];

    const utcOffsetSeconds = response.utcOffsetSeconds();
    const daily = response.daily()!;

    const forecastData = {
      daily: {
        time: [...Array(7)].map((_, i) => 
          new Date((Number(daily.time()) + i * 24 * 3600 + utcOffsetSeconds) * 1000)
        ),
        weather_code: daily.variables(0)!.valuesArray()!,
        temperature_2m_max: daily.variables(1)!.valuesArray()!,
        temperature_2m_min: daily.variables(2)!.valuesArray()!,
        precipitation_sum: daily.variables(3)!.valuesArray()!,
        precipitation_probability_max: daily.variables(4)!.valuesArray()!,
        wind_speed_10m_max: daily.variables(5)!.valuesArray()!,
        sunrise: daily.variables(6)!.valuesArray()!,
        sunset: daily.variables(7)!.valuesArray()!,
        uv_index_max: daily.variables(8)!.valuesArray()!,
      }
    };

    console.log("Forecast data received:", {
      time: forecastData.daily.time.length,
      sunrise: forecastData.daily.sunrise?.length,
      sunset: forecastData.daily.sunset?.length
    });

    return forecastData;
  } catch (error) {
    console.error("Error fetching extended forecast:", error);
    return null;
  }
}