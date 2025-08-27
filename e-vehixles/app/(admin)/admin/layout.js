// app/admin/layout.tsx

import { getAdmin } from '@/action/admin';
import Navbar from '@/components/Narbar';
import { notFound } from 'next/navigation';
import React from 'react';
import { Sidebar } from './_component/Sidebar';

const AdminLayout = async ({ children }) => {
  const admin = await getAdmin();

  if (!admin.authorized) {
    return notFound();
  }

  return (
    <div>
      <Navbar isAdminPage={true} />
      <div className="flex h-full w-56 flex-col top-20 fixed inset-y-0 z-50">
        <Sidebar />
      </div>
      <main className="md:pl-56 pt-[80px] h-full">{children}</main>
    </div>
  );
};

export default AdminLayout;
