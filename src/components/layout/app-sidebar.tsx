'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { WigaLogo } from '@/components/wiga-logo';
import { LayoutDashboard, Users, FileText, Settings, LogOut } from 'lucide-react';
import { UserNav } from './user-nav';

const menuItems = [
  { href: '/dashboard', label: 'Panel', icon: LayoutDashboard },
  { href: '/dashboard/leads', label: 'Prospectos', icon: Users },
  { href: '/dashboard/quotes', label: 'Cotizaciones', icon: FileText },
];

export function AppSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <Sidebar className="hidden md:flex">
      <div className="flex h-full flex-col">
        <SidebarHeader className="border-b">
            <WigaLogo />
        </SidebarHeader>
        <SidebarContent className="flex-1">
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} asChild>
                  <SidebarMenuButton
                    isActive={isActive(item.href)}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="#" asChild>
                <SidebarMenuButton tooltip="Configuración">
                  <Settings />
                  <span>Configuración</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <Link href="/login" asChild>
                  <SidebarMenuButton tooltip="Cerrar Sesión">
                    <LogOut />
                    <span>Cerrar Sesión</span>
                  </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}
