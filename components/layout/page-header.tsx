interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="pt-4 pb-3">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-medium text-zinc-300">{title}</h1>
        {action && <div>{action}</div>}
      </div>
      {description && <p className="text-xs text-zinc-600 mt-1.5">{description}</p>}
    </div>
  );
}
