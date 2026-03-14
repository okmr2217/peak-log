import { getActivitiesWithStatsForCurrentUser } from "@/server/queries/activity";
import { ActivityList } from "@/components/activity/activity-list";

export default async function ActivitiesPage() {
  const activities = await getActivitiesWithStatsForCurrentUser();
  return <ActivityList activities={activities} />;
}
