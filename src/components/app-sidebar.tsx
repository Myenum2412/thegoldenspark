"use client"

import * as React from "react"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  ChartColumnIcon,
  LayoutDashboardIcon,
  PackageIcon,
  StoreIcon,
  UsersIcon,
} from "lucide-react"

import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
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
  SidebarRail,
} from "@/components/ui/sidebar"

const teams = [
  {
    name: "Golden Spark",
    logo: (
      <Image
        src="/logo.png"
        alt="Golden Spark logo"
        width={32}
        height={32}
        className="size-8 rounded-md object-cover"
      />
    ),
    plan: "Store Admin",
  },
]

const navMain = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: <LayoutDashboardIcon />,
    isActive: true,
  },
  {
    title: "Customers",
    url: "/dashboard/customers",
    icon: <UsersIcon />,
  },
  {
    title: "Products",
    url: "/dashboard/products",
    icon: <PackageIcon />,
  },
  {
    title: "Reports",
    url: "/dashboard/reports",
    icon: <ChartColumnIcon />,
  },
  {
    title: "View Store",
    url: "/",
    icon: <StoreIcon />,
  },
]

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: { name: string; email: string; avatar: string }
}) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Store</SidebarGroupLabel>
          <SidebarMenu>
            {navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  isActive={
                    item.url === "/dashboard"
                      ? pathname === "/dashboard"
                      : pathname.startsWith(item.url)
                  }
                  render={
                    <a href={item.url}>
                      {item.icon}
                      <span>{item.title}</span>
                    </a>
                  }
                />
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
