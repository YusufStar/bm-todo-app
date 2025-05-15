"use client"

import { LucideIcons } from "@/lib/icon-lib"

export function DynamicLucideIcon({
    name,
    ...props
}: {
    name: keyof typeof LucideIcons
    className?: string
}) {
    const Icon = LucideIcons[name]
    if (!Icon) return null
    return <Icon {...props} />
}
