import { auth } from "@/auth";

const DashboardPage = async () => {
  const session = await auth();

  return (
    <div className="flex flex-col items-center justify-center">
      <h1>Dashboard</h1>
      <p className="text-sm break-all">{JSON.stringify(session?.user)}</p>
    </div>
  );
};

export default DashboardPage;
