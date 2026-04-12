import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ActivityItem = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
  createdAt: string;
  actor: {
    id: string;
    fullName: string;
    email: string;
  };
};

type AdminActivityFeedProps = {
  activities: ActivityItem[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getActionBadgeClassName(action: string) {
  if (action.includes("REMOVED") || action.includes("PAUSED")) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

function formatActionLabel(action: string) {
  return action.toLowerCase().replaceAll("_", " ");
}

export function AdminActivityFeed({ activities }: AdminActivityFeedProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent admin activity</CardTitle>
        <CardDescription>
          Every admin write action is captured here with the actor, target, and timestamp.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
            No admin actions have been recorded yet.
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="rounded-lg border p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className={getActionBadgeClassName(activity.action)}>
                        {formatActionLabel(activity.action)}
                      </Badge>
                      <Badge variant="outline">{activity.entityType}</Badge>
                    </div>
                    <p className="font-medium">{activity.summary}</p>
                    <p className="text-sm text-muted-foreground">
                      By {activity.actor.fullName} ({activity.actor.email})
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(activity.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
