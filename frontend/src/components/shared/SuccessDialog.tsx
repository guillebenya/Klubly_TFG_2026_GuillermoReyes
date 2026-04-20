import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { CheckCircle2 } from 'lucide-react';

interface SuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
}

const SuccessDialog = ({ isOpen, onClose, title, description }: SuccessDialogProps) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
    <div className="flex flex-col items-center text-center">
      <div className="p-4 rounded-full mb-4 bg-emerald-50">
        <CheckCircle2 className="text-emerald-600" size={28} />
      </div>
      <p className="text-gray-600 mb-8 leading-relaxed">{description}</p>
      <Button variant="primary" onClick={onClose} className="w-full">
        Continuar
      </Button>
    </div>
  </Modal>
);

export default SuccessDialog;