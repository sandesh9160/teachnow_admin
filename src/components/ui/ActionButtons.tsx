"use client";

import React from "react";
import { Pencil, Trash2, Eye, EyeOff, MoreHorizontal } from "lucide-react";
import { clsx } from "clsx";

interface ActionButtonsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onToggle?: () => void;
  isVisible?: boolean;
  onView?: () => void;
  compact?: boolean;
}

export default function ActionButtons({
  onView,
}: ActionButtonsProps) {
  return (
    <div className="flex items-center justify-end gap-2 text-surface-400">
      {onView && (
        <button
          onClick={onView}
          className="p-1.5 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          title="View Details"
        >
          <Eye size={18} />
        </button>
      )}
    </div>
  );
}
