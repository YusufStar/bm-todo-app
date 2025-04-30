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
import Circles4 from "@/components/charts/circles_4";
import Bars1 from "@/components/charts/bars_1";
import Bars2 from "@/components/charts/bars_2";
import Bars3 from "@/components/charts/bars_3";
import Bars4 from "@/components/charts/bars_4";
import Circles1 from "@/components/charts/circles_1";
import Circles2 from "@/components/charts/circles_2";
import { kpiStat9, kpiStat8, kpiStat7, kpiStat6, kpiStat5, kpiStat4, graph1, graph2, circles4, bars1, bars2, bars3, bars4, circles1, circles2 } from "@/mock";

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
            <Circles1 data={circles1} />
            <Circles2 data={circles2} />
            <Circles4 data={circles4} />
            <Bars1 data={bars1} />
            <Bars2 data={bars2} />
            <Bars3 data={bars3} />
            <Bars4 data={bars4} />
        </DashboardPageLayout>
    );
}