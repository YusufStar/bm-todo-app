import { auth } from "@/auth";

const DashboardPage = async () => {
  const session = await auth();

  return (
    <div className="h-full flex items-center justify-center">
      <h1>Dashboard</h1>
      <p>{JSON.stringify(session?.user)}</p>
    </div>
  );
};

export default DashboardPage;
