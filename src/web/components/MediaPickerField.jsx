import React from 'react';
import InternalLibraryModal from './InternalLibraryModal';
import Icon from './Icons';

export default function MediaPickerField({
  label = 'Imagem',
  meta = '',
  previewUrl = '',
  value = 0,
  onChange,
  hideLabel = false,
  cornerRemove = false,
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
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
          onClick={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              setOpen(true);
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
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v5" />
                <path d="M14 11v5" />
              </svg>
            </button>
          ) : null}
          <div className={`fm-media-picker__overlay ${previewUrl ? 'has-image' : 'is-empty'}`}>
            <div className="fm-media-picker__icon" aria-hidden="true">
              <Icon name="image" size={18} />
            </div>
            <div className="fm-media-picker__overlay-copy">
              <strong>{previewUrl ? 'Clique para trocar o banner' : 'Selecionar banner'}</strong>
              <span>{previewUrl ? 'Abra a biblioteca interna para alterar a capa' : 'Escolha uma imagem da biblioteca interna para a capa'}</span>
            </div>
          </div>
        </div>
      </div>

      <InternalLibraryModal
        accept="image"
        confirmLabel="Usar imagem"
        description="Escolha uma imagem ja enviada ou suba uma nova capa para o curso."
        onClose={() => setOpen(false)}
        onSelect={(file) => {
          onChange?.({
            id: Number(file?.id || 0),
            url: file?.sizes?.large?.url || file?.url || '',
            thumbUrl: file?.sizes?.medium?.url || file?.thumb_url || file?.url || '',
          });
          setOpen(false);
        }}
        open={open}
        purpose="course-cover"
        selectedId={value}
        title="Biblioteca interna de imagens"
      />
    </>
  );
}
