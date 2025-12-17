'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Activity, ActivityType, User } from "@/lib/types"
import { Mail, Phone, Briefcase, Users } from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import { es } from 'date-fns/locale'
import { useEffect, useState } from "react";
import { useFirebase } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";

const activityIcons: Record<ActivityType, React.ElementType> = {
  Email: Mail,
  Llamada: Phone,
  Reunión: Users,
  Visita: Briefcase,
}

type ActivityWithUser = Activity & { user?: User };

export function LeadActivityTimeline({ activities }: { activities: Activity[] }) {
  const sortedActivities = [...activities].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const [enrichedActivities, setEnrichedActivities] = useState<ActivityWithUser[]>([]);
  const { firestore } = useFirebase();

  useEffect(() => {
    const fetchUsers = async () => {
      if (!firestore || !sortedActivities.length) {
        setEnrichedActivities(sortedActivities);
        return;
      }

      const activitiesWithUsers: ActivityWithUser[] = await Promise.all(
        sortedActivities.map(async (activity) => {
          if (activity.userId) {
            const userDocRef = doc(firestore, 'users', activity.userId);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              return { ...activity, user: { id: userDoc.id, ...userDoc.data() } as User };
            }
          }
          return activity;
        })
      );
      setEnrichedActivities(activitiesWithUsers);
    };

    fetchUsers();
  }, [activities, firestore]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Línea de Tiempo de Actividad</CardTitle>
        <CardDescription>Un registro de todas las interacciones con este prospecto.</CardDescription>
      </CardHeader>
      <CardContent>
        {enrichedActivities.length > 0 ? (
          <div className="relative space-y-8 pl-6 before:absolute before:inset-y-0 before:w-px before:bg-border before:left-0">
            {enrichedActivities.map((activity) => {
              const Icon = activityIcons[activity.type as ActivityType] || Briefcase
              return (
                <div key={activity.id} className="relative flex items-start">
                  <span className="absolute left-0 top-1.5 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="ml-6 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">
                        {activity.type} con {activity.user?.name ?? 'Usuario desconocido'}
                      </div>
                      <div className="text-xs text-muted-foreground" title={format(new Date(activity.date), 'PPP p', { locale: es })}>
                        {formatDistanceToNow(new Date(activity.date), { addSuffix: true, locale: es })}
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{activity.notes}</p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Aún no se han registrado actividades para este prospecto.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
