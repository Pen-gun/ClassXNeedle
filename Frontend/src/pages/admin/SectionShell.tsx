import type { ReactNode } from 'react';

const SectionShell = ({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-display">{title}</h1>
      {subtitle && <p className="text-stone-400 mt-1">{subtitle}</p>}
    </div>
    {children}
  </div>
);

export default SectionShell;
