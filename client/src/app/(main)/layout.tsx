import { AuthProvider } from '@/context/auth-provider'
import React from 'react'

function MainLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <AuthProvider>
            {children}
        </AuthProvider>
    )
}

export default MainLayout