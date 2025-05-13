function SettingsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="h-full w-full flex overflow-hidden gap-6">
            {children}
        </div>
    )
}

export default SettingsLayout