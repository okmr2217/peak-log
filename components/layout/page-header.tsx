interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="pb-8">
      <div className="flex items-center justify-between h-8">
        <h1 className="text-base font-medium text-foreground">{title}</h1>
        {action && <div>{action}</div>}
      </div>
      {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
    </div>
  );
}
