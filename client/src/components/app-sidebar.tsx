"use client"

import {
  Frame,
  LucideIcon,
  Map,
  PieChart,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { LucideIcons } from "@/lib/icon-lib"

const data: {
  teams: {
    name: string
    logo: keyof typeof LucideIcons
    plan: string
  }[]
  navMain: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
  projects: {
    name: string
    url: string
    icon: LucideIcon
  }[]
} = {
  teams: [
    {
      name: "Acme Inc",
      logo: "GalleryVerticalEnd",
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: "AudioWaveform",
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: "Command",
      plan: "Free",
    },
  ],
  navMain: [
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
