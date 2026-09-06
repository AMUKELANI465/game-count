import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
}

export default function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="gc-card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-earth-500 font-bold">{label}</div>
          <div className="mt-2 text-2xl font-bold text-neutral-950">{value}</div>
        </div>
        {icon && <div className="text-neutral-700">{icon}</div>}
      </div>
    </div>
  );
}
