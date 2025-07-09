import React from 'react';
import Container from './Container';
import WeatherIcon from './WeatherIcon';
import WeatherDetails, { WeatherDetailProps } from './WeatherDetails';
import { convertKelvinToCelsius } from '../utils/convertKelvinToCelsius';

export interface ForecastWeatherDetailProps extends WeatherDetailProps {
  weatherIcon: string;
  date: string;
  day: string;
  temp?: number;
  feels_like?: number;
  temp_min?: number;
  temp_max?: number;
  description: string;
}

export default function ForecastWeatherDetail(props: ForecastWeatherDetailProps) {
  const {
    weatherIcon = "02d",
    date = "19.09",
    day = "Tuesday",
    temp,
    feels_like,
    description
  } = props;

  const tempC = convertKelvinToCelsius(temp);
  const feelsLikeC = convertKelvinToCelsius(feels_like);

  return (
    <Container className='gap-4'>
      {/* left section */}
      <section className='flex gap-4 items-center px-4'>
        <div>
          <WeatherIcon iconName={weatherIcon} />
          <p>{date}</p>
          <p className='text-sm'>{day}</p>
        </div>

        <div className='flex flex-col px-4'>
          <span className='text-5xl'>{tempC}°</span>
          <p className='text-xs space-x-1 whitespace-nowrap'>
            <span>Feels like</span>
            <span>{feelsLikeC}°</span>
          </p>
          <p className='capitalize'>{description || "N/A"}</p>
        </div>
      </section>

      {/* right section */}
      <section className='overflow-x-auto flex justify-between gap-4 px-4 w-full pr-10'>
        <WeatherDetails {...props} />
      </section>
    </Container>
  );
}
