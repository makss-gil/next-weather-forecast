'use client'

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { format, parseISO, fromUnixTime } from 'date-fns';
import Container from '../components/Container';
import ForecastWeatherDetail from '../components/ForecastWeatherDetail';
import Navbar from '../components/Navbar';
import WeatherDetails from '../components/WeatherDetails';
import WeatherIcon from '../components/WeatherIcon';
import { convertKelvinToCelsius } from '../utils/convertKelvinToCelsius';
import { convertWindSpeed } from '../utils/convertWindSpeed';
import { getDayOrNightIcon } from '../utils/getDayOrNightIcon';
import { metersToKilometers } from '../utils/metersToKilometers';

export default function Home() {
  const { isPending, error, data } = useQuery({
    queryKey: ['weatherData'],
    queryFn: async () => {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=lutsk&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}`
      );
      return response.data;
    },
  });

  if (isPending) {
    return (
      <div className="flex items-center min-h-screen justify-center">
        <p className="animate-bounce">Loading...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center min-h-screen justify-center">
        <p className="text-red-500">Failed to load weather data.</p>
      </div>
    );
  }

  const firstData = data.list[0];

  const uniqueDates = [
    ...new Set(
      data.list.map((entry) =>
        new Date(entry.dt * 1000).toISOString().split('T')[0]
      )
    ),
  ];

  const firstDataForEachDate = uniqueDates.map((date) => {
    return data.list.find((entry) => {
      const entryDate = new Date(entry.dt * 1000).toISOString().split('T')[0];
      const entryHour = new Date(entry.dt * 1000).getHours();
      return entryDate === date && entryHour >= 6;
    });
  }).filter((item): item is NonNullable<typeof item> => item !== undefined); // Фільтруємо undefined значення

  const sunriseTime = format(fromUnixTime(data.city.sunrise), 'HH:mm');
  const sunsetTime = format(fromUnixTime(data.city.sunset), 'HH:mm');

  return (
    <div className="flex flex-col gap-4 bg-gray-100 min-h-screen">
      <Navbar />
      <main className="px-3 max-w-7xl mx-auto flex flex-col gap-9 w-full pb-10 pt-4">
        {/* Today */}
        <section className="space-y-4">
          <div className="space-y-2">
            <h2 className="flex gap-1 text-2xl items-end">
              <p>{format(parseISO(firstData.dt_txt), 'EEEE')}</p>
              <p className="text-lg">
                ({format(parseISO(firstData.dt_txt), 'dd.MM.yyyy')})
              </p>
            </h2>
            <Container className="gap-10 px-6 items-center">
              <div className="flex flex-col px-4">
                <span className="text-5xl">
                  {convertKelvinToCelsius(firstData.main.temp)}°
                </span>
                <p className="text-xs whitespace-nowrap">
                  Feels like {convertKelvinToCelsius(firstData.main.feels_like)}°
                </p>
                <p className="text-xs space-x-2">
                  <span>{convertKelvinToCelsius(firstData.main.temp_min)}°↓</span>
                  <span>{convertKelvinToCelsius(firstData.main.temp_max)}°↑</span>
                </p>
              </div>
              <div className="flex gap-10 sm:gap-16 overflow-x-auto w-full justify-between pr-3">
                {data.list.map((d, i) => (
                  <div
                    key={i}
                    className="flex flex-col justify-between gap-2 items-center text-xs font-semibold"
                  >
                    <p className="whitespace-nowrap">
                      {format(parseISO(d.dt_txt), 'h:mm a')}
                    </p>
                    <WeatherIcon iconName={getDayOrNightIcon(d.weather[0].icon, d.dt_txt)} />
                    <p>{convertKelvinToCelsius(d.main.temp)}°</p>
                  </div>
                ))}
              </div>
            </Container>
          </div>

          {/* Details */}
          <div className="flex gap-4">
            <Container className="w-fit justify-center flex-col px-4 items-center">
              <p className="capitalize text-center">{firstData.weather[0].description}</p>
              <WeatherIcon iconName={getDayOrNightIcon(firstData.weather[0].icon, firstData.dt_txt)} />
            </Container>

            <Container className="bg-yellow-300/80 px-6 gap-4 justify-between">
              <WeatherDetails
                visibility={metersToKilometers(firstData.visibility)}
                airPressure={`${firstData.main.pressure} hPa`}
                humidity={`${firstData.main.humidity}%`}
                sunrise={sunriseTime}
                sunset={sunsetTime}
                windSpeed={convertWindSpeed(firstData.wind.speed)}
              />
            </Container>
          </div>
        </section>

        {/* Forecast */}
        <section className="flex flex-col gap-4 w-full">
          <p className="text-2xl">Forecast (7 days)</p>
          {firstDataForEachDate.map((d, i) => (
            <ForecastWeatherDetail
              key={i}
              description={d.weather[0].description}
              weatherIcon={d.weather[0].icon}
              date={format(parseISO(d.dt_txt), 'dd.MM')}
              day={format(parseISO(d.dt_txt), 'EEEE')}
              feels_like={d.main.feels_like}
              temp={d.main.temp}
              temp_max={d.main.temp_max}
              temp_min={d.main.temp_min}
              airPressure={`${d.main.pressure} hPa`}
              humidity={`${d.main.humidity}%`}
              sunrise={sunriseTime}
              sunset={sunsetTime}
              visibility={metersToKilometers(d.visibility)}
              windSpeed={convertWindSpeed(d.wind.speed)}
            />
          ))}
        </section>
      </main>
    </div>
  );
}