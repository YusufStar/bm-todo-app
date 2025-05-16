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
import { CreateTeamModal } from "./forms/create-team"
import { Plus } from "lucide-react"

export function TeamSwitcher() {
  const [open, setOpen] = React.useState(false)
  const [refetcing, setRefetching] = React.useState(false)
  const { currentTeam, teams, isLoading, currentTeamIsLoading, refetch, currentTeamRefetch } = useTeamContext()

  const { mutate, isPending } = useMutation({
    mutationFn: selectTeamMutationFn,
  })

  const handleTeamChange = (id: string) => {
    if (id === "") {
      return
    }

    if (id === "yJoy8aeXNbDFkmXZH24q5xhbY1hBFrJH+/b1Lr15bH4=") {
      setOpen(true)
      return
    }

    setRefetching(true)
    mutate(id, {
      onSuccess: () => {
        toast.success("Team switched successfully")
        setRefetching(true)
        Promise.all([
          refetch(),
          currentTeamRefetch(),
        ]).then(() => {
          setRefetching(false)
        })
      },
      onError: (error) => {
        toast.error(error.message)
      }
    })
  }

  const noTeamsAvailable = !isLoading && !currentTeamIsLoading && (teams?.length ?? 0) === 0

  if (noTeamsAvailable) {
    return <div className="w-full flex flex-col gap-1 items-start h-20">
      <CreateTeamModal onOpenChange={setOpen} open={open} />
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          setOpen(true)
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
    <>
      <CreateTeamModal onOpenChange={setOpen} open={open} />

      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="default"
            asChild
          >
            <Select
              value={currentTeam?._id ?? ""}
              onValueChange={handleTeamChange}
              disabled={isLoading || currentTeamIsLoading || isPending || refetcing}
            >
              <SelectTrigger className="w-full">
                {isLoading || currentTeamIsLoading ? (
                  <span className="text-muted-foreground">Loading...</span>
                ) : isPending || refetcing ? (
                  <span className="text-muted-foreground">Switching...</span>
                ) : (
                  <SelectValue placeholder="Select a team" />
                )}
              </SelectTrigger>

              {teams && teams.length > 0 && (
                <SelectContent position="popper">
                  {teams.map((team) => (
                    <SelectItem key={team._id} value={team._id}>
                      {team.name}
                    </SelectItem>
                  ))}

                  <SelectItem value="yJoy8aeXNbDFkmXZH24q5xhbY1hBFrJH+/b1Lr15bH4=">
                    <Plus className="mr-2 h-4 w-4" />
                    Create a team
                  </SelectItem>
                </SelectContent>
              )}
            </Select>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  )
}
