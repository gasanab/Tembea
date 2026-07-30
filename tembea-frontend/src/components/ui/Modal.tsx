"use client";

import { X } from "lucide-react";
import { Button } from "./Button";

type ModalProps = {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
};

export function Modal({ open, title, children, onClose }: ModalProps) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={title}>
      <div className="modal-panel stack-md">
        <div className="between">
          <h3 className="text-2xl font-black">{title}</h3>
          <Button variant="ghost" aria-label="Close modal" onClick={onClose} icon={<X size={18} />}>
            Close
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
