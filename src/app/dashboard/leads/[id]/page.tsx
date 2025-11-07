import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { leads, users, activities } from "@/lib/data"
import { notFound } from "next/navigation"
import { LeadActivityTimeline } from "@/components/leads/lead-activity-timeline"
import { NextActionSuggestions } from "@/components/leads/next-action-suggestions"
import { format } from "date-fns"

export default function LeadDetailPage({ params }: { params: { id: string } }) {
  const lead = leads.find(l => l.id === params.id)
  if (!lead) {
    notFound()
  }

  const assignedUser = users.find(u => u.id === lead.assignedToId)
  const leadActivities = activities.filter(a => a.leadId === lead.id)

  return (
    <div className="grid gap-6">
      <div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/leads">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Leads
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{lead.contactName}</CardTitle>
              <CardDescription>{lead.companyName}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{lead.contactEmail}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{lead.contactPhone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p><Badge variant="secondary">{lead.status}</Badge></p>
                </div>
                <div>
                  <p className="text-muted-foreground">Source</p>
                  <p className="font-medium">{lead.source}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Assigned To</p>
                  <p className="font-medium">{assignedUser?.name ?? 'Unassigned'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last Contacted</p>
                  <p className="font-medium">{format(new Date(lead.lastContacted), 'MMM d, yyyy')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Purchase Probability</p>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{Math.round(lead.purchaseProbability * 100)}%</p>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div className="bg-primary h-2.5 rounded-full" style={{ width: `${lead.purchaseProbability * 100}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <LeadActivityTimeline activities={leadActivities} />
        </div>

        <div className="lg:col-span-1">
          <NextActionSuggestions leadId={lead.id} activities={leadActivities} />
        </div>
      </div>
    </div>
  )
}
