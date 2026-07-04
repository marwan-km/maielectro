import { Modal } from '@heroui/react/modal';
import Button from '../ui/Button.jsx';

export default function ConfirmDialog({ title, description, confirmLabel = 'Confirmer', onCancel, onConfirm, danger = false }) {
  return (
    <Modal.Root>
      <Modal.Backdrop isOpen isDismissable onOpenChange={(open) => !open && onCancel?.()} className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm">
        <Modal.Container isOpen placement="center" className="w-full max-w-md">
          <Modal.Dialog className="rounded-3xl bg-white p-6 shadow-premium outline-none dark:bg-card-dark">
            <Modal.Header className="p-0">
              <Modal.Heading className="text-xl font-black text-navy dark:text-white">{title}</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="p-0 pt-2">
              <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
            </Modal.Body>
            <Modal.Footer className="mt-6 flex justify-end gap-3 p-0">
              <Button type="button" onClick={onCancel} variant="secondary">Annuler</Button>
              <Button type="button" onClick={onConfirm} className={danger ? 'bg-red-600 hover:bg-red-700' : ''}>{confirmLabel}</Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal.Root>
  );
}
