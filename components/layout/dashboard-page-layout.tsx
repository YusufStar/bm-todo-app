export default function DashboardPageLayout({
  children,
  title,
  subtitle,
  actions,
}: {
  children: React.ReactNode[] | React.ReactNode;
  title: string;
  subtitle: string;
  actions?: React.ReactNode[] | React.ReactNode;
}) {
  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex items-start justify-between w-full">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>

        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>

        {children}
    </div>
  );
}