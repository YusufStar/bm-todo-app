"use client";

import { useTeams, useCurrentTeam } from "@/hooks/use-teams";
import { createContext, useContext } from "react";
import { LucideIcons } from "@/lib/icon-lib"
import { UserType } from "@/context/auth-provider"
import { TeamMemberRole, TeamPlans, TeamStatus } from "@/validate"

interface TeamMember {
    role: TeamMemberRole;
    user: UserType;
}

export interface TeamType {
    _id: string;
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
    currentTeam: TeamType;
    error: any;
    isLoading: boolean;
    isFetching: boolean;
    currentTeamError: any;
    currentTeamIsLoading: boolean;
    currentTeamIsRefetching: boolean;
    isRefetching: boolean;

    currentTeamRefetch: () => void;
    refetch: () => void;
};

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const TeamProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const { data, error, isLoading, isFetching, refetch, isRefetching } = useTeams();
    const { data: currentTeamData, refetch: currentTeamRefetch, isLoading: currentTeamIsLoading, error: currentTeamError, isRefetching: currentTeamIsRefetching } = useCurrentTeam();
    const teams = data?.data?.teams;
    const currentTeam = currentTeamData?.data?.team;

    return (
        <TeamContext.Provider
            value={{ teams, error, isLoading, isFetching, refetch, currentTeam, currentTeamError, currentTeamIsLoading, currentTeamRefetch, currentTeamIsRefetching, isRefetching }}
        >
            {children}
        </TeamContext.Provider>
    );
};

export const useTeamContext = () => {
    const context = useContext(TeamContext);
    if (!context) {
        throw new Error("useTeamContext must be used within a TeamProvider");
    }
    return context;
};