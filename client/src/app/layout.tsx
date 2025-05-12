import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import QueryProvider from '@/context/query-provider'
import { ThemeProvider } from '@/context/theme-provider'
import NextTopLoader from 'nextjs-toploader';

const geistSans = Poppins({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
})

export const metadata: Metadata = {
  title: 'B&M Todo App',
  description: 'A complex todo app built with Next.js',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} antialiased`}>
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <NextTopLoader showSpinner={false}/>
            {children}
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  )
}