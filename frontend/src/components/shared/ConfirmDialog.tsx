import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle, Info } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  type?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirmar",
  type = 'danger',
  isLoading = false
}: ConfirmDialogProps) => {
  
  const config = {
    danger: { variant: 'danger' as const, icon: <AlertTriangle className="text-red-600" size={28} />, bg: 'bg-red-50' },
    warning: { variant: 'primary' as const, icon: <AlertTriangle className="text-amber-600" size={28} />, bg: 'bg-amber-50' },
    info: { variant: 'primary' as const, icon: <Info className="text-blue-600" size={28} />, bg: 'bg-blue-50' },
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center text-center">
        <div className={`p-4 rounded-full mb-4 ${config[type].bg}`}>
          {config[type].icon}
        </div>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          {description}
        </p>

        <div className="flex gap-3 w-full">
          <Button variant="secondary" onClick={onClose} className="flex-1" disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            variant={config[type].variant}
            onClick={onConfirm}
            isLoading={isLoading}
            className="flex-1"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;