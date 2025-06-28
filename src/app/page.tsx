import Image from 'next/image'
import Navbar from '../components/Navbar'

//https://api.openweathermap.org/data/2.5/forecast?q=lutsk&appid=2954bcd85f2835ff7f8abed6a2815413

export default function Home() {
  return (
   <div className='flex flex-col gap-4 bg-gray-100 min-h-screen'>
    <Navbar />
   </div>
  )
}
