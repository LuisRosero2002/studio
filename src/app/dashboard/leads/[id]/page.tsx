'use client';
import Link from "next/link"
import { ChevronLeft, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { notFound, useParams } from "next/navigation"
import { LeadActivityTimeline } from "@/components/leads/lead-activity-timeline"
import { NextActionSuggestions } from "@/components/leads/next-action-suggestions"
import { format } from "date-fns"
import { es } from 'date-fns/locale'
import { useFirebase, useDoc, useMemoFirebase, useCollection } from "@/firebase"
import { collection, doc } from "firebase/firestore"
import { Lead, User, Activity } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"

export default function LeadDetailPage() {
  const params = useParams();
  const leadId = params.id as string;
  const { firestore, user, isUserLoading } = useFirebase();

  const leadDocRef = useMemoFirebase(() => {
    if (!user || !leadId) return null;
    return doc(firestore, 'users', user.uid, 'leads', leadId);
  }, [firestore, user, leadId]);

  const assignedUserDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const activitiesCollectionRef = useMemoFirebase(() => {
    if (!user || !leadId) return null;
    return collection(firestore, 'users', user.uid, 'leads', leadId, 'activities');
  }, [firestore, user, leadId]);

  const { data: lead, isLoading: isLeadLoading } = useDoc<Lead>(leadDocRef);
  const { data: assignedUser, isLoading: isUserLoadingProfile } = useDoc<User>(assignedUserDocRef);
  const { data: leadActivities, isLoading: areActivitiesLoading } = useCollection<Activity>(activitiesCollectionRef);

  const isLoading = isUserLoading || isLeadLoading || isUserLoadingProfile || areActivitiesLoading;
  
  if (!isLoading && !lead) {
    return notFound();
  }

  if (isLoading) {
    return (
        <div className="grid gap-6">
            <div>
                <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/leads">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Volver a Prospectos
                </Link>
                </Button>
            </div>
             <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-8 w-1/2" />
                            <Skeleton className="h-4 w-1/3" />
                        </CardHeader>
                        <CardContent>
                             <div className="grid grid-cols-2 gap-4 text-sm">
                                {Array.from({length: 7}).map((_, i) => (
                                    <div key={i} className="space-y-1">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-5 w-3/4" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-1/2" />
                            <Skeleton className="h-4 w-3/4" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-40 w-full" />
                        </CardContent>
                    </Card>
                </div>
                 <div className="lg:col-span-1">
                    <Card>
                         <CardHeader>
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                 </div>
            </div>
        </div>
    )
  }

  return (
    <div className="grid gap-6">
      <div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/leads">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Volver a Prospectos
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{lead!.contactName}</CardTitle>
              <CardDescription>{lead!.companyName}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Correo Electrónico</p>
                  <p className="font-medium">{lead!.contactEmail}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Teléfono</p>
                  <p className="font-medium">{lead!.contactPhone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Estado</p>
                  <p><Badge variant="secondary">{lead!.status}</Badge></p>
                </div>
                <div>
                  <p className="text-muted-foreground">Fuente</p>
                  <p className="font-medium">{lead!.source}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Asignado a</p>
                  <p className="font-medium">{assignedUser?.name ?? 'Sin asignar'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Último Contacto</p>
                  <p className="font-medium">{format(new Date(lead!.lastContacted), 'd MMM, yyyy', { locale: es })}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Probabilidad de Compra</p>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{Math.round(lead!.purchaseProbability * 100)}%</p>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div className="bg-primary h-2.5 rounded-full" style={{ width: `${lead!.purchaseProbability * 100}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <LeadActivityTimeline activities={leadActivities ?? []} />
        </div>

        <div className="lg:col-span-1">
          <NextActionSuggestions leadId={lead!.id} activities={leadActivities ?? []} />
        </div>
      </div>
    </div>
  )
}
