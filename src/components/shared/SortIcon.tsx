import React from 'react';
import { ArrowDownUp, SortUpAlt, SortDownAlt } from 'react-bootstrap-icons';

interface SortIconProps {
  active: boolean;
  ascending: boolean;
}

export function SortIcon({ active, ascending }: SortIconProps) {
  const icon = !active
    ? <ArrowDownUp className="w-3 h-3 opacity-30" />
    : ascending
      ? <SortUpAlt className="w-3 h-3" />
      : <SortDownAlt className="w-3 h-3" />;

  return (
    <span className="inline-flex items-center ml-2 h-[1em] align-text-bottom">
      {icon}
    </span>
  );
}
