import DashboardPageLayout from "@/components/layout/dashboard-page-layout";
import { Suspense } from "react";
import ProjectsTable from "@/components/projects/projects-table";

const DashboardPage = async () => {
    return (
        <DashboardPageLayout title="Projects" subtitle="Welcome to your projects" 
        >
            <Suspense fallback={<div>Loading...</div>}>
                <ProjectsTable />
            </Suspense>
        </DashboardPageLayout>
    );
};

export default DashboardPage;
