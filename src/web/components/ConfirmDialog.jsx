import React, { useEffect } from 'react';
import Icon from './Icons';

export default function ConfirmDialog({
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  description,
  details,
  highlight,
  iconName,
  onCancel,
  onConfirm,
  open,
  title,
  tone = 'danger',
}) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handleKey(event) {
      if (event.key === 'Escape') {
        onCancel?.();
      }
    }

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onCancel]);

  if (!open) {
    return null;
  }

  const resolvedIcon = iconName || (tone === 'danger' ? 'trash' : 'archive');

  return (
    <div
      className="fm-modal-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onCancel?.();
        }
      }}
      role="presentation"
    >
      <div aria-modal="true" className={`fm-modal-card fm-confirm-card is-${tone}`} role="dialog">
        <div className="fm-confirm-card__icon" aria-hidden="true">
          <Icon name={resolvedIcon} size={24} />
        </div>

        <div className="fm-confirm-card__body">
          <h3>{title}</h3>
          {description ? (
            <p>
              {highlight ? (
                <>
                  {description} <strong>{highlight}</strong>?
                </>
              ) : (
                description
              )}
            </p>
          ) : null}
          {details ? <div className="fm-confirm-card__details">{details}</div> : null}
        </div>

        <div className="fm-confirm-card__actions">
          <button className="fm-button fm-button--ghost" onClick={onCancel} type="button">
            {cancelLabel}
          </button>
          <button className={`fm-button ${tone === 'danger' ? 'fm-button--danger-solid' : 'fm-button--gradient'}`} onClick={onConfirm} type="button">
            <Icon name={resolvedIcon} size={16} />
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
