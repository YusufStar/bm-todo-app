"use client";

import { Project } from "../page";
import DashboardPageLayout from "@/components/layout/dashboard-page-layout";
import Graph1 from "@/components/charts/graph_1";
import Graph2 from "@/components/charts/graph_2";
import KPIStat9 from "@/components/charts/kpi_stat_9";
import KPIStat8 from "@/components/charts/kpi_stat_8";
import KPIStat7 from "@/components/charts/kpi_stat_7";
import KPIStat6 from "@/components/charts/kpi_stat_6";
import KPIStat5 from "@/components/charts/kpi_stat_5";
import KPIStat4 from "@/components/charts/kpi_stat_4";
import { kpiStat9, kpiStat8, kpiStat7, kpiStat6, kpiStat5, kpiStat4, graph1, graph2 } from "@/mock";

export default function ProjectContent({ project }: { project: Project }) {
    console.log(project);
    
    return (
        <DashboardPageLayout
            title={project.name}
            subtitle={project.description}
        >
            <KPIStat9 data={kpiStat9} />
            <KPIStat8 data={kpiStat8} />
            <KPIStat7 data={kpiStat7} />
            <KPIStat6 data={kpiStat6} />
            <KPIStat5 data={kpiStat5} />
            <KPIStat4 data={kpiStat4} />
            <Graph1 data={graph1} />
            <Graph2 data={graph2} />
        </DashboardPageLayout>
    );
}