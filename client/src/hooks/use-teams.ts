"use client";

import { getTeamsQueryFn } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

const useTeams = () => {
    const query = useQuery({
        queryKey: ["teams"],
        queryFn: getTeamsQueryFn,
        staleTime: Infinity,
    });
    return query;
};

export default useTeams;