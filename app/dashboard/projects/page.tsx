import DashboardPageLayout from "@/components/layout/dashboard-page-layout";
import { Suspense } from "react";

const DashboardPage = async () => {
    return (
        <DashboardPageLayout title="Projects" subtitle="Welcome to your projects" actions={<Suspense fallback={<div>Loading...</div>}>
        </Suspense>
        }
        >
            <div>
                <h1>Projects</h1>
            </div>
        </DashboardPageLayout>
    );
};

export default DashboardPage;
