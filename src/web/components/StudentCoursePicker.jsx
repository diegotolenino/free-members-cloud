import Icon from './Icons';

export default function StudentCoursePicker({
  courses = [],
  emptyText = 'Nenhum curso encontrado.',
  onSearch,
  onToggle,
  searchValue,
  selectedIds = [],
}) {
  return (
    <div className="fm-student-course-picker">
      <label className="fm-catalog-search">
        <span aria-hidden="true">
          <Icon name="search" size={16} />
        </span>
        <input onChange={(event) => onSearch(event.target.value)} placeholder="Buscar curso..." value={searchValue} />
      </label>

      <div className="fm-student-course-picker__list">
        {courses.length ? (
          courses.map((course) => {
            const isSelected = selectedIds.includes(Number(course.id));

            return (
              <button
                className={`fm-student-course-picker__item ${isSelected ? 'is-selected' : ''}`}
                key={course.id}
                onClick={() => onToggle(Number(course.id))}
                type="button"
              >
                {course.cover_image_thumb_url ? (
                  <img alt={course.title} className="fm-student-course-picker__thumb" src={course.cover_image_thumb_url} />
                ) : (
                  <span className="fm-student-course-picker__thumb is-fallback" aria-hidden="true">
                    <Icon name="courseLibrary" size={16} />
                  </span>
                )}
                <span className="fm-student-course-picker__copy">
                  <strong>{course.title}</strong>
                  <small>{Number(course.stats?.lessons || 0)} aulas</small>
                </span>
                <span className={`fm-student-check ${isSelected ? 'is-checked' : ''}`}>{isSelected ? <Icon name="published" size={14} /> : null}</span>
              </button>
            );
          })
        ) : (
          <div className="fm-student-card-empty">
            <div className="fm-empty-state__content">
              <div className="fm-empty-state__icon" aria-hidden="true">
                <Icon name="courseLibrary" size={18} />
              </div>
              <h4>{emptyText}</h4>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
