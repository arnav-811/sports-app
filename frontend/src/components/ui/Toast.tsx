import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useUIStore, Toast as ToastType } from '../../store/uiStore';
import { cn } from '../../lib/utils';

function ToastItem({ toast }: { toast: ToastType }) {
  const { removeToast } = useUIStore();
  const icons = { success: <CheckCircle size={16} className="text-green-400" />, error: <XCircle size={16} className="text-red-400" />, info: <Info size={16} className="text-blue-400" /> };
  const borders = { success: 'border-green-500/30', error: 'border-red-500/30', info: 'border-blue-500/30' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className={cn('flex items-center gap-3 px-4 py-3 bg-surface-2 border rounded-xl shadow-xl min-w-64 max-w-sm', borders[toast.type])}
    >
      {icons[toast.type]}
      <span className="text-sm flex-1">{toast.message}</span>
      <button onClick={() => removeToast(toast.id)} className="text-text-3 hover:text-text-1 transition-colors">
        <X size={14} />
      </button>
    </motion.div>
  );
}

export function ToastContainer() {
  const { toasts } = useUIStore();
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 items-end">
      <AnimatePresence>
        {toasts.map((t) => <ToastItem key={t.id} toast={t} />)}
      </AnimatePresence>
    </div>
  );
}
