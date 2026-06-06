import Icon from './Icons';
import { getBootstrap } from '../lib/bootstrap';

const items = [
  { id: 'dashboard', label: 'Painel', icon: 'home' },
  { id: 'courses', label: 'Cursos', icon: 'courseLibrary' },
  { id: 'pages', label: 'Páginas', icon: 'pages' },
  { id: 'students', label: 'Alunos', icon: 'students' },
  { id: 'messages', label: 'Notificações', icon: 'bell' },
  { id: 'integrations', label: 'Integrações', icon: 'integrations' },
  { id: 'checkouts', label: 'Checkouts', icon: 'sales' },
  { id: 'sales', label: 'Vendas', icon: 'sales' },
];

export default function AdminSidebar({ activeSection, onOpenWordPress, onSectionChange }) {
  const logoImage = getBootstrap().logoUrl || '';
  const appName = getBootstrap().app?.name || 'Free Members';

  return (
    <aside className={`fm-sidebar ${activeSection === 'courses' ? 'fm-sidebar--course-focus' : ''}`}>
      <div className="fm-sidebar__brand">
        {logoImage ? <img alt={appName} className="fm-sidebar__logo-image" src={logoImage} /> : <strong className="fm-cloud-sidebar-brand">{appName}</strong>}
      </div>

      <nav aria-label="Navegação principal" className="fm-sidebar__nav">
        {items.map((item) => (
          <button
            className={activeSection === item.id ? 'is-active' : ''}
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            type="button"
          >
            <span className="fm-sidebar__nav-icon" aria-hidden="true">
              <Icon name={item.icon} size={18} />
            </span>
            <span className="fm-sidebar__nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="fm-sidebar__footer">
        <button className="fm-open-wordpress" onClick={onOpenWordPress} type="button">
          <span>Abrir WordPress</span>
          <Icon name="arrowRight" size={14} />
        </button>
      </div>
    </aside>
  );
}
