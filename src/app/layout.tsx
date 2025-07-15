import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { ThemeInitializer } from '@/components/ThemeInitializer'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'CluX - AI-Powered Video Management',
  description: 'Transform your video library with AI-powered transcription, semantic search, and auto-generated highlights. Find any moment in your video library instantly.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans font-light`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
          storageKey="clux-theme"
        >
          <ThemeInitializer />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
