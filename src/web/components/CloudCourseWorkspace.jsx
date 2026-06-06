import React from 'react';
import CloudCourseForm from './CloudCourseForm';
import EmptyState from './EmptyState';
import { WorkspaceSkeleton } from './LoadingSkeleton';
import SelectedCourseHero from './SelectedCourseHero';

export default function CloudCourseWorkspace({
  activeCourse,
  hasCourses = false,
  isEditing,
  isCreatingNew,
  loading,
  onCancel,
  onEdit,
  previewUrl,
  onPublishComplete,
  onSubmit,
  saving,
}) {
  if (loading && !activeCourse && !isCreatingNew) {
    return <WorkspaceSkeleton />;
  }

  if (!isCreatingNew && !activeCourse) {
    return (
      <section className="fm-workspace-panel fm-surface-card">
        {hasCourses ? (
          <EmptyState
            description="Escolha um curso no catálogo ou crie um novo curso."
            title="Nenhum curso selecionado"
          />
        ) : (
          <EmptyState
            description="Crie seu primeiro curso para começar a estruturar sua plataforma."
            title="Você ainda não tem nenhum curso"
          />
        )}
      </section>
    );
  }

  if (!isCreatingNew && activeCourse && !isEditing) {
    return (
      <section className="fm-workspace-panel">
        <SelectedCourseHero course={activeCourse} onEdit={onEdit} previewUrl={previewUrl} />
      </section>
    );
  }

  return (
    <section className="fm-workspace-panel">
      <CloudCourseForm
        initialValues={isCreatingNew ? undefined : activeCourse}
        loadingStructure={loading}
        onCancel={onCancel}
        onPublishComplete={onPublishComplete}
        onSubmit={onSubmit}
        saving={saving}
      />
    </section>
  );
}
