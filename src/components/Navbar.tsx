/** @format */
'use client'

import React, { useState } from 'react'
import { MdMyLocation, MdSunny, MdLocationOn } from "react-icons/md"
import SearchBox from './SearchBox'
import axios from 'axios'
import { loadingCityAtom, placeAtom } from '../app/atom'
import { useAtom } from 'jotai'

type Props = { location?: string }

const API_KEY = process.env.NEXT_PUBLIC_WEATHER_KEY

export default function Navbar({ location }: Props) {
  const [city, setCity] = useState("")
  const [error, setError] = useState("")



  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [place, setPlace] = useAtom(placeAtom)
  const [loadingCity, setLoadingCity] = useAtom(loadingCityAtom)


  async function handleInputChang(value: string) {
    setCity(value)
    if (value.length >= 3) {
      try {
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/find?q=${value}&appid=${API_KEY}`
        )

        // 🟡 Отримаємо назви міст разом з країною (щоб уникнути плутанини)
        const suggestions = response.data.list.map((item: any) => `${item.name},${item.sys?.country ?? '??'}`)

        setSuggestions(suggestions)
        setError('')
        setShowSuggestions(true)
      } catch (error) {
        setSuggestions([])
        setShowSuggestions(false)
        setError('City not found')
      }
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  function handleSuggestionClick(value: string) {
    // 🟢 Коли користувач натискає на підказку — одразу встановлюємо це місто в placeAtom
    setCity(value)
    setPlace(value) // ✅ оновлюємо глобальний atom
    setShowSuggestions(false)
    setError('')
  }

  function handleSubmitSearch(e: React.FormEvent<HTMLFormElement>) {
    setLoadingCity(true)
    e.preventDefault()
    if (suggestions.length === 0) {
      setError("Location not found :(")
      setLoadingCity(false)
    } else {
      setError('')
      setTimeout(() => {
        setLoadingCity(false)
        setPlace(city) // Якщо користувач натискає Enter — також оновлюєм placeAtom
        setShowSuggestions(false)
      }, 500);
    }
  }

  function handleCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          setLoadingCity(true);
          const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`
          );
          setTimeout(() => {
            setLoadingCity(false);
            setPlace(response.data.name);
          }, 500);
        } catch (error) {
          setLoadingCity(false)
        }
      });
    }
  }

  return (

    <>
      <nav className='shawom-sm sticky top-0 left-0 z-50 bg-white'>
        <div className='h-[80px] w-full flex justify-between items-center max-w-7xl px-3 mx-auto'>
          <div className='flex flex-col'>
            <div className='flex items-center gap-2'>
              <h2 className='text-gray-500 text-3xl'>Weather</h2>
              <MdSunny className='text-3xl mt-1 text-yellow-300' />
            </div>
            <p className='text-xs text-gray-500'>
              by{' '}
              <a
                href="https://hilitukha-dev.netlify.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                dev Gil
              </a>
            </p>
          </div>


          <section className='flex gap-2 items-center'>
            <MdMyLocation
              title='Your current location :)'
              onClick={handleCurrentLocation}
              className='text-3xl text-gray-400 hover:opacity-80 cursor-pointer' />
            <MdLocationOn className='text-3xl' />
            <p className='text-slate-900/80 text-sm'>{location}</p> {/* 🟢 Відображає поточне місце */}
            <div className='relative hidden md:flex'>
              <SearchBox
                value={city}
                onSubmit={handleSubmitSearch}
                onChange={(e) => handleInputChang(e.target.value)}
              />
              <SuggestionBox
                {...{
                  showSuggestions,
                  suggestions,
                  handleSuggestionClick,
                  error
                }}
              />
            </div>
          </section>
        </div>
      </nav>
      <section className='flex  max-w-7xl px-3 md:hidden '>
        <div className='relative'>
          <SearchBox
            value={city}
            onSubmit={handleSubmitSearch}
            onChange={(e) => handleInputChang(e.target.value)}
          />
          <SuggestionBox
            {...{
              showSuggestions,
              suggestions,
              handleSuggestionClick,
              error
            }}
          />
        </div>
      </section>
    </>
  );
}

function SuggestionBox({
  showSuggestions,
  suggestions,
  handleSuggestionClick,
  error
}: {
  showSuggestions: boolean;
  suggestions: string[];
  handleSuggestionClick: (item: string) => void;
  error: string;
}) {
  return (
    <>
      {((showSuggestions && suggestions.length > 0) || error) && (
        <ul className='mb-4 bg-white absolute border top-[44px] left-0 border-gray-300 rounded-md min-w-[200px] flex flex-col gap-1 py-2 px-2 z-50'>
          {error && suggestions.length < 1 && (
            <li className='text-red-500 p-1'>{error}</li>
          )}
          {suggestions.map((item, i) => (
            <li
              key={i}
              onClick={() => handleSuggestionClick(item)} // ✅ Автоматично оновлює placeAtom
              className='cursor-pointer p-1 rounded hover:bg-gray-200'
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
