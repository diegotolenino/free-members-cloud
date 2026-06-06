import AdminSidebar from './AdminSidebar';
import { getBootstrap } from '../lib/bootstrap';
import { useEffect } from 'react';

export default function AdminShell({ activeSection, children, onSectionChange }) {
  const isCoursesSection = ['dashboard', 'courses', 'pages', 'students', 'messages', 'integrations', 'checkouts', 'sales'].includes(activeSection);

  useEffect(() => {
    const design = getBootstrap().designSettings || {};
    if (design.primaryColor) {
      document.documentElement.style.setProperty('--fm-primary-color', design.primaryColor);
    }
    if (design.primaryAccent) {
      document.documentElement.style.setProperty('--fm-primary-accent', design.primaryAccent);
    }
  }, []);

  function handleOpenWordPress() {
    window.open('/api/health', '_blank', 'noopener,noreferrer');
  }

  return (
    <section className={`fm-admin-shell ${isCoursesSection ? 'is-course-focus' : ''} fm-admin-shell--${activeSection}`}>
      <AdminSidebar activeSection={activeSection} onOpenWordPress={handleOpenWordPress} onSectionChange={onSectionChange} />

      <div className="fm-admin-shell__main fm-admin-main">
        <div className="fm-admin-shell__body">{children}</div>
      </div>
    </section>
  );
}
