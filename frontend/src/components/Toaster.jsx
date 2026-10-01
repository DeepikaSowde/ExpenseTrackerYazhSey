import { useEffect } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

function Toaster({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      onClose();
    }, 2500);

    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isError = toast.type === "error";

  return (
    <div
      className={`
        fixed
        bottom-5
        right-5
        z-[100]
        flex
        min-w-[280px]
        max-w-[380px]
        items-center
        gap-3
        rounded-xl
        bg-white
        px-4
        py-3
        shadow-xl
        ring-1
        ring-slate-200
      `}
    >

      {isError ? (
        <XCircle
          size={20}
          className="shrink-0 text-rose-500"
        />
      ) : (
        <CheckCircle2
          size={20}
          className="shrink-0 text-emerald-500"
        />
      )}

      <p className="flex-1 text-sm font-medium text-slate-700">
        {toast.message}
      </p>

      <button
        type="button"
        onClick={onClose}
        className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
      >
        <X size={15} />
      </button>

    </div>
  );
}

export default Toaster;