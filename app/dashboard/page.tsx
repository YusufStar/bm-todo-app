"use client";

import { useUser } from "@/hooks/useUser";
import { useAuthStore } from "@/store/auth.store";

const DashboardPage = () => {
  const { user } = useUser();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-32px)] p-6">
      <h1>Dashboard</h1>
    </div>
  );
};

export default DashboardPage;
