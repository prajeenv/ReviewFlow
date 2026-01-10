/**
 * Dashboard layout - placeholder for Prompt 4
 * Will include sidebar navigation and header
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar and header will be added in Prompt 4 */}
      <main className="p-8">{children}</main>
    </div>
  );
}
