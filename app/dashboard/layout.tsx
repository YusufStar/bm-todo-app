"use client";

import React, { useEffect } from "react";
import { useUser } from "@/hooks/useUser";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { refetch } = useUser();

  useEffect(() => {
    refetch();

    const interval = setInterval(() => {
      refetch();
    }, 1000);

    return () => clearInterval(interval);
  }, [refetch]);

  return <div className="flex flex-col w-full">{children}</div>;
};

export default DashboardLayout;
