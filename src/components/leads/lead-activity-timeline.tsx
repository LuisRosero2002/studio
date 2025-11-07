import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getUserById } from "@/lib/data"
import { Activity, ActivityType } from "@/lib/types"
import { Mail, Phone, Briefcase, Users } from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"

const activityIcons: Record<ActivityType, React.ElementType> = {
  Email: Mail,
  Call: Phone,
  Meeting: Users,
  Visit: Briefcase,
}

export function LeadActivityTimeline({ activities }: { activities: Activity[] }) {
  const sortedActivities = [...activities].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Timeline</CardTitle>
        <CardDescription>A log of all interactions with this lead.</CardDescription>
      </CardHeader>
      <CardContent>
        {sortedActivities.length > 0 ? (
          <div className="relative space-y-8 pl-6 before:absolute before:inset-y-0 before:w-px before:bg-border before:left-0">
            {sortedActivities.map((activity, index) => {
              const user = getUserById(activity.userId)
              const Icon = activityIcons[activity.type]
              return (
                <div key={activity.id} className="relative flex items-start">
                  <span className="absolute left-0 top-1.5 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="ml-6 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">
                        {activity.type} with {user?.name}
                      </div>
                      <div className="text-xs text-muted-foreground" title={format(new Date(activity.date), 'PPP p')}>
                        {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
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
            <p className="text-muted-foreground">No activities logged for this lead yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
