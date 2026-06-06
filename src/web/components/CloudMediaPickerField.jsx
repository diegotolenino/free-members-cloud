import React from 'react';
import Icon from './Icons';

export default function CloudMediaPickerField({
  label = 'Imagem',
  meta = '',
  previewUrl = '',
  value = 0,
  onChange,
  hideLabel = false,
  cornerRemove = false,
}) {
  function openUrlPicker() {
    const url = window.prompt('Cole a URL da imagem que deseja usar:', previewUrl || '');

    if (url === null) {
      return;
    }

    const normalizedUrl = String(url || '').trim();
    onChange?.({
      id: normalizedUrl ? Number(value || Date.now()) : 0,
      url: normalizedUrl,
      thumbUrl: normalizedUrl,
    });
  }

  return (
    <div className="fm-media-picker">
      {!hideLabel ? (
        <div className="fm-media-picker__label-row">
          <div className="fm-media-picker__label-meta">
            <span className="fm-field-label">{label}</span>
            {meta ? <small>{meta}</small> : null}
          </div>
          {value && !cornerRemove ? (
            <button
              className="fm-text-link"
              onClick={() =>
                onChange?.({
                  id: 0,
                  url: '',
                  thumbUrl: '',
                })
              }
              type="button"
            >
              Remover
            </button>
          ) : null}
        </div>
      ) : null}

      <div
        className={`fm-media-picker__dropzone ${previewUrl ? 'has-image' : 'is-empty'}`}
        onClick={openUrlPicker}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openUrlPicker();
          }
        }}
        role="button"
        tabIndex={0}
      >
        {previewUrl ? <img alt="" className="fm-media-picker__preview" src={previewUrl} /> : null}
        {value && cornerRemove ? (
          <button
            aria-label="Remover imagem"
            className="fm-media-picker__corner-remove"
            onClick={(event) => {
              event.stopPropagation();
              onChange?.({
                id: 0,
                url: '',
                thumbUrl: '',
              });
            }}
            type="button"
          >
            <Icon name="trash" size={15} />
          </button>
        ) : null}
        <div className={`fm-media-picker__overlay ${previewUrl ? 'has-image' : 'is-empty'}`}>
          <div className="fm-media-picker__icon" aria-hidden="true">
            <Icon name="image" size={18} />
          </div>
          <div className="fm-media-picker__overlay-copy">
            <strong>{previewUrl ? 'Clique para trocar o banner' : 'Selecionar banner'}</strong>
            <span>{previewUrl ? 'Informe outra URL de imagem' : 'Cole uma URL para usar como capa'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
