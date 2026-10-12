"use client"

import * as React from "react"
import Image from "next/image"
import {
  ChartColumnIcon,
  ClipboardListIcon,
  LayoutDashboardIcon,
  PackageIcon,
  StoreIcon,
  UsersIcon,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// sidebar-07 pattern: team switcher header, collapsible nav,
// user footer. Wired with Golden Spark store data.
const data = {
  teams: [
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
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboardIcon />,
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
      title: "Orders",
      url: "/dashboard/orders",
      icon: <ClipboardListIcon />,
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
  ],
}

export function AppSidebar({
  userSlot,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  userSlot?: React.ReactNode
}) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>{userSlot}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
