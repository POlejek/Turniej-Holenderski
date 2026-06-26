import { useState, useCallback } from 'react';

// Reużywalny modal zastępujący natywne window.confirm / window.alert.
// Użycie:
//   const { confirm, notify, dialog } = useConfirm();
//   if (await confirm({ title, message, danger: true })) { ... }
//   await notify('Komunikat');
// ...a w JSX umieść {dialog}.
export function useConfirm() {
  const [state, setState] = useState(null);

  const confirm = useCallback(
    (opts) => new Promise((resolve) => {
      setState({ mode: 'confirm', ...opts, resolve });
    }),
    []
  );

  const notify = useCallback(
    (message, opts = {}) => new Promise((resolve) => {
      setState({ mode: 'alert', message, ...opts, resolve });
    }),
    []
  );

  const close = (result) => {
    setState((s) => {
      if (s) s.resolve(result);
      return null;
    });
  };

  const dialog = state ? (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={() => close(state.mode === 'alert')}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {state.title && (
          <h3 className="text-lg font-bold text-gray-800 mb-2">{state.title}</h3>
        )}
        <p className="text-sm text-gray-600 mb-5 whitespace-pre-line">{state.message}</p>
        <div className="flex gap-3 justify-end">
          {state.mode === 'confirm' && (
            <button
              onClick={() => close(false)}
              className="py-2 px-4 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              {state.cancelLabel || 'Anuluj'}
            </button>
          )}
          <button
            onClick={() => close(true)}
            autoFocus
            className={`py-2 px-4 rounded-lg text-white transition-colors text-sm font-medium ${
              state.danger ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {state.confirmLabel || 'OK'}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return { confirm, notify, dialog };
}
