interface PageHeaderProps {
  title: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 mb-5">
      <h1 className="text-base font-medium text-zinc-300">{title}</h1>
      {action && <div>{action}</div>}
    </div>
  );
}
