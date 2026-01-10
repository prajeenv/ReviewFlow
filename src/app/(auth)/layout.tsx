/**
 * Auth layout - minimal layout for authentication pages
 * No sidebar or navigation, just centered content
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="w-full max-w-md px-4">{children}</div>
    </div>
  );
}
