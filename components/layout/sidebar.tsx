"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Fingerprint,
  ShieldAlert,
  User,
  Shield,
  FlaskConical,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Search,
  Command,
  Menu,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SidebarProps {
  userRole?: string
  onSearchOpen: () => void
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/biometric/enroll", label: "Biometrics", icon: Fingerprint },
  { href: "/break-glass", label: "Break-Glass", icon: ShieldAlert },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/security", label: "Security", icon: Shield },
  { href: "/test", label: "Testing", icon: FlaskConical },
]

const adminItems = [{ href: "/admin", label: "Admin Panel", icon: Users }]

export function Sidebar({ userRole, onSearchOpen }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setMobileOpen(false)
      }
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = "/auth/login"
  }

  const sidebarContent = (
    <>
      {/* Logo */}
      <div
        className={cn(
          "flex items-center border-b border-slate-700 h-16 px-4",
          collapsed && !isMobile ? "justify-center" : "justify-between",
        )}
      >
        {(!collapsed || isMobile) && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">HO-MFA</span>
          </Link>
        )}
        {collapsed && !isMobile && (
          <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
        )}
        {/* Mobile close button */}
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(false)}
            className="text-slate-300 hover:text-white md:hidden"
          >
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Search Button */}
      <div className="px-3 py-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              onClick={() => {
                onSearchOpen()
                setMobileOpen(false)
              }}
              className={cn(
                "w-full bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-white",
                collapsed && !isMobile ? "px-0 justify-center" : "justify-start",
              )}
            >
              <Search className="w-4 h-4" />
              {(!collapsed || isMobile) && (
                <>
                  <span className="ml-2 flex-1 text-left">Search...</span>
                  <kbd className="ml-auto text-xs bg-slate-700 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    <Command className="w-3 h-3" />K
                  </kbd>
                </>
              )}
            </Button>
          </TooltipTrigger>
          {collapsed && !isMobile && <TooltipContent side="right">Search (Cmd+K)</TooltipContent>}
        </Tooltip>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div
          className={cn(
            "text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2",
            collapsed && !isMobile && "sr-only",
          )}
        >
          Main Menu
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                    isActive
                      ? "bg-teal-500 text-white shadow-lg shadow-teal-500/25"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white",
                    collapsed && !isMobile && "justify-center px-0",
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {(!collapsed || isMobile) && <span>{item.label}</span>}
                </Link>
              </TooltipTrigger>
              {collapsed && !isMobile && <TooltipContent side="right">{item.label}</TooltipContent>}
            </Tooltip>
          )
        })}

        {/* Admin Section */}
        {userRole === "admin" && (
          <>
            <div
              className={cn(
                "text-xs font-semibold text-slate-400 uppercase tracking-wider mt-6 mb-2",
                collapsed && !isMobile && "sr-only",
              )}
            >
              Administration
            </div>
            {adminItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                        isActive
                          ? "bg-purple-500 text-white shadow-lg shadow-purple-500/25"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white",
                        collapsed && !isMobile && "justify-center px-0",
                      )}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {(!collapsed || isMobile) && <span>{item.label}</span>}
                    </Link>
                  </TooltipTrigger>
                  {collapsed && !isMobile && <TooltipContent side="right">{item.label}</TooltipContent>}
                </Tooltip>
              )
            })}
          </>
        )}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-slate-700 p-3 space-y-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className={cn(
                "w-full text-slate-300 hover:text-white hover:bg-red-500/20",
                collapsed && !isMobile ? "px-0 justify-center" : "justify-start",
              )}
            >
              <LogOut className="w-5 h-5" />
              {(!collapsed || isMobile) && <span className="ml-3">Sign Out</span>}
            </Button>
          </TooltipTrigger>
          {collapsed && !isMobile && <TooltipContent side="right">Sign Out</TooltipContent>}
        </Tooltip>

        {/* Collapse Toggle - Desktop only */}
        {!isMobile && (
          <Button
            variant="ghost"
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "w-full text-slate-400 hover:text-white hover:bg-slate-800",
              collapsed ? "px-0 justify-center" : "justify-start",
            )}
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            {!collapsed && <span className="ml-3">Collapse</span>}
          </Button>
        )}
      </div>
    </>
  )

  return (
    <TooltipProvider delayDuration={0}>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden bg-slate-900 text-white hover:bg-slate-800"
      >
        <Menu className="w-5 h-5" />
      </Button>

      {/* Mobile Overlay */}
      {mobileOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-slate-900 text-white transition-all duration-300 flex flex-col",
          // Desktop styles
          "hidden md:flex",
          collapsed ? "md:w-16" : "md:w-64",
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-64 bg-slate-900 text-white transition-transform duration-300 flex flex-col md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {sidebarContent}
      </aside>
    </TooltipProvider>
  )
}
