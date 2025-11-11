import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserNav } from './user-nav';
import { WigaLogo } from '../wiga-logo';

export function AppHeader({ children }: { children?: React.ReactNode }) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-4 md:hidden">
        <SidebarTrigger />
        <WigaLogo />
      </div>
       <div className="flex items-center gap-4">
        {children}
        <UserNav />
      </div>
    </header>
  );
}
