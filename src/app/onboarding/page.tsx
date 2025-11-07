import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { OnboardingForm } from '@/components/auth/onboarding-form';
import { WigaLogo } from '@/components/wiga-logo';

export default function OnboardingPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <WigaLogo />
          </div>
          <CardTitle className="text-2xl">¡Bienvenido a Wiga Sales Hub!</CardTitle>
          <CardDescription>Vamos a configurar tu perfil para que puedas empezar.</CardDescription>
        </CardHeader>
        <CardContent>
          <OnboardingForm />
        </CardContent>
      </Card>
    </main>
  );
}
