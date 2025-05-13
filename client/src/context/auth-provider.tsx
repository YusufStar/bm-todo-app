"use client";

import useAuth from "@/hooks/use-auth";
import { usePathname } from "next/navigation";
import React, { createContext, useContext, useEffect } from "react";

type DepartmentType = {
    _id: string;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
};

type UserType = {
    avatar: string | undefined;
    department: DepartmentType;
    name: string;
    email: string;
    isEmailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    userPreferences: {
        enable2FA: boolean;
    };
};

type AuthContextType = {
    user?: UserType;
    error: any;
    isLoading: boolean;
    isFetching: boolean;
    refetch: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const pathname = usePathname()
    const { data, error, isLoading, isFetching, refetch } = useAuth();
    const user = data?.data?.user;

    useEffect(() => {
        if (pathname.includes("/dashboard")) {
            refetch();
        }
    }, [pathname]);

    return (
        <AuthContext.Provider
            value={{ user, error, isLoading, isFetching, refetch }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    const conext = useContext(AuthContext);
    if (!conext) {
        throw new Error("useAuthContext must be used within a AuthProvider");
    }
    return conext;
};