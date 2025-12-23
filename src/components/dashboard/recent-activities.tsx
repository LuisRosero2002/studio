'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import { collection, query, orderBy, limit, getDocs, doc, getDoc } from "firebase/firestore"
import { useFirebase } from "@/firebase"
import { useEffect, useState } from "react"
import { Activity, Lead, User, WithId } from "@/lib/types"
import { Skeleton } from "../ui/skeleton"
import { FirestorePermissionError } from "@/firebase/errors";
import { errorEmitter } from "@/firebase/error-emitter";

function getActivityText(type: string) {
    switch (type) {
        case 'Email': return 'un correo';
        case 'Llamada': return 'una llamada';
        case 'Reunión': return 'una reunión';
        case 'Visita': return 'una visita';
        default: return type.toLowerCase();
    }
}

type EnrichedActivity = WithId<Activity> & {
    lead?: WithId<Lead>;
    user?: WithId<User>;
}

export function RecentActivities() {
  const { firestore } = useFirebase();
  const [activities, setActivities] = useState<EnrichedActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!firestore) return;

    const fetchRecentActivities = async () => {
        setIsLoading(true);
        try {
            const activitiesRef = collection(firestore, 'activities');
            const activitiesQuery = query(activitiesRef, orderBy('date', 'desc'), limit(5));
            const activitiesSnap = await getDocs(activitiesQuery);

            const enrichedActivities = await Promise.all(activitiesSnap.docs.map(async (activityDoc) => {
              const activityData = { id: activityDoc.id, ...activityDoc.data() } as Activity;
              let lead: WithId<Lead> | undefined;
              let user: WithId<User> | undefined;

              if (activityData.leadId) {
                const leadRef = doc(firestore, 'leads', activityData.leadId);
                const leadSnap = await getDoc(leadRef);
                if (leadSnap.exists()) {
                  lead = { id: leadSnap.id, ...leadSnap.data() } as WithId<Lead>;
                }
              }

              if (activityData.userId) {
                const userRef = doc(firestore, 'users', activityData.userId);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                  user = { id: userSnap.id, ...userSnap.data() } as WithId<User>;
                }
              }

              return { ...activityData, lead, user };
            }));
            
            setActivities(enrichedActivities);

        } catch (error) {
            console.error("Error fetching recent activities:", error);
            const contextualError = new FirestorePermissionError({
              operation: 'list',
              path: `activities`,
            });
            errorEmitter.emit('permission-error', contextualError);
        } finally {
            setIsLoading(false);
        }
    };

    fetchRecentActivities();

  }, [firestore]);


  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad Reciente</CardTitle>
        <CardDescription>
          Un registro de las interacciones más recientes con los prospectos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {isLoading && Array.from({length: 3}).map((_, i) => (
             <div key={i} className="flex items-start gap-4">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="grid gap-1 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-full max-w-lg" />
                  <Skeleton className="h-4 w-full max-w-md mt-1" />
                </div>
              </div>
          ))}
          {!isLoading && activities.map((activity) => {
            const activityUser = activity.user;
            const lead = activity.lead;
            if (!activityUser || !lead) return null;
            return (
              <div key={activity.id} className="flex items-start gap-4">
                <Avatar className="h-9 w-9">
                  <AvatarFallback>{activityUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    {activityUser.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Registró {getActivityText(activity.type)} con <span className="font-semibold text-foreground">{lead.contactName}</span> de <span className="font-semibold text-foreground">{lead.companyName}</span>.
                  </p>
                  <p className="text-sm text-muted-foreground italic mt-1">"{activity.notes}"</p>
                </div>
              </div>
            )
          })}
          {!isLoading && activities.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
                No hay actividad reciente.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
