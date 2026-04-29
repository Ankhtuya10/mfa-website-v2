// This root layout is intentionally minimal.
// Auth guarding lives in (protected)/layout.tsx so it does NOT
// wrap the /admin/login page — which previously caused an infinite
// redirect loop for users with insufficient roles.
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
