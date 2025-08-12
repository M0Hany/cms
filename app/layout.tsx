import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DKT CMS Builder',
  description: 'Decathlon CMS Builder - Create and manage web page components',
  generator: 'DKT CMS Builder',
  icons: {
    icon: '/logo.jpg',
    shortcut: '/logo.jpg',
    apple: '/logo.jpg',
  },
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.jpg" type="image/jpeg" />
        <link rel="shortcut icon" href="/logo.jpg" type="image/jpeg" />
      </head>
      <body>{children}</body>
    </html>
  )
}
