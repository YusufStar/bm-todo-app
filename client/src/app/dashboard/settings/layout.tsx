"use client"
import React from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

function SettingsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathName = usePathname()

    const tabs = [
        {
            name: 'Security',
            href: '/dashboard/settings/security',
            id: 'security',
        },
        {
            name: 'Informations',
            href: '/dashboard/settings/informations',
            id: "informations",
        },
    ]

    const activeTab = tabs.find((item) => pathName.includes(item.id))?.id

    return (
        <div className="h-full w-full flex overflow-hidden gap-6">
            <div className="flex-[0.30] flex flex-col gap-4">
                <span className="text-xl tracking-[-0.16px] text-slate-12 font-bold mb-1">
                    Account Settings
                </span>

                <div className='flex flex-col gap-2'>
                    {
                        tabs.map((item) => (
                            <Link key={item.id} className='w-full' href={item.href}>
                                <Button
                                    variant={activeTab === item.id ? 'default' : 'ghost'}
                                    className="w-full text-left"
                                >
                                    {item.name}
                                </Button>
                            </Link>
                        ))
                    }
                </div>
            </div>

            {children}
        </div>
    )
}

export default SettingsLayout