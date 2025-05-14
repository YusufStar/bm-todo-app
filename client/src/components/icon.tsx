"use client";

import { LucideIcons } from "@/lib/icon-lib";
import { LucideProps } from "lucide-react";
import React from "react";

type Props = {
    iconName: keyof typeof LucideIcons;
    size?: number;
    color?: string;
} & LucideProps;

export const DynamicLucideIcon: React.FC<Props> = ({
    iconName,
    ...props
}) => {
    const IconComponent = LucideIcons[iconName] as React.FC<LucideProps>;

    if (!IconComponent) return null;

    return <IconComponent {...props} />;
};