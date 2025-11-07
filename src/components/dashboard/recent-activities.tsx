import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { activities, users, leads } from "@/lib/data"
import { getUserById } from "@/lib/data"

export function RecentActivities() {
  // Get last 5 activities
  const recentActivities = activities.slice(-5).reverse();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          A log of the most recent interactions with leads.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {recentActivities.map((activity) => {
            const user = getUserById(activity.userId);
            const lead = leads.find(l => l.id === activity.leadId);
            if (!user || !lead) return null;
            return (
              <div key={activity.id} className="flex items-start gap-4">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.avatarUrl} alt="Avatar" />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    {user.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Logged a {activity.type.toLowerCase()} with <span className="font-semibold text-foreground">{lead.contactName}</span> from <span className="font-semibold text-foreground">{lead.companyName}</span>.
                  </p>
                  <p className="text-sm text-muted-foreground italic mt-1">"{activity.notes}"</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
