import { useEffect } from 'react';
import Icon from './Icons';

export default function ToastStack({ items = [], onDismiss }) {
  useEffect(() => {
    if (!items.length) {
      return undefined;
    }

    const timers = items.map((item) => window.setTimeout(() => onDismiss?.(item.id), item.timeout || 4200));
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [items, onDismiss]);

  if (!items.length) {
    return null;
  }

  return (
    <div className="fm-toast-stack" role="status" aria-live="polite">
      {items.map((item) => (
        <div className={`fm-toast fm-toast--${item.type || 'success'}`} key={item.id}>
          <div className="fm-toast__icon" aria-hidden="true">
            <Icon name={item.type === 'error' ? 'help' : 'checkCircle'} size={16} />
          </div>
          <div className="fm-toast__content">
            <strong>{item.title || (item.type === 'error' ? 'Falha na operacao' : 'Tudo certo')}</strong>
            <span>{item.message}</span>
          </div>
          <button aria-label="Fechar notificacao" className="fm-toast__close" onClick={() => onDismiss?.(item.id)} type="button">
            <Icon name="close" size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
