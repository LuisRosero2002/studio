import { PageHeader } from '@/components/shared/page-header';
import { UsersTable } from '@/components/users/users-table';

export default function UsersPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Gestión de Usuarios"
        description="Administra los usuarios y roles de tu equipo."
      />
      <UsersTable />
    </div>
  );
}
