"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Search,
  LayoutDashboard,
  Fingerprint,
  ShieldAlert,
  User,
  Shield,
  FlaskConical,
  Users,
  FileText,
  Clock,
  ArrowRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface GlobalSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface SearchResult {
  id: string
  title: string
  description: string
  href: string
  icon: React.ElementType
  category: string
}

const allPages: SearchResult[] = [
  {
    id: "1",
    title: "Dashboard",
    description: "View your security overview and quick actions",
    href: "/dashboard",
    icon: LayoutDashboard,
    category: "Pages",
  },
  {
    id: "2",
    title: "Enroll Biometrics",
    description: "Set up fingerprint and facial recognition",
    href: "/biometric/enroll",
    icon: Fingerprint,
    category: "Pages",
  },
  {
    id: "3",
    title: "Verify Biometrics",
    description: "Verify your biometric credentials",
    href: "/biometric/verify",
    icon: Fingerprint,
    category: "Pages",
  },
  {
    id: "4",
    title: "Break-Glass Access",
    description: "Emergency override for critical situations",
    href: "/break-glass",
    icon: ShieldAlert,
    category: "Pages",
  },
  {
    id: "5",
    title: "Profile Settings",
    description: "Manage your account and preferences",
    href: "/profile",
    icon: User,
    category: "Pages",
  },
  {
    id: "6",
    title: "Security Center",
    description: "View security status and compliance",
    href: "/security",
    icon: Shield,
    category: "Pages",
  },
  {
    id: "7",
    title: "Testing Suite",
    description: "Run software tests and validations",
    href: "/test",
    icon: FlaskConical,
    category: "Pages",
  },
  {
    id: "8",
    title: "Admin Panel",
    description: "User management and audit logs",
    href: "/admin",
    icon: Users,
    category: "Administration",
  },
]

const quickActions: SearchResult[] = [
  {
    id: "qa1",
    title: "Enroll Fingerprint",
    description: "Quick action to enroll fingerprint",
    href: "/biometric/enroll?type=fingerprint",
    icon: Fingerprint,
    category: "Quick Actions",
  },
  {
    id: "qa2",
    title: "Enroll Facial Recognition",
    description: "Quick action to enroll face",
    href: "/biometric/enroll?type=facial",
    icon: User,
    category: "Quick Actions",
  },
  {
    id: "qa3",
    title: "Request Emergency Access",
    description: "Initiate break-glass procedure",
    href: "/break-glass",
    icon: ShieldAlert,
    category: "Quick Actions",
  },
  {
    id: "qa4",
    title: "View Audit Logs",
    description: "Check recent security events",
    href: "/admin?tab=logs",
    icon: FileText,
    category: "Quick Actions",
  },
  {
    id: "qa5",
    title: "Run Security Tests",
    description: "Execute security test suite",
    href: "/test",
    icon: FlaskConical,
    category: "Quick Actions",
  },
]

const recentSearches = [
  { id: "r1", title: "Dashboard", href: "/dashboard", icon: Clock },
  { id: "r2", title: "Profile Settings", href: "/profile", icon: Clock },
]

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const router = useRouter()

  // Filter results based on query
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setSelectedIndex(0)
      return
    }

    const searchQuery = query.toLowerCase()
    const filteredPages = allPages.filter(
      (page) => page.title.toLowerCase().includes(searchQuery) || page.description.toLowerCase().includes(searchQuery),
    )
    const filteredActions = quickActions.filter(
      (action) =>
        action.title.toLowerCase().includes(searchQuery) || action.description.toLowerCase().includes(searchQuery),
    )

    setResults([...filteredPages, ...filteredActions])
    setSelectedIndex(0)
  }, [query])

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const items = query
        ? results
        : [
            ...recentSearches.map((r) => ({ ...r, description: "Recent", category: "Recent", icon: Clock })),
            ...quickActions.slice(0, 3),
          ]

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setSelectedIndex((prev) => (prev + 1) % items.length)
          break
        case "ArrowUp":
          e.preventDefault()
          setSelectedIndex((prev) => (prev - 1 + items.length) % items.length)
          break
        case "Enter":
          e.preventDefault()
          if (items[selectedIndex]) {
            router.push(items[selectedIndex].href)
            onOpenChange(false)
            setQuery("")
          }
          break
        case "Escape":
          onOpenChange(false)
          setQuery("")
          break
      }
    },
    [query, results, selectedIndex, router, onOpenChange],
  )

  const handleSelect = (href: string) => {
    router.push(href)
    onOpenChange(false)
    setQuery("")
  }

  // Global keyboard shortcut
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        onOpenChange(!open)
      }
    }

    document.addEventListener("keydown", handleGlobalKeyDown)
    return () => document.removeEventListener("keydown", handleGlobalKeyDown)
  }, [open, onOpenChange])

  const displayItems = query
    ? results
    : [
        ...recentSearches.map(
          (r) => ({ ...r, description: "Recently visited", category: "Recent", icon: Clock }) as SearchResult,
        ),
        ...quickActions.slice(0, 4),
      ]

  // Group items by category
  const groupedItems = displayItems.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push(item)
      return acc
    },
    {} as Record<string, SearchResult[]>,
  )

  let flatIndex = 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-0 gap-0 overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center border-b px-4 py-3">
          <Search className="w-5 h-5 text-muted-foreground mr-3" />
          <Input
            placeholder="Search pages, actions, or settings..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 text-base placeholder:text-muted-foreground"
            autoFocus
          />
          <kbd className="ml-2 text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto py-2">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category}>
              <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {category}
              </div>
              {items.map((item) => {
                const currentIndex = flatIndex++
                const isSelected = currentIndex === selectedIndex
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.href)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                      isSelected ? "bg-teal-50 dark:bg-teal-900/20" : "hover:bg-muted/50",
                    )}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                        isSelected ? "bg-teal-500 text-white" : "bg-muted text-muted-foreground",
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={cn("font-medium", isSelected && "text-teal-700 dark:text-teal-300")}>
                        {item.title}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">{item.description}</div>
                    </div>
                    {isSelected && <ArrowRight className="w-4 h-4 text-teal-500 flex-shrink-0" />}
                  </button>
                )
              })}
            </div>
          ))}

          {query && results.length === 0 && (
            <div className="px-4 py-8 text-center text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No results found for "{query}"</p>
              <p className="text-sm mt-1">Try searching for pages, actions, or settings</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-4 py-2 flex items-center justify-between text-xs text-muted-foreground bg-muted/30">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="bg-muted px-1.5 py-0.5 rounded">↑</kbd>
              <kbd className="bg-muted px-1.5 py-0.5 rounded">↓</kbd>
              to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-muted px-1.5 py-0.5 rounded">↵</kbd>
              to select
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="bg-muted px-1.5 py-0.5 rounded">ESC</kbd>
            to close
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
