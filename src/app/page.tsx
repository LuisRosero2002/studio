import { redirect } from 'next/navigation';

export default function RootPage() {
  // In a real app, you might check for an existing session.
  // For this scaffold, we'll always start at the login page.
  redirect('/login');
}
