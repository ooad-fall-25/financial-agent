import { DashboardLayout } from "@/modules/dashboard/ui/layouts/dashboard-layout";

interface Props {
    children: React.ReactNode
}

const Layout = ({ children }: Props) => {
    return (
        <DashboardLayout>
            {children}
        </DashboardLayout>
    )
}

export default Layout; 