"use client";

import type { VariantProps, CardProps } from "@heroui/react";

import {
    Button,
    Card,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    cn,
    tv,
} from "@heroui/react";
import React from "react";
import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";
import { ArrowUpRight, ArrowDownRight, ArrowRight, MoreVertical, LucideIcon } from "lucide-react";

type ChartColor = "default" | "primary" | "secondary" | "success" | "warning" | "danger";
type ChartXAxis = "month" | "day";

export type KPIStat8Props = {
        title: string;
        value: string | number;
        chartData: {
            month: string;
            value: number;
        }[];
        icon?: LucideIcon;
        change: string;
        color: ChartColor;
        xaxis: ChartXAxis;
}

export default function KPIStat8({ data }: { data: KPIStat8Props[] }) {
    return (
        <dl className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
            {data.map(({ title, value, change, color, xaxis, chartData, icon }, index) => (
                <ChartCard
                    key={index}
                    change={change}
                    chartData={chartData}
                    color={color}
                    icon={icon}
                    index={index}
                    title={title}
                    value={value}
                    xaxis={xaxis}
                />
            ))}
        </dl>
    );
}

const chart = tv({
    slots: {
        card: "shadow-none",
        iconWrapper: "rounded-small p-2",
        trendIconWrapper: "mt-2 flex items-center gap-x-1 text-xs font-medium",
    },
    variants: {
        color: {
            default: {
                card: "bg-default-50",
                iconWrapper: "bg-default-200/50 text-default-700",
                trendIconWrapper: "text-default-700",
            },
            primary: {
                card: "bg-primary-50 ",
                iconWrapper: "bg-primary-100 dark:bg-primary-100/50 text-primary",
                trendIconWrapper: "text-primary",
            },
            secondary: {
                card: "bg-secondary-50",
                iconWrapper: "bg-secondary-100 dark:bg-secondary-100/50 text-secondary",
                trendIconWrapper: "text-secondary",
            },
            success: {
                card: "bg-success-50",
                iconWrapper: "bg-success-100 dark:bg-success-100/50 text-success",
                trendIconWrapper: "text-success",
            },
            warning: {
                card: "bg-warning-50",
                iconWrapper: "bg-warning-100 dark:bg-warning-100/50 text-warning",
                trendIconWrapper: "text-warning",
            },
            danger: {
                card: "bg-danger-50",
                iconWrapper: "bg-danger-100 dark:bg-danger-100/50 text-danger",
                trendIconWrapper: "text-danger",
            },
        },
    },
    defaultVariants: {
        color: "default",
    },
});

type ChartData = {
    month: string;
    value: number;
};

type ChartCardProps = {
    title: string;
    value: number | string;
    change: string;
    index: number;
    xaxis: ChartXAxis;
    chartData: ChartData[];
    icon?: LucideIcon;
} & Omit<CardProps, "children" | "classNames"> &
    VariantProps<typeof chart>;

const ChartCard = React.forwardRef<HTMLDivElement, ChartCardProps>(
    ({ title, value, change, color, icon: Icon, xaxis, chartData, index, className, ...props }, ref) => {
        const classes = React.useMemo(() => chart({ color }), [color]);

        return (
            <Card
                ref={ref}
                className={classes.card({
                    className,
                })}
                {...props}
            >
                <section className="flex flex-nowrap justify-between">
                    <div className="flex flex-col justify-between gap-y-2 p-4">
                        <div className="flex flex-col gap-y-4">
                            <div className="flex items-center gap-x-3">
                                {Icon && (
                                    <div className={classes.iconWrapper()}>
                                        <Icon className="text-inherit" size={16} />
                                    </div>
                                )}
                                <dt className="text-sm font-medium text-default-600">{title}</dt>
                            </div>
                            <dd className="text-3xl font-semibold text-default-700">{value}</dd>
                        </div>
                        <div className={classes.trendIconWrapper()}>
                            {color === "success" ? (
                                <ArrowUpRight size={16} />
                            ) : color === "warning" ? (
                                <ArrowRight size={16} />
                            ) : (
                                <ArrowDownRight size={16} />
                            )}
                            <span>{change}</span>
                            <span className="text-default-500">
                                {" "}
                                vs {xaxis === "day" ? "yesterday" : "last " + xaxis}
                            </span>
                        </div>
                    </div>
                    <div className="mt-10 min-h-24 w-36 min-w-[140px] shrink-0">
                        <ResponsiveContainer className="[&_.recharts-surface]:outline-none" width="100%">
                            <AreaChart accessibilityLayer data={chartData}>
                                <defs>
                                    <linearGradient id={"colorUv" + index} x1="0" x2="0" y1="0" y2="1">
                                        <stop
                                            offset="5%"
                                            stopColor={cn({
                                                "hsl(var(--heroui-foreground))": color === "default",
                                                "hsl(var(--heroui-success))": color === "success",
                                                "hsl(var(--heroui-danger))": color === "danger",
                                                "hsl(var(--heroui-warning))": color === "warning",
                                                "hsl(var(--heroui-secondary))": color === "secondary",
                                                "hsl(var(--heroui-primary))": color === "primary",
                                            })}
                                            stopOpacity={0.2}
                                        />
                                        <stop
                                            offset="10%"
                                            stopColor={cn({
                                                "hsl(var(--heroui-foreground))": color === "default",
                                                "hsl(var(--heroui-success))": color === "success",
                                                "hsl(var(--heroui-danger))": color === "danger",
                                                "hsl(var(--heroui-warning))": color === "warning",
                                                "hsl(var(--heroui-secondary))": color === "secondary",
                                                "hsl(var(--heroui-primary))": color === "primary",
                                            })}
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                </defs>
                                <YAxis domain={[Math.min(...chartData.map((d) => d.value)), "auto"]} hide={true} />
                                <Area
                                    dataKey="value"
                                    fill={`url(#colorUv${index})`}
                                    stroke={cn({
                                        "hsl(var(--heroui-foreground))": color === "default",
                                        "hsl(var(--heroui-success))": color === "success",
                                        "hsl(var(--heroui-danger))": color === "danger",
                                        "hsl(var(--heroui-warning))": color === "warning",
                                        "hsl(var(--heroui-secondary))": color === "secondary",
                                        "hsl(var(--heroui-primary))": color === "primary",
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
        );
    },
);

ChartCard.displayName = "ChartCard";