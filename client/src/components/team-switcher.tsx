"use client"

import * as React from "react"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useTeamContext } from "@/context/team-provider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { useMutation } from "@tanstack/react-query"
import { selectTeamMutationFn } from "@/lib/api"
import { toast } from "sonner"
import { Button } from "./ui/button"

export function TeamSwitcher() {
  const { currentTeam, teams, isLoading, currentTeamIsLoading } = useTeamContext()

  const { mutate, isPending } = useMutation({
    mutationFn: selectTeamMutationFn,
  })

  const handleTeamChange = (id: string) => {
    if (id === "") {
      return
    }

    mutate(id, {
      onSuccess: () => {
        toast.success("Team switched successfully")
      },
      onError: (error) => {
        toast.error(error.message)
      }
    })
  }

  const noTeamsAvailable = !isLoading && !currentTeamIsLoading && (teams?.length ?? 0) === 0

  if (noTeamsAvailable) {
    return <div className="w-full flex flex-col gap-1 items-start h-20">
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          toast.error("Please create a team first")
        }}
      >
        Create a team
      </Button>
      <span className="text-xs text-muted-foreground">
        No teams available.
      </span>
    </div>
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="default"
          asChild
        >
          <Select
            value={currentTeam?._id ?? ""}
            onValueChange={handleTeamChange}
            disabled={isLoading || currentTeamIsLoading || isPending}
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={
                  isLoading || currentTeamIsLoading
                    ? "Loading..."
                    : isPending
                      ? "Switching..."
                      : "Select a team"
                }
              />
            </SelectTrigger>

            {teams && teams.length > 0 && (
              <SelectContent position="popper">
                {teams.map((team) => (
                  <SelectItem key={team._id} value={team._id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            )}
          </Select>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
