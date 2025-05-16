"use client";

import { getCurrentTeamQueryFn, getTeamsQueryFn } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

const useTeams = () => {
    const query = useQuery({
        queryKey: ["teams"],
        queryFn: getTeamsQueryFn,
        staleTime: Infinity,
        refetchOnWindowFocus: false,
    });
    return query;
};

const useCurrentTeam = () => {
    const query = useQuery({
        queryKey: ["currentTeam"],
        queryFn: getCurrentTeamQueryFn,
        staleTime: Infinity,
        retry: 2,
        refetchOnWindowFocus: false,
    });
    return query;
};

export { useTeams, useCurrentTeam };