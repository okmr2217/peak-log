import { notFound } from "next/navigation";
import { getActivityDetailForCurrentUser } from "@/server/queries/activity";
import { ActivityDetailView } from "@/components/activity/activity-detail";

interface Props {
  params: Promise<{ activityId: string }>;
}

export default async function ActivityDetailPage({ params }: Props) {
  const { activityId } = await params;
  const detail = await getActivityDetailForCurrentUser(activityId);

  if (!detail) notFound();

  return <ActivityDetailView detail={detail} />;
}
