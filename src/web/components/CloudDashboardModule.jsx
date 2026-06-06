import { useEffect, useState } from 'react';
import Icon from './Icons';
import { apiFetch } from '../lib/api';

const DEFAULT_COLORS = { primary_color: '#ff3d73', secondary_color: '#ff7a45' };

const DEFAULT_MENU_ITEMS = [
  { id: 'home', label: 'Home', icon: 'home', url: '/', enabled: true, custom: false },
  { id: 'courses', label: 'Meus cursos', icon: 'courseLibrary', url: '/#cursos', enabled: true, custom: false },
  { id: 'account', label: 'Minha conta', icon: 'students', url: '/app/account', enabled: true, custom: false },
];

function normalizeMenu(menu = {}) {
  return {
    desktop: Array.isArray(menu?.desktop) && menu.desktop.length ? menu.desktop : DEFAULT_MENU_ITEMS,
    mobile: Array.isArray(menu?.mobile) && menu.mobile.length ? menu.mobile : DEFAULT_MENU_ITEMS,
  };
}

const SUBSECTIONS = [
  { id: 'general', label: 'Geral', icon: 'home' },
  { id: 'style', label: 'Estilo', icon: 'appearance' },
  { id: 'admins', label: 'Admins', icon: 'students' },
];

// ─── sub-tabs ─────────────────────────────────────────────────────────────────

function GeneralTab({ profile, onChange, onSave, saving, loading }) {
  const [showPass, setShowPass] = useState(false);

  if (loading) return <div className="fm-editor-skeleton" style={{ height: 300 }} />;

  return (
    <div className="fm-dashboard-general-tab">
      <div className="fm-dashboard-profile-section">
        <div className="fm-dashboard-section-header">
          <strong>Perfil do administrador</strong>
          <small>Informações exibidas na plataforma.</small>
        </div>

        <div className="fm-dashboard-form-grid">
          <label className="fm-dashboard-form-field">
            <span>Nome</span>
            <input onChange={(e) => onChange({ name: e.target.value })} placeholder="Seu nome" value={profile.name || ''} />
          </label>
          <label className="fm-dashboard-form-field">
            <span>Email</span>
            <input onChange={(e) => onChange({ email: e.target.value })} placeholder="seu@email.com" type="email" value={profile.email || ''} />
          </label>
          <label className="fm-dashboard-password-field">
            <span>Nova senha</span>
            <div>
              <input onChange={(e) => onChange({ password: e.target.value })} placeholder="Deixe em branco para manter" type={showPass ? 'text' : 'password'} value={profile.password || ''} />
              <button aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'} onClick={() => setShowPass((c) => !c)} type="button"><Icon name="eye" size={15} /></button>
            </div>
          </label>
        </div>

        <div className="fm-dashboard-profile-actions">
          <button className="fm-button fm-button--gradient" disabled={saving} onClick={() => onSave('profile')} type="button">
            {saving === 'profile' ? 'Salvando...' : 'Salvar perfil'}
          </button>
        </div>
      </div>
    </div>
  );
}

function StyleTab({ style, onChange, onSave, saving }) {
  const colorMode = style.color_mode || 'single';
  const preview = colorMode === 'gradient'
    ? `linear-gradient(135deg, ${style.primary_color || DEFAULT_COLORS.primary_color}, ${style.secondary_color || DEFAULT_COLORS.secondary_color})`
    : (style.primary_color || DEFAULT_COLORS.primary_color);

  return (
    <div className="fm-dashboard-style-tab">
      <div className="fm-dashboard-section-header">
        <strong>Paleta de cores</strong>
        <small>Define a identidade visual da área do aluno.</small>
      </div>

      <div className="fm-dashboard-color-preview" style={{ background: preview }}>
        <span>Prévia da cor principal</span>
      </div>

      <div className="fm-dashboard-form-grid">
        <label className="fm-dashboard-form-field">
          <span>Modo de cor</span>
          <div className="fm-dashboard-color-mode-btns">
            {[['single', 'Sólida'], ['gradient', 'Gradiente']].map(([v, l]) => (
              <button className={colorMode === v ? 'is-active' : ''} key={v} onClick={() => onChange({ color_mode: v })} type="button">{l}</button>
            ))}
          </div>
        </label>

        <label className="fm-checkout-field fm-checkout-color-field">
          <span>Cor primária</span>
          <div className="fm-checkout-color-input">
            <input onChange={(e) => onChange({ primary_color: e.target.value })} type="color" value={style.primary_color || DEFAULT_COLORS.primary_color} />
            <code>{style.primary_color || DEFAULT_COLORS.primary_color}</code>
          </div>
        </label>

        {colorMode === 'gradient' ? (
          <label className="fm-checkout-field fm-checkout-color-field">
            <span>Cor secundária</span>
            <div className="fm-checkout-color-input">
              <input onChange={(e) => onChange({ secondary_color: e.target.value })} type="color" value={style.secondary_color || DEFAULT_COLORS.secondary_color} />
              <code>{style.secondary_color || DEFAULT_COLORS.secondary_color}</code>
            </div>
          </label>
        ) : null}

        <label className="fm-dashboard-form-field">
          <span>Tema padrão</span>
          <select onChange={(e) => onChange({ default_theme: e.target.value })} value={style.default_theme || 'dark'}>
            <option value="dark">Escuro</option>
            <option value="light">Claro</option>
          </select>
        </label>
      </div>

      <div className="fm-dashboard-section-header" style={{ marginTop: '1.5rem' }}>
        <strong>Menu de navegação</strong>
        <small>Itens exibidos na área do aluno.</small>
      </div>

      <div className="fm-dashboard-menu-list">
        {(normalizeMenu(style.nav_menu).desktop).map((item) => (
          <div className="fm-dashboard-menu-item" key={item.id}>
            <Icon name={item.icon || 'link'} size={14} />
            <span>{item.label}</span>
            <small>{item.url}</small>
            <label className="fm-switch" style={{ marginLeft: 'auto' }}>
              <input
                checked={item.enabled !== false}
                onChange={(e) => {
                  const menu = normalizeMenu(style.nav_menu);
                  const updated = { ...menu, desktop: menu.desktop.map((i) => i.id === item.id ? { ...i, enabled: e.target.checked } : i) };
                  onChange({ nav_menu: updated });
                }}
                type="checkbox"
              />
              <span />
            </label>
          </div>
        ))}
      </div>

      <div className="fm-dashboard-profile-actions">
        <button className="fm-button fm-button--gradient" disabled={saving} onClick={() => onSave('style')} type="button">
          {saving === 'style' ? 'Salvando...' : 'Salvar estilo'}
        </button>
      </div>
    </div>
  );
}

function AdminsTab({ admins, onDelete, onAdd, loading }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'teacher' });
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleAdd() {
    setSubmitting(true);
    try {
      await onAdd(form);
      setForm({ name: '', email: '', password: '', role: 'teacher' });
      setShowForm(false);
    } catch { /* errors handled by parent */ }
    finally { setSubmitting(false); }
  }

  if (loading) return <div className="fm-editor-skeleton" style={{ height: 200 }} />;

  return (
    <div className="fm-dashboard-admins-tab">
      <div className="fm-dashboard-section-header">
        <strong>Administradores</strong>
        <small>Usuários com acesso ao painel.</small>
        <button className="fm-button fm-button--gradient" onClick={() => setShowForm((c) => !c)} style={{ marginLeft: 'auto' }} type="button">
          <Icon name="plus" size={14} />
          <span>Adicionar admin</span>
        </button>
      </div>

      {showForm ? (
        <div className="fm-dashboard-admin-form">
          <div className="fm-dashboard-form-grid">
            <label className="fm-dashboard-form-field"><span>Nome</span><input onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))} placeholder="Nome" value={form.name} /></label>
            <label className="fm-dashboard-form-field"><span>Email</span><input onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))} placeholder="email@dominio.com" type="email" value={form.email} /></label>
            <label className="fm-dashboard-password-field">
              <span>Senha</span>
              <div>
                <input onChange={(e) => setForm((c) => ({ ...c, password: e.target.value }))} placeholder="Senha inicial" type={showPass ? 'text' : 'password'} value={form.password} />
                <button aria-label="toggle" onClick={() => setShowPass((c) => !c)} type="button"><Icon name="eye" size={14} /></button>
              </div>
            </label>
            <label className="fm-dashboard-form-field">
              <span>Função</span>
              <select onChange={(e) => setForm((c) => ({ ...c, role: e.target.value }))} value={form.role}>
                <option value="admin">Admin</option>
                <option value="teacher">Instrutor</option>
              </select>
            </label>
          </div>
          <div className="fm-dashboard-profile-actions">
            <button className="fm-button fm-button--ghost" onClick={() => setShowForm(false)} type="button">Cancelar</button>
            <button className="fm-button fm-button--gradient" disabled={submitting || !form.name || !form.email || !form.password} onClick={handleAdd} type="button">{submitting ? 'Criando...' : 'Criar admin'}</button>
          </div>
        </div>
      ) : null}

      <div className="fm-dashboard-admins-list">
        {(admins || []).map((admin) => (
          <article className="fm-dashboard-admin-row" key={admin.id}>
            <div className="fm-dashboard-admin-avatar">
              {admin.photo_url ? <img alt="" src={admin.photo_url} /> : <span>{String(admin.name || '?')[0].toUpperCase()}</span>}
            </div>
            <div className="fm-dashboard-admin-info">
              <strong>{admin.name}</strong>
              <small>{admin.email}</small>
            </div>
            <span className="fm-status-badge is-gray">{admin.role === 'admin' ? 'Admin' : 'Instrutor'}</span>
            <button className="fm-icon-button" onClick={() => onDelete(admin.id)} title="Remover admin" type="button">
              <Icon name="trash" size={15} />
            </button>
          </article>
        ))}
        {!(admins || []).length ? <p style={{ color: 'var(--fm-text-3)', padding: '1rem' }}>Nenhum admin adicional cadastrado.</p> : null}
      </div>
    </div>
  );
}

// ─── main module ──────────────────────────────────────────────────────────────

export default function CloudDashboardModule() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState(null);
  const [profileForm, setProfileForm] = useState({ name: '', email: '', password: '' });
  const [styleForm, setStyleForm] = useState({ color_mode: 'single', default_theme: 'dark', primary_color: '#ff3d73', secondary_color: '#ff7a45', nav_menu: normalizeMenu() });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => { loadSettings(); }, []);

  async function loadSettings() {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/api/dashboard/settings');
      setSettings(data);
      setProfileForm({ name: data?.profile?.name || '', email: data?.profile?.email || '', password: '' });
      if (data?.style) {
        setStyleForm({ ...data.style, nav_menu: normalizeMenu(data.style.nav_menu) });
      }
    } catch (err) {
      setError(err.message || 'Não foi possível carregar o painel.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(key) {
    setSaving(key);
    setError('');
    setMessage('');
    try {
      if (key === 'profile') {
        const payload = { ...profileForm };
        if (!payload.password) delete payload.password;
        await apiFetch('/api/dashboard/profile', { method: 'POST', body: JSON.stringify(payload) });
        setProfileForm((c) => ({ ...c, password: '' }));
        setMessage('Perfil atualizado com sucesso.');
      }
      if (key === 'style') {
        await apiFetch('/api/dashboard/style', { method: 'POST', body: JSON.stringify(styleForm) });
        setMessage('Estilo salvo com sucesso.');
      }
    } catch (err) {
      setError(err.message || 'Nao foi possivel salvar.');
    } finally {
      setSaving('');
    }
  }

  async function handleAddAdmin(form) {
    setError('');
    try {
      await apiFetch('/api/dashboard/admins', { method: 'POST', body: JSON.stringify(form) });
      setMessage('Admin adicionado.');
      await loadSettings();
    } catch (err) {
      setError(err.message || 'Nao foi possivel adicionar admin.');
      throw err;
    }
  }

  async function handleDeleteAdmin(id) {
    if (!window.confirm('Remover este administrador?')) return;
    setError('');
    try {
      await apiFetch(`/api/dashboard/admins/${id}`, { method: 'DELETE' });
      setMessage('Admin removido.');
      await loadSettings();
    } catch (err) {
      setError(err.message || 'Nao foi possivel remover admin.');
    }
  }

  return (
    <section className="fm-dashboard-screen">
      <div className="fm-dashboard-surface">
        <nav className="fm-dashboard-subnav">
          {SUBSECTIONS.map((s) => (
            <button className={`fm-dashboard-subnav-item ${activeTab === s.id ? 'is-active' : ''}`} key={s.id} onClick={() => setActiveTab(s.id)} type="button">
              <Icon name={s.icon} size={14} />
              <span>{s.label}</span>
            </button>
          ))}
        </nav>

        <div className="fm-dashboard-content">
          {error ? <div className="fm-admin-alert fm-admin-alert--error">{error}</div> : null}
          {message ? <div className="fm-admin-alert fm-admin-alert--success">{message}</div> : null}

          {activeTab === 'general' ? (
            <GeneralTab loading={loading} onChange={(patch) => setProfileForm((c) => ({ ...c, ...patch }))} onSave={handleSave} profile={profileForm} saving={saving} />
          ) : null}

          {activeTab === 'style' ? (
            <StyleTab onChange={(patch) => setStyleForm((c) => ({ ...c, ...patch }))} onSave={handleSave} saving={saving} style={styleForm} />
          ) : null}

          {activeTab === 'admins' ? (
            <AdminsTab admins={settings?.admins} loading={loading} onAdd={handleAddAdmin} onDelete={handleDeleteAdmin} />
          ) : null}
        </div>
      </div>
    </section>
  );
}
