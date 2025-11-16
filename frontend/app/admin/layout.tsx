'use client';

import AdminNav from '@/components/admin/AdminNav';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-neutral-50">
      <AdminNav />
      <main className="ml-56 flex-1">
        {children}
      </main>
    </div>
  );
}

