"use client";

import DashboardPageLayout from "@/components/layout/dashboard-page-layout";
import { Project } from "../page";
import KPIStat9 from "@/components/charts/kpi_stat_9";
import { kpiStat9, kpiStat8, kpiStat7 } from "@/mock";
import KPIStat8 from "@/components/charts/kpi_stat_8";
import KPIStat7 from "@/components/charts/kpi_stat_7";

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
        </DashboardPageLayout>
    );
}