"use client";

import React from "react";
import {
    Chip,
    Button,
    Card,
    cn,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Tab,
    Tabs,
    Spacer,
} from "@heroui/react";
import { ArrowUpRight, ArrowDownRight, ArrowRight, MoreVertical } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";

export type Graph2ChartData = {
    month: string;
    value: number;
    lastYearValue: number;
};

export type Graph2Props = {
    key: string;
    title: string;
    value: number;
    suffix: string;
    type: string;
    change: string;
    changeType: "positive" | "negative" | "neutral";
    chartData: Graph2ChartData[];
};

const formatValue = (value: number, type: string | undefined) => {
    if (type === "number") {
        if (value >= 1000000) {
            return (value / 1000000).toFixed(1) + "M";
        } else if (value >= 1000) {
            return (value / 1000).toFixed(0) + "k";
        }

        return value.toLocaleString();
    }
    if (type === "percentage") return `${value}%`;

    return value;
};

const formatMonth = (month: string) => {
    const monthNumber =
        {
            Jan: 0,
            Feb: 1,
            Mar: 2,
            Apr: 3,
            May: 4,
            Jun: 5,
            Jul: 6,
            Aug: 7,
            Sep: 8,
            Oct: 9,
            Nov: 10,
            Dec: 11,
        }[month] ?? 0;

    return new Intl.DateTimeFormat("en-US", { month: "long" }).format(new Date(2024, monthNumber, 1));
};

export default function Graph2({ data }: { data: Graph2Props[] }) {
    const [activeChart, setActiveChart] = React.useState<(typeof data)[number]["key"]>(data[0].key);

    const activeChartData = React.useMemo(() => {
        const chart = data.find((d) => d.key === activeChart);

        return {
            chartData: chart?.chartData ?? [],
            color:
                chart?.changeType === "positive"
                    ? "success"
                    : chart?.changeType === "negative"
                        ? "danger"
                        : "default",
            suffix: chart?.suffix,
            type: chart?.type,
        };
    }, [activeChart]);

    const { chartData, color, suffix, type } = activeChartData;

    return (
        <Card as="dl" className="border border-transparent dark:border-default-100">
            <section className="flex flex-col flex-nowrap">
                <div className="flex flex-col justify-between gap-y-2 p-6">
                    <div className="flex flex-col gap-y-2">
                        <div className="flex flex-col gap-y-0">
                            <dt className="text-medium font-medium text-foreground">Analytics</dt>
                        </div>
                        <Spacer y={2} />
                        <Tabs size="sm">
                            <Tab key="6-months" title="6 Months" />
                            <Tab key="3-months" title="3 Months" />
                            <Tab key="30-days" title="30 Days" />
                            <Tab key="7-days" title="7 Days" />
                            <Tab key="24-hours" title="24 Hours" />
                        </Tabs>
                        <div className="mt-2 flex w-full items-center">
                            <div className="-my-3 flex w-full max-w-[800px] items-center gap-x-3 overflow-x-auto py-3">
                                {data.map(({ key, change, changeType, type, value, title }) => (
                                    <button
                                        key={key}
                                        className={cn(
                                            "flex w-full flex-col gap-2 rounded-medium p-3 transition-colors",
                                            {
                                                "bg-default-100": activeChart === key,
                                            },
                                        )}
                                        onClick={() => setActiveChart(key)}
                                    >
                                        <span
                                            className={cn("text-small font-medium text-default-500 transition-colors", {
                                                "text-primary": activeChart === key,
                                            })}
                                        >
                                            {title}
                                        </span>
                                        <div className="flex items-center gap-x-3">
                                            <span className="text-3xl font-bold text-foreground">
                                                {formatValue(value, type)}
                                            </span>
                                            <Chip
                                                classNames={{
                                                    content: "font-medium",
                                                }}
                                                color={
                                                    changeType === "positive"
                                                        ? "success"
                                                        : changeType === "negative"
                                                            ? "danger"
                                                            : "default"
                                                }
                                                radius="sm"
                                                size="sm"
                                                startContent={
                                                    changeType === "positive" ? (
                                                        <ArrowUpRight size={16} />
                                                    ) : changeType === "negative" ? (
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
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <ResponsiveContainer
                    className="min-h-[300px] [&_.recharts-surface]:outline-none"
                    height="100%"
                    width="100%"
                >
                    <AreaChart
                        accessibilityLayer
                        data={chartData}
                        height={300}
                        margin={{
                            left: 0,
                            right: 0,
                        }}
                        width={500}
                    >
                        <defs>
                            <linearGradient id="colorGradient" x1="0" x2="0" y1="0" y2="1">
                                <stop
                                    offset="10%"
                                    stopColor={`hsl(var(--heroui-${color}-500))`}
                                    stopOpacity={0.3}
                                />
                                <stop
                                    offset="100%"
                                    stopColor={`hsl(var(--heroui-${color}-100))`}
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            horizontalCoordinatesGenerator={() => [200, 150, 100, 50]}
                            stroke="hsl(var(--heroui-default-200))"
                            strokeDasharray="3 3"
                            vertical={false}
                        />
                        <XAxis
                            axisLine={false}
                            dataKey="month"
                            style={{ fontSize: "var(--heroui-font-size-tiny)", transform: "translateX(-40px)" }}
                            tickLine={false}
                        />
                        <Tooltip
                            content={({ label, payload }) => (
                                <div className="flex h-auto min-w-[120px] items-center gap-x-2 rounded-medium bg-foreground p-2 text-tiny shadow-small">
                                    <div className="flex w-full flex-col gap-y-0">
                                        {payload?.map((p, index) => {
                                            const name = p.name;
                                            const value = p.value;

                                            return (
                                                <div key={`${index}-${name}`} className="flex w-full items-center gap-x-2">
                                                    <div className="flex w-full items-center gap-x-1 text-small text-background">
                                                        <span>{formatValue(value as number, type)}</span>
                                                        <span>{suffix}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <span className="text-small font-medium text-foreground-400">
                                            {formatMonth(label)} 25, 2024
                                        </span>
                                    </div>
                                </div>
                            )}
                            cursor={{
                                strokeWidth: 0,
                            }}
                        />
                        <Area
                            activeDot={{
                                stroke: `hsl(var(--heroui-${color === "default" ? "foreground" : color}))`,
                                strokeWidth: 2,
                                fill: "hsl(var(--heroui-background))",
                                r: 5,
                            }}
                            animationDuration={1000}
                            animationEasing="ease"
                            dataKey="value"
                            fill="url(#colorGradient)"
                            stroke={`hsl(var(--heroui-${color === "default" ? "foreground" : color}))`}
                            strokeWidth={2}
                            type="monotone"
                        />
                        <Area
                            activeDot={{
                                stroke: "hsl(var(--heroui-default-400))",
                                strokeWidth: 2,
                                fill: "hsl(var(--heroui-background))",
                                r: 5,
                            }}
                            animationDuration={1000}
                            animationEasing="ease"
                            dataKey="lastYearValue"
                            fill="transparent"
                            stroke="hsl(var(--heroui-default-400))"
                            strokeWidth={2}
                            type="monotone"
                        />
                    </AreaChart>
                </ResponsiveContainer>
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
}
