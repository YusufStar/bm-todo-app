"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Loader, Plus } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { DynamicLucideIcon } from "./icon"
import { TeamType, useTeamContext } from "@/context/team-provider"
import { CreateTeamModal } from "./forms/create-team"
import { cn } from "@/lib/utils"


export function TeamSwitcher() {
  const { teams, isLoading, refetch } = useTeamContext()
  const { isMobile } = useSidebar()
  const [activeTeam, setActiveTeam] = React.useState<TeamType | null>(null)
  const [createTeamOpen, setCreateTeamOpen] = React.useState(false)

  React.useEffect(() => {
    if (teams && teams.length > 0 && !activeTeam) {
      setActiveTeam(teams[0])
    }
  }, [teams, activeTeam])

  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="default"
          >
            <div className="w-full text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <Loader className="size-4 animate-spin" />
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {activeTeam ? <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground bg-sidebar-accent/50 px-4 hover:bg-sidebar-accent/80 transition-colors duration-200"
            >
              <div className="flex items-center gap-2 w-full">
                <div className="flex size-6 items-center justify-center rounded-md border bg-sidebar-accent/30">
                  <DynamicLucideIcon name={activeTeam.logo} className="size-4" />
                </div>
                <span className="truncate font-medium">{activeTeam.name}</span>
                <ChevronsUpDown className="ml-auto h-4 w-4 opacity-70" />
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-64 min-w-56"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-sidebar-primary-foreground/70 text-xs font-semibold px-2 py-1.5">
              Your Teams
            </DropdownMenuLabel>
            <div className="max-h-72 overflow-y-auto py-1">
              {teams && teams?.length > 0 && teams.map((team, index) => (
                <DropdownMenuItem
                  key={team.name}
                  onClick={() => setActiveTeam(team)}
                  className={cn(
                    "gap-2 p-2 rounded-lg mx-1 cursor-pointer hover:bg-sidebar-accent/20 transition-colors duration-200",
                    activeTeam?.name === team.name ? "bg-sidebar-accent/30" : ""
                  )}
                >
                  <div className={cn(
                    "flex size-7 items-center justify-center rounded-md border",
                    activeTeam?.name === team.name
                      ? "bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-accent"
                      : "text-sidebar-primary-foreground border-sidebar-primary-foreground/20 bg-transparent"
                  )}>
                    <DynamicLucideIcon name={team.logo} className="size-4" />
                  </div>
                  <div className={
                    cn(
                      "font-medium flex-1",
                      activeTeam?.name === team.name
                        ? "text-sidebar-accent-foreground"
                        : "text-sidebar-primary-foreground"
                    )
                  }>
                    {team.name}
                  </div>
                  {activeTeam?.name === team.name &&
                    <Check className="size-4 text-sidebar-accent-foreground/80" />
                  }
                  <DropdownMenuShortcut className="text-sidebar-primary-foreground/50">⌘{index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              ))}
            </div>
            <DropdownMenuSeparator className="my-1 bg-sidebar-primary-foreground/10" />
            <DropdownMenuItem
              className="gap-2 p-2 rounded-lg mx-1 cursor-pointer hover:bg-sidebar-accent/20 transition-colors duration-200"
              onClick={() => setCreateTeamOpen(true)}
            >
              <div className="flex size-7 items-center justify-center rounded-md border border-sidebar-primary-foreground/20 bg-sidebar-accent/10">
                <Plus className="size-4 text-sidebar-accent-foreground" />
              </div>
              <div className="text-sidebar-primary-foreground font-medium">Add new team</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu> : <CreateTeamModal />}
        <CreateTeamModal
          open={createTeamOpen}
          onOpenChange={setCreateTeamOpen}
          onSuccess={() => {
            setCreateTeamOpen(false)
            refetch()
          }}
        />
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
