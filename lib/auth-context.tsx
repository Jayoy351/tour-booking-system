"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

export interface User {
  id: string
  fullName: string
  email: string
  phone: string
  location: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  register: (userData: Omit<User, "id"> & { password: string }) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Demo users for testing
const DEMO_USERS: (User & { password: string })[] = [
  {
    id: "demo-1",
    fullName: "John Dela Cruz",
    email: "john.delacruz@email.com",
    phone: "+63 912 345 6789",
    location: "Cebu City, Philippines",
    password: "demo123",
  },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check localStorage for existing session
    const storedUser = localStorage.getItem("tour_booking_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Check demo users
    const foundUser = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    )

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword)
      localStorage.setItem("tour_booking_user", JSON.stringify(userWithoutPassword))
      return { success: true }
    }

    // Check registered users in localStorage
    const registeredUsers = JSON.parse(localStorage.getItem("tour_booking_registered_users") || "[]")
    const registeredUser = registeredUsers.find(
      (u: User & { password: string }) =>
        u.email.toLowerCase() === email.toLowerCase() && u.password === password
    )

    if (registeredUser) {
      const { password: _, ...userWithoutPassword } = registeredUser
      setUser(userWithoutPassword)
      localStorage.setItem("tour_booking_user", JSON.stringify(userWithoutPassword))
      return { success: true }
    }

    return { success: false, error: "Invalid email or password" }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("tour_booking_user")
  }

  const register = async (
    userData: Omit<User, "id"> & { password: string }
  ): Promise<{ success: boolean; error?: string }> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Check if email already exists
    const registeredUsers = JSON.parse(localStorage.getItem("tour_booking_registered_users") || "[]")
    const existingUser = registeredUsers.find(
      (u: User) => u.email.toLowerCase() === userData.email.toLowerCase()
    )

    if (existingUser || DEMO_USERS.some((u) => u.email.toLowerCase() === userData.email.toLowerCase())) {
      return { success: false, error: "Email already registered" }
    }

    const newUser: User & { password: string } = {
      ...userData,
      id: `user-${Date.now()}`,
    }

    registeredUsers.push(newUser)
    localStorage.setItem("tour_booking_registered_users", JSON.stringify(registeredUsers))

    // Auto-login after registration
    const { password: _, ...userWithoutPassword } = newUser
    setUser(userWithoutPassword)
    localStorage.setItem("tour_booking_user", JSON.stringify(userWithoutPassword))

    return { success: true }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
