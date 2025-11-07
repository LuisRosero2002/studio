import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserNav } from './user-nav';
import { WigaLogo } from '../wiga-logo';

export function AppHeader() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-4 md:justify-end md:px-6">
      <div className="md:hidden">
        <WigaLogo />
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden md:block">
          {/* Future search bar or actions can go here */}
        </div>
        <UserNav />
        <SidebarTrigger className="md:hidden" />
      </div>
    </header>
  );
}
