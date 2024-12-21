import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogPortal
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FaCheckCircle, FaExclamationCircle, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface NotificationProps {
  show: boolean;
  type: AlertType;
  message: string;
  onClose: () => void;
}

interface ConfirmationProps {
  show: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const Notification: React.FC<NotificationProps> = ({
  show,
  type,
  message,
  onClose,
}) => {
  if (!show) return null;

  React.useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  const getIcon = () => {
    const iconProps = { className: 'w-5 h-5' };
    switch (type) {
      case 'success':
        return <FaCheckCircle {...iconProps} className="text-green-500" />;
      case 'error':
        return <FaExclamationCircle {...iconProps} className="text-red-500" />;
      case 'warning':
        return <FaExclamationTriangle {...iconProps} className="text-yellow-500" />;
      case 'info':
        return <FaInfoCircle {...iconProps} className="text-blue-500" />;
    }
  };

  const getVariant = () => {
    switch (type) {
      case 'success':
        return 'success';
      case 'error':
        return 'destructive';
      case 'warning':
        return 'warning';
      case 'info':
      default:
        return 'info';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md w-full animate-in fade-in slide-in-from-top-2">
      <Alert variant={getVariant() as 'default' | 'destructive'}>
        <div className="flex items-center gap-2">
          {getIcon()}
          <AlertDescription>
            {message}
          </AlertDescription>
        </div>
      </Alert>
    </div>
  );
};

export const Confirmation: React.FC<ConfirmationProps> = ({
  show,
  title,
  message,
  onConfirm,
  onCancel,
}) => {
  return (
    <Dialog open={show} onOpenChange={() => onCancel()}>
      <DialogPortal>
        <div className="fixed inset-0 z-[2000]">
          <div className="fixed inset-0 bg-black/50" />
          <DialogContent className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-[2001]">
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{message}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onCancel}>
                  Batal
                </Button>
                <Button variant="destructive" onClick={onConfirm}>
                  Hapus
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </div>
      </DialogPortal>
    </Dialog>
  );
};