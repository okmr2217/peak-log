import { notFound } from "next/navigation";
import { getActivityForEdit } from "@/server/queries/activity";
import { ActivityEditView } from "@/components/activity/activity-edit-view";

interface Props {
  params: Promise<{ activityId: string }>;
}

export default async function ActivityEditPage({ params }: Props) {
  const { activityId } = await params;
  const activity = await getActivityForEdit(activityId);

  if (!activity) notFound();

  return <ActivityEditView activity={activity} />;
}
