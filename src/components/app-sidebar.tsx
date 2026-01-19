"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  Users,
  School,
  ClipboardCheck,
  FileText,
  UserCheck,
  Settings,
  LogOut,
  Bell,
  ChevronRight,
  Eye,
} from "lucide-react"

import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import type { UserRole } from "@/types/database"

// Role configuration
const roleLabels: Record<UserRole, string> = {
  ADMIN: "Administrator",
  TEACHER: "Guru Mapel",
  HOMEROOM: "Wali Kelas",
  COUNSELOR: "Guru BK",
  STUDENT: "Siswa",
}

const roleColors: Record<UserRole, string> = {
  ADMIN: "bg-red-100 text-red-700",
  TEACHER: "bg-blue-100 text-blue-700",
  HOMEROOM: "bg-green-100 text-green-700",
  COUNSELOR: "bg-purple-100 text-purple-700",
  STUDENT: "bg-amber-100 text-amber-700",
}

// Menu configuration based on roles
const roleMenus: Record<UserRole, { title: string; url: string; icon: React.ElementType; items?: { title: string; url: string }[] }[]> = {
  ADMIN: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: "Ujian",
      url: "/admin/exams",
      icon: FileText,
    },
    {
      title: "Mata Pelajaran",
      url: "/admin/subjects",
      icon: BookOpen,
    },
    {
      title: "Kelas",
      url: "/admin/classes",
      icon: School,
    },
    {
      title: "Siswa",
      url: "/admin/students",
      icon: GraduationCap,
    },
    {
      title: "Guru",
      url: "/admin/teachers",
      icon: Users,
    },
  ],
  TEACHER: [
    {
      title: "Dashboard",
      url: "/teacher",
      icon: LayoutDashboard,
    },
    {
      title: "Lembar Ketuntasan",
      url: "/teacher/completion-sheets",
      icon: ClipboardCheck,
    },
  ],
  HOMEROOM: [
    {
      title: "Dashboard",
      url: "/homeroom",
      icon: LayoutDashboard,
    },
    {
      title: "Approval",
      url: "/homeroom/approval",
      icon: UserCheck,
    },
    {
      title: "Monitoring",
      url: "/homeroom/monitoring",
      icon: Eye,
    },
  ],
  COUNSELOR: [
    {
      title: "Dashboard",
      url: "/counselor",
      icon: LayoutDashboard,
    },
    {
      title: "Final Approval",
      url: "/counselor/approval",
      icon: UserCheck,
    },
  ],
  STUDENT: [],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: {
    id?: string
    full_name: string
    email: string
    avatar_url?: string
    roles: UserRole[]
  }
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* Header with Logo */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                  <GraduationCap className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Si-Tuntas
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    Sistem Ketuntasan
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Main Navigation */}
      <SidebarContent>
        {user.roles.map((role) => {
          const menus = roleMenus[role];
          if (!menus || menus.length === 0) return null;

          return (
            <SidebarGroup key={role}>
              <SidebarGroupLabel>{roleLabels[role]}</SidebarGroupLabel>
              <SidebarMenu>
                {menus.map((item) => {
                  const isActive = item.title === "Dashboard"
                    ? pathname === item.url
                    : pathname === item.url || pathname.startsWith(item.url + "/")

                  if (item.items && item.items.length > 0) {
                    return (
                      <Collapsible key={item.url} asChild defaultOpen={isActive}>
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton tooltip={item.title} isActive={isActive}>
                              <item.icon />
                              <span>{item.title}</span>
                              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.items.map((subItem) => (
                                <SidebarMenuSubItem key={subItem.url}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={pathname === subItem.url}
                                  >
                                    <Link href={subItem.url}>
                                      <span>{subItem.title}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    )
                  }

                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
                        <Link href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroup>
          )
        })}

        {/* Settings */}
        <SidebarGroup className="mt-auto">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Notifikasi">
                <Link href="/notifications">
                  <Bell />
                  <span>Notifikasi</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Pengaturan">
                <Link href="/settings">
                  <Settings />
                  <span>Pengaturan</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* User Footer */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.avatar_url} alt={user.full_name} />
                    <AvatarFallback className="rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-xs">
                      {getInitials(user.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.full_name}</span>
                    <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="top"
                align="start"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={user.avatar_url} alt={user.full_name} />
                      <AvatarFallback className="rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-xs">
                        {getInitials(user.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{user.full_name}</span>
                      <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5 flex flex-wrap gap-1">
                  {user.roles.map(role => (
                    <Badge key={role} variant="secondary" className={`text-xs ${roleColors[role]}`}>
                      {roleLabels[role]}
                    </Badge>
                  ))}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600">
                  <LogOut />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
