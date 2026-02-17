import React, { useState } from 'react';

interface SectionCardProps {
  title: string;
  action?: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function SectionCard({ title, action, collapsible, defaultOpen = true, children }: SectionCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="card bg-base-200 shadow-sm overflow-hidden">
      <div className="card-body p-4">
        <div className="flex items-center justify-between">
          <h3
            className={`card-title text-xs font-bold uppercase tracking-wider text-primary ${collapsible ? 'cursor-pointer select-none hover:text-primary/80' : ''}`}
            onClick={collapsible ? () => setOpen(!open) : undefined}
          >
            {collapsible && <span className="mr-1 text-base-content/40">{open ? '▾' : '▸'}</span>}
            {title}
          </h3>
          {action}
        </div>
        {(!collapsible || open) && <div className="mt-3">{children}</div>}
      </div>
    </div>
  );
}
