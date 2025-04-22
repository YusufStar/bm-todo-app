"use client";

import { useRouter } from "next/navigation";
import React from "react";
import { HeroUIProvider, ToastProvider } from "@heroui/react";
import { ThemeProvider as NextThemesProvider, ThemeProviderProps } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from 'react';
import { useCompanyStore } from '@/lib/store';
import { User } from "@prisma/client";
import { useUserStore } from "@/lib/store/userStore";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
  user: User | null;
}

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >;
  }
}


// Create a client with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Component to initialize Zustand stores
function StoreInitializer() {
  useEffect(() => {
    // Hydrate company store from localStorage on client
    useCompanyStore.getState().hydrate();
    useCompanyStore.getState().fetchCompanies();
  }, []);
  
  return null;
}

export function Providers({ children, themeProps, user }: ProvidersProps) {
  const router = useRouter();

  useEffect(() => {
    if (user) {
      useUserStore.getState().setUser(user);
    }
  }, [user]);

  return (
    <QueryClientProvider client={queryClient}>
      <StoreInitializer />
      <HeroUIProvider navigate={router.push}>
        <NextThemesProvider {...themeProps}>
          <ToastProvider
            toastProps={{
              timeout: 2500,
            }}
          />
          {children}
        </NextThemesProvider>
      </HeroUIProvider>
    </QueryClientProvider>
  );
}
