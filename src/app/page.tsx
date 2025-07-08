'use client'

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import Image from 'next/image'
import Container from '../components/Container';
import Navbar from '../components/Navbar'
import WeatherIcon from '../components/WeatherIcon';
import { convertKelvinToCelsius } from '../utils/convertKelvinToCelsius';
import { getDayOrNightIcon } from '../utils/getDayOrNightIcon';

//https://api.openweathermap.org/data/2.5/forecast?q=lutsk&appid=2954bcd85f2835ff7f8abed6a2815413


export default function Home() {

  const { isPending, error, data } = useQuery({
    queryKey: ['weatherData'],
    queryFn: async() => {

      const {data} = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=lutsk&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}`);

      return data;

    }
      // fetch('https://api.openweathermap.org/data/2.5/forecast?q=lutsk&appid=2954bcd85f2835ff7f8abed6a2815413').then((res) =>
      //   res.json(),
      // ),
  })

  const firstData = data?.list[0]

  console.log("data", data)

  if (isPending) return <div className='flex items-center min-h-screen justify-center'>
    <p className='animate-bounce'>Loading...</p>
  </div>


  return (
   <div className='flex flex-col gap-4 bg-gray-100 min-h-screen'>
    <Navbar />
    <main className='px-3 max-w-7xl mx-auto flex flex-col gap-9 w-full pb-10 pt-4'>
      {/* todday data */}
      <section className='space-y-4'>
        <div className='space-y-2'>
          <h2 className='flex gap-1 text-2xl items-end'>
            <p> {format(parseISO(firstData?.dt_txt ??""), "EEEE")} </p>
            <p className='text-lg'> ({format(parseISO(firstData?.dt_txt ??""), "dd.MM.yyyy")}) </p>
          </h2>
          <Container className='gap-10 px-6 items-center '>
            {/* temperature */}
            <div className='flex flex-col px-4'>
              <span className='text-5xl'>
                {convertKelvinToCelsius(firstData?.main.temp ?? 288.85)}°
              </span>
              <p className='text-xs space-x-1 whitespace-nowrap'>Feels like{" "}
                {convertKelvinToCelsius(firstData?.main.feels_like ?? 0)}°
              </p>
              <p className='text-xs space-x-2'>
                <span>{convertKelvinToCelsius(firstData?.main.temp_min ?? 0)}°↓{" "}</span>
                <span>{" "}{convertKelvinToCelsius(firstData?.main.temp_max ?? 0)}°↑</span>
              </p>
            </div>
            {/* time and weather icon */}
            <div className='flex gap-10 sm:gap-16 overflow-x-auto w-full justify-between pr-3'>
              {data?.list.map((d,i) => 
                <div 
                  key={i}
                  className="flex flex-col justify-between gap-2 items-center text-xs font-samibold"
                  >
                    <p className='whitespace-nowrap'>

                      {format(parseISO(d.dt_txt), "h:mm a")}
                    </p>
                      
                      <WeatherIcon iconName={getDayOrNightIcon(d.weather[0].icon, d.dt_txt)}/>
                    <p>{convertKelvinToCelsius(d?.main.temp ?? 0)}°</p>
                  </div>
              )}
            </div>
          </Container>
        </div>
      </section>
      {/* 7 days data */}
      <section className='flex flex-col gap-4 w-full'>
        <p className='text-2xl '>Forecast (7 days)</p>
      </section>
    </main>
   </div> 
  )
}
