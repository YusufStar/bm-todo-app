"use client";
import React from 'react';
import { Separator } from '@/components/ui/separator';

const InformationsPage = () => {
    return (
        <div className="flex flex-col gap-4 flex-1">
            {/* Header */}
            <span className="text-2xl tracking-[-0.16px] font-bold mb-1">
                Account Informations
            </span>

            <Separator />
        </div>
    );
}

export default InformationsPage;