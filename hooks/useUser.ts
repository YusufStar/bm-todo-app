import { useQuery } from "@tanstack/react-query";
import { fetchCurrentUser } from "@/lib/api/auth";
import { useAuthStore } from "@/store/auth.store";
import { useEffect } from "react";
import { User } from "@prisma/client";
import { logout } from "@/actions/auth/logout";
/**
 * Hook to fetch and manage user data
 * - Uses React Query for data fetching and caching
 * - Syncs with Zustand store automatically
 * - Supports manual refreshing
 */
export function useUser(options?: {
  initialData?: User | null;
  refetchInterval?: number | false;
}) {
  const { setUser } = useAuthStore();

  const query = useQuery({
    queryKey: ["user"],
    queryFn: fetchCurrentUser,
    refetchInterval: options?.refetchInterval ?? false,
    refetchOnWindowFocus: true,
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
    status: query.status,
  };
}
