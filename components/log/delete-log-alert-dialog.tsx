import { ConfirmAlertDialog } from "@/components/ui/confirm-alert-dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending: boolean;
};

export function DeleteLogAlertDialog({ open, onOpenChange, onConfirm, isPending }: Props) {
  return (
    <ConfirmAlertDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      isPending={isPending}
      title="この記録を削除しますか？"
      description="削除した記録は元に戻せません。"
    />
  );
}
