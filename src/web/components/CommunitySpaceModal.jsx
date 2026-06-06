import MediaPickerField from './MediaPickerField';
import StudentCoursePicker from './StudentCoursePicker';
import Icon from './Icons';

export default function CommunitySpaceModal({
  courseSearch = '',
  editingSpaceId = 0,
  error = '',
  filteredCourses = [],
  forcePrivate = false,
  hideCourseSelector = false,
  onArchive,
  onChange,
  onClose,
  onCourseSearch,
  onSubmit,
  onToggleCourse,
  open = false,
  saving = false,
  spaceForm,
}) {
  if (!open || !spaceForm) {
    return null;
  }

  const isPrivate = forcePrivate || spaceForm.type === 'private';

  return (
    <div className="fm-modal-backdrop" role="presentation">
      <form aria-modal="true" className="fm-modal-card fm-community-space-modal" onSubmit={onSubmit} role="dialog">
        <div className="fm-modal-card__header">
          <div>
            <h3>{editingSpaceId ? 'Editar grupo' : 'Novo grupo'}</h3>
            <p>Configure nome, banner e acesso do grupo.</p>
          </div>
          <button className="fm-icon-button" onClick={onClose} type="button"><Icon name="close" size={16} /></button>
        </div>

        <div className="fm-community-space-modal__body fm-community-space-form">
          <label><span>Nome</span><input onChange={(event) => onChange({ name: event.target.value })} value={spaceForm.name || ''} /></label>
          <label><span>Descrição</span><textarea onChange={(event) => onChange({ description: event.target.value })} value={spaceForm.description || ''} /></label>
          <label>
            <span>Banner horizontal</span>
            <MediaPickerField cornerRemove hideLabel label="" previewUrl={spaceForm.banner_url || ''} value={spaceForm.banner_url ? 1 : 0} onChange={(file) => onChange({ banner_url: file?.url || '' })} />
          </label>

          <div className="fm-community-space-form__pair">
            {!forcePrivate ? (
              <label>
                <span>Tipo</span>
                <select onChange={(event) => onChange({ type: event.target.value, linked_course_ids: event.target.value === 'private' ? (spaceForm.linked_course_ids || []) : [] })} value={spaceForm.type || 'public'}>
                  <option value="public">Público</option>
                  <option value="private">Privado</option>
                </select>
              </label>
            ) : (
              <div className="fm-community-space-modal__locked-type">
                <span>Tipo</span>
                <div><strong>Privado</strong><small>Vinculado ao curso atual</small></div>
              </div>
            )}
            <label><span>Status</span><select onChange={(event) => onChange({ status: event.target.value })} value={spaceForm.status || 'active'}><option value="active">Ativo</option><option value="inactive">Inativo</option></select></label>
          </div>

          {isPrivate && !hideCourseSelector ? (
            <div className="fm-community-space-course-field">
              <span>Cursos com acesso</span>
              <StudentCoursePicker
                courses={filteredCourses}
                emptyText="Nenhum curso encontrado."
                onSearch={onCourseSearch}
                onToggle={onToggleCourse}
                searchValue={courseSearch}
                selectedIds={spaceForm.linked_course_ids || []}
              />
            </div>
          ) : null}

          <label className="fm-community-switch"><span>Alunos podem postar</span><input checked={Boolean(spaceForm.allow_student_posts)} onChange={(event) => onChange({ allow_student_posts: event.target.checked })} type="checkbox" /><i aria-hidden="true" /></label>
          {error ? <div className="fm-admin-alert is-error">{error}</div> : null}
        </div>

        <div className="fm-admin-actions">
          <button className="fm-button fm-button--ghost" onClick={onClose} type="button">Cancelar</button>
          {editingSpaceId ? <button className="fm-button is-danger" onClick={onArchive} type="button">Arquivar</button> : null}
          <button className="fm-button fm-button--gradient" disabled={saving} type="submit">{saving ? 'Salvando...' : editingSpaceId ? 'Atualizar grupo' : 'Criar grupo'}</button>
        </div>
      </form>
    </div>
  );
}
