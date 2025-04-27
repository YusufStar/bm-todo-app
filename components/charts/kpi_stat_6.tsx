"use client";

import React from "react";
import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";
import { ArrowUpRight, ArrowDownRight, ArrowRight } from "lucide-react";
import { cn } from "@heroui/react";

export type KPIStat6Props = {
    title: string;
    value: number;
    chartData: {
        month: string;
        value: number;
    }[];
    change: string;
    changeType: string;
    xaxis: string;
} | {
    title: string;
    value: string;
    chartData: {
        month: string;
        value: number;
    }[];
    change: string;
    changeType: string;
    xaxis: string;
}
export default function KPIStat6({ data }: { data: KPIStat6Props[] }) {
    return (
        <dl className="grid w-full grid-cols-1 gap-5 divide-y divide-default-200 rounded-medium border border-transparent bg-content1 p-2 shadow-small dark:border-default-100 sm:grid-cols-2 sm:divide-y-0 md:grid-cols-3 md:divide-x">
            {data.map(({ title, value, change, changeType, xaxis, chartData }, index) => (
                <div key={index} className="max-h-[140px]">
                    <section className={"flex flex-wrap justify-between"}>
                        <div className="flex flex-col justify-between gap-y-2 p-4">
                            <div>
                                <div className="text-sm font-medium text-default-600">{title}</div>
                                <div className="mt-4">
                                    <span className="text-3xl font-semibold text-default-700">{value}</span>
                                </div>
                            </div>
                            <div
                                className={cn("mt-2 flex items-center gap-x-1 text-xs font-medium", {
                                    "text-success-500": changeType === "positive",
                                    "text-warning-500": changeType === "neutral",
                                    "text-danger-500": changeType === "negative",
                                })}
                            >
                                {changeType === "positive" ? (
                                    <ArrowUpRight size={16} />
                                ) : changeType === "neutral" ? (
                                    <ArrowRight size={16} />
                                ) : (
                                    <ArrowDownRight size={16} />
                                )}
                                <span>{change}</span>
                                <span className="text-default-400 dark:text-default-500">
                                    {" "}
                                    vs {xaxis === "day" ? "yesterday" : "last " + xaxis}
                                </span>
                            </div>
                        </div>

                        <div className="mt-10 hidden min-h-24 w-36 shrink-0 lg:block">
                            <ResponsiveContainer className="[&_.recharts-surface]:outline-none" width="100%">
                                <AreaChart accessibilityLayer data={chartData}>
                                    <defs>
                                        <linearGradient id={"colorUv" + index} x1="0" x2="0" y1="0" y2="1">
                                            <stop
                                                offset="5%"
                                                stopColor={cn({
                                                    "hsl(var(--heroui-success))": changeType === "positive",
                                                    "hsl(var(--heroui-danger))": changeType === "negative",
                                                    "hsl(var(--heroui-warning))": changeType === "neutral",
                                                })}
                                                stopOpacity={0.2}
                                            />
                                            <stop
                                                offset="60%"
                                                stopColor={cn({
                                                    "hsl(var(--heroui-success))": changeType === "positive",
                                                    "hsl(var(--heroui-danger))": changeType === "negative",
                                                    "hsl(var(--heroui-warning))": changeType === "neutral",
                                                })}
                                                stopOpacity={0}
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
                                            "hsl(var(--heroui-success))": changeType === "positive",
                                            "hsl(var(--heroui-danger))": changeType === "negative",
                                            "hsl(var(--heroui-warning))": changeType === "neutral",
                                        })}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </section>
                </div>
            ))}
        </dl>
    );
}
