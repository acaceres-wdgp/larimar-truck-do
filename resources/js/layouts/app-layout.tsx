import LtAppLayout from '@/layouts/app/lt-app-layout';
import type { BreadcrumbItem } from '@/types';

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    return <LtAppLayout breadcrumbs={breadcrumbs}>{children}</LtAppLayout>;
}
