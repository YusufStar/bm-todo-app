"use client";

import useTeams from "@/hooks/use-teams";
import { usePathname } from "next/navigation";
import React, { createContext, useContext, useEffect } from "react";
import { LucideIcons } from "@/lib/icon-lib"
import { UserType } from "@/context/auth-provider"
import { TeamMemberRole, TeamPlans, TeamStatus } from "@/validate"

interface TeamMember {
  role: TeamMemberRole;
  user: UserType;
}

export interface TeamType {
  name: string
  logo: keyof typeof LucideIcons
  plan: TeamPlans;
  status: TeamStatus;

  members: TeamMember[];
  createdBy: UserType;

  createdAt: Date;
}

type TeamContextType = {
    teams?: TeamType[];
    error: any;
    isLoading: boolean;
    isFetching: boolean;
    refetch: () => void;
};

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const TeamProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const pathname = usePathname()
    const { data, error, isLoading, isFetching, refetch } = useTeams();
    const teams = data?.data?.teams;

    useEffect(() => {
        if (pathname.includes("/dashboard")) {
            refetch();
        }
    }, [pathname]);

    console.log("TeamProvider", { teams, error, isLoading, isFetching });

    return (
        <TeamContext.Provider
            value={{ teams, error, isLoading, isFetching, refetch }}
        >
            {children}
        </TeamContext.Provider>
    );
};

export const useTeamContext = () => {
    const conext = useContext(TeamContext);
    if (!conext) {
        throw new Error("useTeamContext must be used within a TeamProvider");
    }
    return conext;
};