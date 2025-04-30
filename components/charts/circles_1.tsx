"use client";

import type { ButtonProps, CardProps } from "@heroui/react";

import React from "react";
import { ResponsiveContainer, PieChart, Pie, Tooltip, Cell, Label } from "recharts";
import {
    Card,
    Button,
    Select,
    SelectItem,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    cn,
} from "@heroui/react";
import { MoreVertical, ArrowUp, ArrowRight, ArrowDown } from "lucide-react";

type Circles1Data = {
    name: string;
    [key: string]: string | number;
};

export type Circles1Props = {
    title: string;
    value: string;
    changeType?: "positive" | "neutral" | "negative";
    changePercentage?: number;
    unit?: string;
    color: ButtonProps["color"];
    categories: string[];
    chartData: Circles1Data[];
};

export default function Circles1({
    data,
}: {
    data: Circles1Props[];
}) {
    return (
        <dl className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
            {data.map((item, index) => (
                <CircleChartCard key={index} {...item} />
            ))}
        </dl>
    );
}

const formatValue = (value: number | undefined) => {
    if (!value) return "";

    return value.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
    });
};

const CircleChartCard = React.forwardRef<
    HTMLDivElement,
    Omit<CardProps, "children"> & Circles1Props
>(
    (
        {
            className,
            title,
            value,
            unit,
            categories,
            changePercentage,
            color,
            chartData,
            changeType,
            ...props
        },
        ref,
    ) => {
        return (
            <Card
                ref={ref}
                className={cn("min-h-[340px] border border-transparent dark:border-default-100", className)}
                {...props}
            >
                <div className="flex flex-col gap-y-2 p-4 pb-0">
                    <div className="flex items-center justify-between gap-x-2">
                        <dt>
                            <h3 className="text-small font-medium text-default-500">{title}</h3>
                        </dt>
                        <div className="flex items-center justify-end gap-x-2">
                            <Select
                                aria-label="Time Range"
                                classNames={{
                                    trigger: "min-w-[100px] min-h-7 h-7",
                                    value: "text-tiny !text-default-500",
                                    selectorIcon: "text-default-500",
                                    popoverContent: "min-w-[120px]",
                                }}
                                defaultSelectedKeys={["per-day"]}
                                listboxProps={{
                                    itemClasses: {
                                        title: "text-tiny",
                                    },
                                }}
                                placeholder="Per Day"
                                size="sm"
                            >
                                <SelectItem key="per-day">Per Day</SelectItem>
                                <SelectItem key="per-week">Per Week</SelectItem>
                                <SelectItem key="per-month">Per Month</SelectItem>
                            </Select>
                            <Dropdown
                                classNames={{
                                    content: "min-w-[120px]",
                                }}
                                placement="bottom-end"
                            >
                                <DropdownTrigger>
                                    <Button isIconOnly radius="full" size="sm" variant="light">
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
                        </div>
                    </div>
                    <dd className="flex items-baseline gap-x-1">
                        <span className="text-3xl font-semibold text-default-900">{value}</span>
                        <span className="text-medium font-medium text-default-500">{unit}</span>
                    </dd>
                </div>
                <ResponsiveContainer
                    className="[&_.recharts-surface]:outline-none"
                    height={200}
                    width="100%"
                >
                    <PieChart accessibilityLayer margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <Tooltip
                            content={({ label, payload }) => (
                                <div className="flex h-8 min-w-[120px] items-center gap-x-2 rounded-medium bg-background px-1 text-tiny shadow-small">
                                    <span className="font-medium text-foreground">{label}</span>
                                    {payload?.map((p, index) => {
                                        const name = p.name;
                                        const value = p.value;
                                        const category = categories.find((c: string) => c.toLowerCase() === name) ?? name;

                                        return (
                                            <div key={`${index}-${name}`} className="flex w-full items-center gap-x-2">
                                                <div
                                                    className="h-2 w-2 flex-none rounded-full"
                                                    style={{
                                                        backgroundColor: `hsl(var(--heroui-${color}-${(index + 1) * 200}))`,
                                                    }}
                                                />
                                                <div className="flex w-full items-center justify-between gap-x-2 pr-1 text-xs text-default-700">
                                                    <span className="text-default-500">{category}</span>
                                                    <span className="font-mono font-medium text-default-700">
                                                        {formatValue(value as number)}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            cursor={false}
                        />
                        <Pie
                            animationDuration={1000}
                            animationEasing="ease"
                            cornerRadius={12}
                            data={chartData}
                            dataKey="value"
                            innerRadius="68%"
                            nameKey="name"
                            paddingAngle={-20}
                            strokeWidth={0}
                        >
                            {chartData.map((_, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={`hsl(var(--heroui-${color}-${(index + 1) * 200}))`}
                                />
                            ))}
                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                        const IconComponent = 
                                            changeType === "positive" ? ArrowUp :
                                            changeType === "negative" ? ArrowDown : 
                                            ArrowRight;
                                            
                                        return (
                                            <>
                                                <foreignObject 
                                                    width={20} 
                                                    height={20} 
                                                    x={viewBox.cx! - 45} 
                                                    y={viewBox.cy! - 10}
                                                    className="text-default-400"
                                                >
                                                    <IconComponent size={16} 
                                                        strokeWidth={2}
                                                    />
                                                </foreignObject>
                                                <text
                                                    dominantBaseline="central"
                                                    textAnchor="middle"
                                                    x={viewBox.cx! + 10}
                                                    y={viewBox.cy!}
                                                >
                                                    <tspan
                                                        dy={
                                                            changeType === "positive" ? -1.5 : changeType === "negative" ? 1.5 : 0
                                                        }
                                                        fill="hsl(var(--heroui-default-700))"
                                                        fontSize={20}
                                                        fontWeight={600}
                                                    >
                                                        {changePercentage}%
                                                    </tspan>
                                                </text>
                                            </>
                                        );
                                    }

                                    return null;
                                }}
                                position="center"
                            />
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>

                <div className="flex w-full flex-wrap justify-center gap-4 px-4 pb-4 text-tiny text-default-500">
                    {categories.map((category: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                            <span
                                className="h-2 w-2 rounded-full"
                                style={{
                                    backgroundColor: `hsl(var(--heroui-${color}-${(index + 1) * 200}))`,
                                }}
                            />
                            <span className="capitalize">{category}</span>
                        </div>
                    ))}
                </div>
            </Card>
        );
    },
);

CircleChartCard.displayName = "CircleChartCard";
