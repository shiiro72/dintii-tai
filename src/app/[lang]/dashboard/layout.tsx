import DashboardClientWrapper from '@/components/components/Dashboard/DashboardClientWrapper';

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  return (
    <div className='min-h-screen'>
      <DashboardClientWrapper>{children}</DashboardClientWrapper>
    </div>
  );
}
