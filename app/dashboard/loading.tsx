export default function DashboardLoading() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-32px)]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-gray-500">Loading user data...</p>
      </div>
    </div>
  );
}
