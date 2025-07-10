'use client'

// import type { Metadata } from 'next'
import type { Metadata } from 'next';
import { Inter } from 'next/font/google'
import './globals.css'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'

const inter = Inter({ subsets: ['latin'] })

// export const metadata = {
//   title: "Weather App | by GIL",
//   description: "Weather forecast",
//   icons: {
//     icon: "/favicon.ico",
//     shortcut: "/favicon.ico",
//     apple: "/apple-touch-icon.png",
//   },
// };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

    const queryClient = new QueryClient()

  return (
    <html lang="en">
      <QueryClientProvider client={queryClient}>
        <body className={inter.className}>{children}</body>
      </QueryClientProvider>
    </html>
  )
}

