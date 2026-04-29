import Image from "next/image";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="pb-4 flex items-center gap-3">
      <Image src="/icon-192.png" alt="Peak Log" width={48} height={48} className="rounded-xl" />
      <div className="flex-1">
        <h1 className="text-sm font-bold text-foreground">{title}</h1>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
