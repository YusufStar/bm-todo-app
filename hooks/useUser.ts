import { useQuery } from "@tanstack/react-query";
import { fetchCurrentUser } from "@/lib/api/auth";
import { useAuthStore } from "@/store/auth.store";
import { useEffect } from "react";
import { User } from "@prisma/client";
import { logout } from "@/actions/auth/logout";

export function useUser() {
  const { setUser } = useAuthStore();

  const query = useQuery({
    queryKey: ["user"],
    queryFn: fetchCurrentUser,
    refetchOnWindowFocus: true,
    refetchInterval: false,
    refetchOnMount: true,
  });

  useEffect(() => {
    if (query.data === "Unauthorized") {
      logout();
    }
    if (query.data) {
      setUser(query.data as User);
    }
  }, [query.data, setUser]);

  return {
    user: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
    isFetching: query.isFetching,
    isPending: query.isPending,
    status: query.status,
  };
}
