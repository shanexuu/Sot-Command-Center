import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { ThemeProvider } from '@/lib/theme-provider'
import { SidebarProvider } from '@/lib/sidebar-context'
import { AuthProvider } from '@/lib/auth-context'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { ToasterProvider } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SoT Command Center',
  description:
    'Summer of Tech Command Center - AI-powered student and employer management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body
        className={inter.className}
        suppressHydrationWarning
      >
        <ThemeProvider
          defaultTheme="system"
          storageKey="sot-theme"
        >
          <ToasterProvider>
            <AuthProvider>
              <ProtectedRoute>
                <SidebarProvider>
                  <div className="flex h-screen bg-background overflow-hidden">
                    <Sidebar />
                    <div className="flex flex-1 flex-col overflow-hidden lg:ml-64">
                      <Header />
                      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-2 lg:px-6 lg:pt-6 lg:pb-3 bg-background">
                        {children}
                      </main>
                    </div>
                  </div>
                </SidebarProvider>
              </ProtectedRoute>
            </AuthProvider>
          </ToasterProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
