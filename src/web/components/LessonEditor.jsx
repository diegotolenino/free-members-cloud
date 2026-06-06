import React from 'react';
import InternalLibraryModal from './InternalLibraryModal';
import Icon from './Icons';
import RichTextEditor from './RichTextEditor';

function slugify(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function formatFileSize(bytes) {
  const value = Number(bytes || 0);

  if (!value) {
    return '';
  }

  if (value >= 1024 * 1024) {
    return `${(value / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(value / 1024))} KB`;
}

function attachmentTypeLabel(item) {
  const extension = String(item?.extension || '').toLowerCase();

  if (extension === 'pdf') {
    return 'PDF';
  }

  if (extension === 'ppt' || extension === 'pptx') {
    return 'PPT';
  }

  if (extension === 'doc' || extension === 'docx') {
    return 'DOC';
  }

  if (extension === 'zip') {
    return 'ZIP';
  }

  return 'ARQ';
}

function attachmentTitle(item) {
  return item?.title || item?.filename || 'Arquivo';
}

function matchesLessonRef(currentRef, lesson) {
  return String(currentRef) === String(lesson?.id) || String(currentRef) === String(lesson?.client_key || '');
}

function LessonCard({
  activeLessonId,
  draggingLessonId,
  focusTarget,
  lesson,
  lessonErrors,
  lessonIndex,
  moduleOrder,
  moduleId,
  onArchiveLesson,
  onDragLesson,
  onDropLesson,
  onLessonFieldChange,
  onLessonFieldsChange,
  onSelectLesson,
}) {
  const isActive = matchesLessonRef(activeLessonId, lesson);
  const [attachmentsOpen, setAttachmentsOpen] = React.useState(false);
  const materials = (lesson.materials || []).filter((item) => item?.status !== 'archived');
  const titleInputRef = React.useRef(null);
  const contentUrlInputRef = React.useRef(null);
  const cardRef = React.useRef(null);
  const titleMissing = Boolean(lessonErrors?.title);
  const contentUrlMissing = Boolean(lessonErrors?.content_url);
  const hasValidationError = titleMissing || contentUrlMissing;

  React.useEffect(() => {
    if (!isActive) {
      return;
    }

    const isFocusTarget = String(focusTarget?.lessonRef || '') === String(lesson.client_key || lesson.id);
    const targetInput = isFocusTarget
      ? (focusTarget.field === 'content_url' ? contentUrlInputRef.current : titleInputRef.current)
      : titleInputRef.current;

    if (!targetInput) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      targetInput.focus({ preventScroll: true });
      const cursorPosition = String(targetInput?.value || '').length;
      targetInput.setSelectionRange?.(cursorPosition, cursorPosition);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [focusTarget, isActive, lesson.client_key, lesson.id]);

  function updateMaterials(nextMaterials) {
    onLessonFieldChange(moduleId, lesson.id, 'materials', nextMaterials);
  }

  function handleAddAttachment(file) {
    updateMaterials([
      ...materials,
      {
        id: file?.id || `file-${Date.now()}`,
        title: file?.title || file?.filename || 'Arquivo',
        url: file?.url || '',
        type: 'file',
        extension: file?.extension || '',
        filesize: Number(file?.filesize || 0),
        status: 'published',
        sort_order: materials.length + 1,
      },
    ]);
    setAttachmentsOpen(false);
  }

  return (
    <article
      ref={cardRef}
      className={`fm-lesson-card ${isActive ? 'is-active' : ''} ${hasValidationError ? 'is-incomplete' : ''}`}
      draggable
      onDragOver={(event) => event.preventDefault()}
      onDragStart={() => onDragLesson(lesson.id)}
      onDrop={() => onDropLesson(moduleId, draggingLessonId, lesson.id)}
    >
      <div className={`fm-lesson-card__summary ${hasValidationError ? 'is-incomplete' : ''}`}>
        <button className="fm-lesson-card__summary-main" onClick={() => onSelectLesson(lesson.client_key || lesson.id)} type="button">
          <span className="fm-sort-handle" aria-hidden="true">
            <Icon name="drag" size={14} />
          </span>
          <span className="fm-lesson-card__order">{moduleOrder}.{lessonIndex + 1}</span>
          <div className="fm-lesson-card__copy">
            <strong>{lesson.title || 'Nova aula'}</strong>
          </div>
          <span className="fm-lesson-card__chevron" aria-hidden="true">
            <Icon name={isActive ? 'chevronUp' : 'chevronDown'} size={16} />
          </span>
        </button>

        <button
          aria-label="Excluir aula"
          className="fm-lesson-card__trash"
          onClick={() => onArchiveLesson(moduleId, lesson)}
          type="button"
        >
          <Icon name="trash" size={14} />
        </button>
      </div>

      <div className={`fm-lesson-card__body-shell ${isActive ? 'is-active' : ''}`}>
        <div className="fm-lesson-card__body">
          <label className={`fm-lesson-editor__field ${titleMissing ? 'has-error' : ''}`}>
            <span>Nome da aula</span>
            <input
              ref={titleInputRef}
              onChange={(event) => {
                const nextTitle = event.target.value;
                const nextChanges = {
                  title: nextTitle,
                  slug: slugify(nextTitle),
                };

                onLessonFieldsChange(moduleId, lesson.id, nextChanges);
              }}
              placeholder="Ex: Plano de Ação e Cronograma"
              value={lesson.title || ''}
            />
            {titleMissing ? <small className="fm-lesson-editor__error">Preencha o nome da aula.</small> : null}
          </label>

          <RichTextEditor
            label="Descrição"
            onChange={(nextValue) => onLessonFieldChange(moduleId, lesson.id, 'excerpt', nextValue)}
            placeholder="Escreva uma descrição rica para esta aula."
            value={lesson.excerpt || ''}
          />

          <div className="fm-lesson-editor__grid">
            <div className={`fm-lesson-panel-card ${contentUrlMissing ? 'is-error' : ''}`}>
              <div className="fm-lesson-panel-card__header">
                <div className="fm-lesson-panel-card__title">
                  <Icon name="play" size={16} />
                  <strong>Conteúdo da aula</strong>
                </div>
              </div>

              <label className="fm-lesson-editor__field">
                <span>Origem do conteúdo</span>
                <select onChange={(event) => onLessonFieldChange(moduleId, lesson.id, 'content_source', event.target.value)} value={lesson.content_source || 'youtube'}>
                  <option value="youtube">YouTube</option>
                  <option value="vimeo">Vimeo</option>
                  <option value="bunny">Bunny</option>
                  <option value="direct_video">Vídeo direto</option>
                  <option value="external_url">Link externo</option>
                </select>
              </label>

              <label className={`fm-lesson-editor__field ${contentUrlMissing ? 'has-error' : ''}`}>
                <span>Link do vídeo</span>
                <input
                  ref={contentUrlInputRef}
                  onChange={(event) => onLessonFieldChange(moduleId, lesson.id, 'content_url', event.target.value)}
                  placeholder="https://..."
                  value={lesson.content_url || ''}
                />
                {contentUrlMissing ? <small className="fm-lesson-editor__error">Preencha o link do vídeo.</small> : null}
              </label>

              <p className="fm-lesson-panel-card__helper">
                Use o link principal do vídeo para manter a melhor compatibilidade de reprodução.
              </p>
            </div>

            <div className="fm-lesson-panel-card">
              <div className="fm-lesson-panel-card__header">
                <div className="fm-lesson-panel-card__title">
                  <Icon name="material" size={16} />
                  <strong>Anexos e recursos</strong>
                </div>
              </div>

              <button className="fm-attachment-dropzone" onClick={() => setAttachmentsOpen(true)} type="button">
                <span className="fm-attachment-dropzone__icon" aria-hidden="true">
                  <Icon name="upload" size={18} />
                </span>
                <strong>Arraste arquivos aqui ou clique para enviar</strong>
                <span>PDF, DOC, PPT, ZIP até 100MB</span>
              </button>

              <div className="fm-attachment-list">
                {materials.map((item) => (
                  <div className="fm-attachment-item" key={`${lesson.id}-${item.id || item.url || item.title}`}>
                    <span className={`fm-attachment-item__type is-${attachmentTypeLabel(item).toLowerCase()}`}>{attachmentTypeLabel(item)}</span>
                    <div className="fm-attachment-item__copy">
                      <strong>{attachmentTitle(item)}</strong>
                    </div>
                    <span className="fm-attachment-item__size">{formatFileSize(item.filesize) || 'Arquivo'}</span>
                    <button aria-label="Mais ações do arquivo" className="fm-attachment-item__icon-button" type="button">
                      <Icon name="more" size={15} />
                    </button>
                    <a
                      aria-label="Baixar arquivo"
                      className="fm-attachment-item__icon-button"
                      href={item.url || '#'}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <Icon name="download" size={15} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <InternalLibraryModal
            confirmLabel="Adicionar arquivo"
            description="Selecione um arquivo existente ou envie um novo recurso para esta aula."
            onClose={() => setAttachmentsOpen(false)}
            onSelect={handleAddAttachment}
            open={attachmentsOpen}
            purpose="lesson-resource"
            title="Biblioteca interna de arquivos"
          />
        </div>
      </div>
    </article>
  );
}

export default function LessonEditor({
  activeLessonId,
  draggingLessonId,
  focusTarget,
  lessonErrors = {},
  lessons,
  moduleOrder = 1,
  moduleId,
  onArchiveLesson,
  onDragLesson,
  onDropLesson,
  onLessonFieldChange,
  onLessonFieldsChange,
  onSelectLesson,
}) {
  const activeLessons = (lessons || []).filter((lesson) => lesson.status !== 'archived').sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));

  return (
    <div className="fm-lessons-panel">
      <div className="fm-lesson-list">
        {activeLessons.map((lesson, index) => (
          <LessonCard
            activeLessonId={activeLessonId}
            draggingLessonId={draggingLessonId}
            focusTarget={focusTarget}
            key={lesson.client_key || lesson.id}
            lesson={lesson}
            lessonErrors={lessonErrors[String(lesson.client_key || lesson.id)] || lessonErrors[String(lesson.id)] || null}
            lessonIndex={index}
            moduleOrder={moduleOrder}
            moduleId={moduleId}
            onArchiveLesson={onArchiveLesson}
            onDragLesson={onDragLesson}
            onDropLesson={onDropLesson}
            onLessonFieldChange={onLessonFieldChange}
            onLessonFieldsChange={onLessonFieldsChange}
            onSelectLesson={onSelectLesson}
          />
        ))}
      </div>
    </div>
  );
}
