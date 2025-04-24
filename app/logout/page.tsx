"use client";

import { logout } from "@/actions/auth/logout";
import { useEffect } from "react";


export default function Logout() {
    const signout = async () => {
        await logout();
    }

    useEffect(() => {
        signout();
    }, []);

    return null;
}