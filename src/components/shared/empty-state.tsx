import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-[32px] border border-lilac-400 px-6 py-16 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-lilac-100 text-lilac-900">
        <Icon aria-hidden className="size-8" strokeWidth={1.5} />
      </span>
      <h2 className="text-h3 font-extrabold">{title}</h2>
      {description && <p className="max-w-md text-body1 text-black-400">{description}</p>}
      {action}
    </div>
  );
}
