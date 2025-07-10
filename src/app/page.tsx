'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { format, parseISO, fromUnixTime } from 'date-fns';
import { useAtom } from 'jotai';
import { useEffect } from 'react';

import Container from '../components/Container';
import ForecastWeatherDetail from '../components/ForecastWeatherDetail';
import Navbar from '../components/Navbar';
import WeatherDetails from '../components/WeatherDetails';
import WeatherIcon from '../components/WeatherIcon';

import { convertKelvinToCelsius } from '../utils/convertKelvinToCelsius';
import { convertWindSpeed } from '../utils/convertWindSpeed';
import { getDayOrNightIcon } from '../utils/getDayOrNightIcon';
import { metersToKilometers } from '../utils/metersToKilometers';

import { loadingCityAtom, placeAtom } from './atom';

type WeatherData = {
  city: {
    name: string;
    sunrise: number;
    sunset: number;
  };
  list: Array<{
    dt: number;
    dt_txt: string;
    main: {
      temp: number;
      feels_like: number;
      temp_min: number;
      temp_max: number;
      pressure: number;
      humidity: number;
    };
    weather: Array<{
      description: string;
      icon: string;
    }>;
    wind: {
      speed: number;
    };
    visibility: number;
  }>;
};




export default function Home() {
  const [place, setPlace] = useAtom(placeAtom);
  const [loadingCity, setLoadingCity] = useAtom(loadingCityAtom);

  const { isPending, error, data, refetch } = useQuery<WeatherData>({
    queryKey: ['weatherData', place],
    queryFn: async () => {
      if (!place) throw new Error("No place provided");
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${place}&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}`
      );
      return response.data;
    },
    enabled: !!place,
  });

  useEffect(() => {
    if (place) {
      refetch();
    }
  }, [place, refetch]);

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

  const firstDataForEachDate = uniqueDates
    .map((date) => {
      return data.list.find((entry) => {
        const entryDate = new Date(entry.dt * 1000).toISOString().split('T')[0];
        const entryHour = new Date(entry.dt * 1000).getHours();
        return entryDate === date && entryHour >= 6;
      });
    })
    .filter((item): item is NonNullable<typeof item> => item !== undefined);

  const sunriseTime = format(fromUnixTime(data.city.sunrise ?? 1752113828), 'HH:mm');
  const sunsetTime = format(fromUnixTime(data.city.sunset ?? 1752172226), 'HH:mm');

  return (
    <div className="flex flex-col gap-4 bg-gray-100 min-h-screen">
      <Navbar location={data?.city.name} />
      <main className="px-3 max-w-7xl mx-auto flex flex-col gap-9 w-full pb-10 pt-4">
        {/* Today data */}
        {loadingCity ? (
          <WeatherSkeleton />
        ) : (
          <>
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

              <div className="flex gap-4">
                <Container className="w-fit justify-center flex-col px-4 items-center">
                  <p className="capitalize text-center">{firstData.weather[0].description}</p>
                  <WeatherIcon iconName={getDayOrNightIcon(firstData.weather[0].icon, firstData.dt_txt)} />
                </Container>

                <Container className="bg-yellow-300/80 px-6 gap-4 w-full justify-between overflow-x-auto">
                  <WeatherDetails
                    visibility={metersToKilometers(firstData.visibility ?? 10000)}
                    airPressure={`${firstData.main.pressure} hPa`}
                    humidity={`${firstData.main.humidity}%`}
                    sunrise={sunriseTime}
                    sunset={sunsetTime}
                    windSpeed={convertWindSpeed(firstData.wind.speed)}
                  />
                </Container>
              </div>
            </section>

            {/* Forecast 7 days */}
            <section className="flex flex-col gap-4 w-full">
              <p className="text-2xl">Forecast (7 days)</p>
              {firstDataForEachDate.map((d, i) => (
                <ForecastWeatherDetail
                  key={i}
                  description={d?.weather[0].description ?? ""}
                  weatherIcon={d?.weather[0].icon ?? "01d"}
                  date={format(parseISO(d?.dt_txt ?? ""), 'dd.MM')}
                  day={format(parseISO(d?.dt_txt ?? ""), 'EEEE')}
                  feels_like={d?.main.feels_like ?? 0}
                  temp={d?.main.temp ?? 0}
                  temp_max={d?.main.temp_max ?? 0}
                  temp_min={d?.main.temp_min ?? 0}
                  airPressure={`${d.main.pressure} hPa`}
                  humidity={`${d?.main.humidity}%`}
                  sunrise={sunriseTime}
                  sunset={sunsetTime}
                  visibility={`${metersToKilometers(d.visibility ?? 10000)}`}
                  windSpeed={`${convertWindSpeed(d.wind.speed ?? 1.64)}`}
                />
              ))}
            </section>
          </>
        )}
      </main>
      <footer className="text-center text-sm text-gray-500 border-t border-gray-200 py-4 mt-auto w-full">
  <p className="px-3">
    by{' '}
    <a
      href="https://hilitukha-dev.netlify.app"
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-500 font-medium hover:underline"
    >
      Hilitukha Maksym (Gil)
    </a>
  </p>
</footer>


    </div>
  );
}

function WeatherSkeleton() {
  return (
    <section className="space-y-8">
      <div className="space-y-2 animate-pulse">
        <div className="flex gap-1 text-2xl items-end">
          <div className="h-6 w-24 bg-gray-300 rounded"></div>
          <div className="h-6 w-24 bg-gray-300 rounded"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((index) => (
            <div key={index} className="flex flex-col items-center space-y-2">
              <div className="h-6 w-16 bg-gray-300 rounded"></div>
              <div className="h-6 w-6 bg-gray-300 rounded-full"></div>
              <div className="h-6 w-16 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 animate-pulse">
        <p className="text-2xl h-8 w-36 bg-gray-300 rounded"></p>
        {[1, 2, 3, 4, 5, 6, 7].map((index) => (
          <div key={index} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="h-8 w-28 bg-gray-300 rounded"></div>
            <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
            <div className="h-8 w-28 bg-gray-300 rounded"></div>
            <div className="h-8 w-28 bg-gray-300 rounded"></div>
          </div>
        ))}
      </div>
    </section>
  );
}
