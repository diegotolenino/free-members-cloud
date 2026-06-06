import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { apiFetch, apiUpload } from '../lib/api';
import Icon from './Icons';

function formatFileSize(bytes) {
  const value = Number(bytes || 0);

  if (!value) {
    return '0 KB';
  }

  if (value >= 1024 * 1024 * 1024) {
    return `${(value / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }

  if (value >= 1024 * 1024) {
    return `${(value / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(value / 1024))} KB`;
}

function fileTypeLabel(file) {
  if (file?.is_image) {
    return 'Imagem';
  }

  if (file?.is_video) {
    return 'Vídeo';
  }

  return file?.extension?.toUpperCase() || 'Arquivo';
}

function fileVariant(file) {
  const extension = String(file?.extension || '').toLowerCase();

  if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension)) {
    return 'image';
  }

  if (['mp4', 'mov', 'avi', 'webm'].includes(extension)) {
    return 'video';
  }

  if (['pdf'].includes(extension)) {
    return 'pdf';
  }

  if (['doc', 'docx'].includes(extension)) {
    return 'doc';
  }

  if (['xls', 'xlsx', 'csv'].includes(extension)) {
    return 'sheet';
  }

  if (['ppt', 'pptx'].includes(extension)) {
    return 'slide';
  }

  if (['zip', 'rar', '7z'].includes(extension)) {
    return 'archive';
  }

  return 'file';
}

function formatDimensions(file) {
  if (file?.width && file?.height) {
    return `${file.width} x ${file.height}`;
  }

  return '';
}

export default function InternalLibraryModal({
  accept = 'all',
  confirmLabel = 'Usar arquivo',
  description = 'Selecione um arquivo ja enviado ou faca um novo upload.',
  onClose,
  onSelect,
  open,
  purpose = 'general',
  selectedId = 0,
  title = 'Biblioteca interna',
  validateUpload,
}) {
  const fileInputRef = useRef(null);
  const [activeId, setActiveId] = useState(Number(selectedId || 0));
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    setActiveId(Number(selectedId || 0));
  }, [selectedId, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    let alive = true;

    async function loadFiles() {
      setLoading(true);
      setError('');

      try {
        const query = accept && accept !== 'all' ? `?type=${encodeURIComponent(accept)}` : '';
        const response = await apiFetch(`/library/files${query}`);

        if (alive) {
          setFiles(Array.isArray(response) ? response : []);
        }
      } catch (requestError) {
        if (alive) {
          setError(requestError.message);
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    }

    loadFiles();

    return () => {
      alive = false;
    };
  }, [accept, open]);

  const filteredFiles = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    if (!query) {
      return files;
    }

    return files.filter((file) => [file.title, file.filename, file.mime_type, file.extension].join(' ').toLowerCase().includes(query));
  }, [files, searchValue]);

  const activeFile = filteredFiles.find((file) => Number(file.id) === Number(activeId)) || files.find((file) => Number(file.id) === Number(activeId)) || null;

  async function handleUpload(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const validationError = validateUpload?.(file);

    if (validationError) {
      setError(validationError);
      if (event.target) {
        event.target.value = '';
      }
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('purpose', purpose);
    formData.append('title', file.name.replace(/\.[^.]+$/, ''));

    setUploading(true);
    setError('');

    try {
      const uploaded = await apiUpload('/library/files', formData);
      setFiles((current) => [uploaded, ...current.filter((item) => Number(item.id) !== Number(uploaded.id))]);
      setActiveId(Number(uploaded.id || 0));
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setUploading(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  }

  if (!open) {
    return null;
  }

  function renderPreview(file) {
    const previewUrl = file?.thumb_url || file?.url || '';

    if (file?.is_image && previewUrl) {
      return <img alt="" src={previewUrl} />;
    }

    return (
      <div className={`fm-library-file-card__filetype is-${fileVariant(file)}`}>
        <span>{String(file?.extension || fileTypeLabel(file)).slice(0, 4).toUpperCase()}</span>
      </div>
    );
  }

  return createPortal(
    (
    <div className="fm-modal-backdrop" role="presentation">
      <div aria-modal="true" className="fm-modal-card fm-modal-card--library" role="dialog">
        <div className="fm-modal-card__header">
          <div>
            <h3>{title}</h3>
            <p>{description}</p>
          </div>
          <button className="fm-icon-button" onClick={onClose} type="button">
            <Icon name="close" size={16} />
          </button>
        </div>

        <div className="fm-library-toolbar">
          <label className="fm-catalog-search fm-library-toolbar__search">
            <span aria-hidden="true">
              <Icon name="search" size={16} />
            </span>
            <input onChange={(event) => setSearchValue(event.target.value)} placeholder="Buscar arquivos..." value={searchValue} />
          </label>

          <div className="fm-library-toolbar__actions">
            <input accept={accept === 'image' ? 'image/*' : accept === 'video' ? 'video/*' : undefined} hidden onChange={handleUpload} ref={fileInputRef} type="file" />
            <button className="fm-button fm-button--gradient" disabled={uploading} onClick={() => fileInputRef.current?.click()} type="button">
              <Icon name="plus" size={16} />
              <span>{uploading ? 'Enviando...' : 'Enviar arquivo'}</span>
            </button>
          </div>
        </div>

        {error ? <div className="fm-admin-alert is-error">{error}</div> : null}

        <div className="fm-library-panel">
          <div className="fm-library-grid" role="list">
            {loading ? (
              <div className="fm-library-empty">
                <strong>Carregando biblioteca...</strong>
              </div>
            ) : null}

            {!loading && !filteredFiles.length ? (
              <div className="fm-library-empty">
                <strong>Nenhum arquivo encontrado</strong>
                <p>Envie um novo arquivo para começar sua biblioteca interna.</p>
              </div>
            ) : null}

            {!loading
              ? filteredFiles.map((file) => (
                  <button
                    className={`fm-library-file-card ${Number(activeId) === Number(file.id) ? 'is-active' : ''}`}
                    key={file.id}
                    onClick={() => setActiveId(Number(file.id))}
                    role="listitem"
                    type="button"
                  >
                    <div className="fm-library-file-card__preview">{renderPreview(file)}</div>
                    <div className="fm-library-file-card__content">
                      <strong title={file.title || file.filename}>{file.title || file.filename}</strong>
                      <span className="fm-library-file-card__filename" title={file.filename}>
                        {file.filename}
                      </span>
                      <div className="fm-library-file-card__meta">
                        <span>{fileTypeLabel(file)}</span>
                        {formatDimensions(file) ? <span>{formatDimensions(file)}</span> : null}
                        <span>{formatFileSize(file.filesize)}</span>
                      </div>
                    </div>
                  </button>
                ))
              : null}
          </div>
        </div>

        <div className="fm-admin-actions">
          <button className="fm-button fm-button--ghost" onClick={onClose} type="button">
            Cancelar
          </button>
          <button className="fm-button fm-button--gradient" disabled={!activeFile} onClick={() => onSelect?.(activeFile)} type="button">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
    ),
    document.body
  );
}
