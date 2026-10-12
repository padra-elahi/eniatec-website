import { AdminShell } from '@/components/admin/AdminShell';
import { requireAdminPage } from '@/lib/auth';
import { unreadCount } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage();
  return <AdminShell unread={unreadCount()}>{children}</AdminShell>;
}
