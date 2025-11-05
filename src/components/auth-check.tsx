"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Shield } from "lucide-react"
import { Loader2 } from "lucide-react"

export function AuthCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      // Don't check auth on login page
      if (pathname === '/login') {
        setIsChecking(false)
        return
      }

      try {
        // Check authentication via API (validates HTTP-only cookie)
        const response = await fetch('/api/auth/check', {
          method: 'GET',
          credentials: 'include', // Include cookies in request
        })

        const data = await response.json()

        if (!data.authenticated) {
          router.push('/login')
        } else {
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/login')
      } finally {
        setIsChecking(false)
      }
    }

    checkAuth()
  }, [pathname, router])

  // Show loading spinner while checking authentication
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-400 mx-auto mb-4" />
          <p className="text-neutral-400">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  // Show login page without authentication check
  if (pathname === '/login') {
    return <>{children}</>
  }

  // Show content only if authenticated
  if (isAuthenticated) {
    return <>{children}</>
  }

  // Return null while redirecting to login
  return null
}
