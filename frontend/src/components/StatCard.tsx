import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
}

export default function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-earth-200 p-5 flex items-center justify-between shadow-sm">
      <div>
        <div className="text-xs uppercase tracking-wide text-forest-500 font-semibold">{label}</div>
        <div className="text-2xl font-bold text-forest-800 mt-1">{value}</div>
      </div>
      {icon && <div className="text-forest-400">{icon}</div>}
    </div>
  );
}
