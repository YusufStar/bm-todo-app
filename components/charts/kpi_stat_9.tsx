"use client";

import React from "react";
import {
    Button,
    Card,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    cn,
    Chip,
} from "@heroui/react";
import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";
import { ArrowUpRight, ArrowDownRight, ArrowRight, MoreVertical } from "lucide-react";

export type KPIStat9Props = {
    title: string;
    subtitle: string;
    value: string;
    chartData: {
        month: string;
        value: number;
    } [];
    change: string;
    color: string;
    xaxis: string;
}

export default function KPIStat9({ data }: { data: KPIStat9Props[] }) {
    return (
        <dl className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
            {data.map(({ title, subtitle, value, change, color, chartData }, index) => (
                <Card key={index} className="border border-transparent dark:border-default-100">
                    <section className="flex flex-col flex-nowrap">
                        <div className="flex flex-col justify-between gap-y-2 px-4 pt-4">
                            <div className="flex flex-col gap-y-2">
                                <div className="flex flex-col gap-y-0">
                                    <dt className="text-sm font-medium text-default-600">{title}</dt>
                                    <dt className="text-tiny font-normal text-default-400">{subtitle}</dt>
                                </div>
                                <div className="flex items-baseline gap-x-2">
                                    <dd className="text-xl font-semibold text-default-700">{value}</dd>
                                    <Chip
                                        classNames={{
                                            content: "font-medium",
                                        }}
                                        color={
                                            color === "success"
                                                ? "success"
                                                : color === "primary"
                                                    ? "primary"
                                                    : color === "secondary"
                                                        ? "secondary"
                                                        : color === "warning"
                                                            ? "warning"
                                                            : color === "danger"
                                                                ? "danger"
                                                                : "default"
                                        }
                                        radius="sm"
                                        size="sm"
                                        startContent={
                                            color === "success" ? (
                                                <ArrowUpRight size={16} />
                                            ) : color === "danger" ? (
                                                <ArrowDownRight size={16} />
                                            ) : (
                                                <ArrowRight size={16} />
                                            )
                                        }
                                        variant="flat"
                                    >
                                        <span>{change}</span>
                                    </Chip>
                                </div>
                            </div>
                        </div>
                        <div className="min-h-24 w-full">
                            <ResponsiveContainer className="[&_.recharts-surface]:outline-none">
                                <AreaChart accessibilityLayer className="translate-y-1 scale-105" data={chartData}>
                                    <defs>
                                        <linearGradient id={"colorUv" + index} x1="0" x2="0" y1="0" y2="1">
                                            <stop
                                                offset="10%"
                                                stopColor={cn({
                                                    "hsl(var(--heroui-success))": color === "success",
                                                    "hsl(var(--heroui-primary))": color === "primary",
                                                    "hsl(var(--heroui-secondary))": color === "secondary",
                                                    "hsl(var(--heroui-warning))": color === "warning",
                                                    "hsl(var(--heroui-danger))": color === "danger",
                                                    "hsl(var(--heroui-foreground))": color === "default",
                                                })}
                                                stopOpacity={0.3}
                                            />
                                            <stop
                                                offset="100%"
                                                stopColor={cn({
                                                    "hsl(var(--heroui-success))": color === "success",
                                                    "hsl(var(--heroui-primary))": color === "primary",
                                                    "hsl(var(--heroui-secondary))": color === "secondary",
                                                    "hsl(var(--heroui-warning))": color === "warning",
                                                    "hsl(var(--heroui-danger))": color === "danger",
                                                    "hsl(var(--heroui-foreground))": color === "default",
                                                })}
                                                stopOpacity={0.1}
                                            />
                                        </linearGradient>
                                    </defs>
                                    <YAxis
                                        domain={[Math.min(...chartData.map((d) => d.value)), "auto"]}
                                        hide={true}
                                    />
                                    <Area
                                        dataKey="value"
                                        fill={`url(#colorUv${index})`}
                                        stroke={cn({
                                            "hsl(var(--heroui-success))": color === "success",
                                            "hsl(var(--heroui-primary))": color === "primary",
                                            "hsl(var(--heroui-secondary))": color === "secondary",
                                            "hsl(var(--heroui-warning))": color === "warning",
                                            "hsl(var(--heroui-danger))": color === "danger",
                                            "hsl(var(--heroui-foreground))": color === "default",
                                        })}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <Dropdown
                            classNames={{
                                content: "min-w-[120px]",
                            }}
                            placement="bottom-end"
                        >
                            <DropdownTrigger>
                                <Button
                                    isIconOnly
                                    className="absolute right-2 top-2 w-auto rounded-full"
                                    size="sm"
                                    variant="light"
                                >
                                    <MoreVertical size={16} />
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                                itemClasses={{
                                    title: "text-tiny",
                                }}
                                variant="flat"
                            >
                                <DropdownItem key="view-details">View Details</DropdownItem>
                                <DropdownItem key="export-data">Export Data</DropdownItem>
                                <DropdownItem key="set-alert">Set Alert</DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </section>
                </Card>
            ))}
        </dl>
    );
}
