import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../lib/api';

// ─── logos ────────────────────────────────────────────────────────────────────

function MercadoPagoLogo() {
  return (
    <svg viewBox="0 0 64 44" aria-hidden="true">
      <rect fill="#e7f7ff" height="44" rx="22" width="64" />
      <path d="M11 23c4.4-9 12.1-13.6 21.2-13.6S49 14 53 23c-4.1 8.8-11.8 13.4-20.8 13.4S15.4 31.8 11 23Z" fill="#009ee3" />
      <path d="M18.3 23.1c3.3-5.5 8-8.2 13.9-8.2 5.9 0 10.6 2.7 13.7 8.2-3.2 5.5-7.8 8.1-13.7 8.1-5.9 0-10.6-2.7-13.9-8.1Z" fill="#fff" />
      <path d="M22.6 22.6c2.7-2.6 5-3.3 7.1-2.1l2.2 1.2 2.4-1.3c2.2-1.1 4.5-.4 7.1 2.2-1.1 1.5-2.5 2.2-4.2 2.2-1.3 0-2.5-.4-3.7-1.2l-1.5-.9-1.5.9c-1.2.8-2.4 1.2-3.7 1.2-1.7 0-3.1-.7-4.2-2.2Z" fill="#009ee3" />
      <path d="M26.1 27.1h11.8" stroke="#009ee3" strokeLinecap="round" strokeWidth="2.2" />
    </svg>
  );
}

function PagarmeLogo() {
  return (
    <svg viewBox="0 0 52 52" aria-hidden="true">
      <rect fill="#edfdf3" height="52" rx="14" width="52" />
      <path d="M16 17.5h14.6c5.3 0 8.4 3 8.4 7.6s-3.1 7.6-8.4 7.6H23v5.8h-7V17.5Zm7 6v3.5h7.1c1.2 0 2-.7 2-1.8 0-1-.8-1.7-2-1.7H23Z" fill="#16a34a" />
    </svg>
  );
}

function SmtpLogo() {
  return (
    <svg viewBox="0 0 52 52" aria-hidden="true">
      <rect fill="#ecfdf5" height="52" rx="14" width="52" />
      <path d="M12 18.5A4.5 4.5 0 0 1 16.5 14h19A4.5 4.5 0 0 1 40 18.5v15A4.5 4.5 0 0 1 35.5 38h-19A4.5 4.5 0 0 1 12 33.5v-15Z" fill="#0f766e" />
      <path d="m15 19 11 8 11-8" fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
    </svg>
  );
}

function WhatsAppLogo() {
  return (
    <svg viewBox="0 0 52 52" aria-hidden="true">
      <rect fill="#ecfdf3" height="52" rx="14" width="52" />
      <path d="M13 39.5 15.2 32A15 15 0 1 1 20 36.8l-7 2.7Z" fill="#22c55e" />
      <path d="M22.2 18.8c-.4-.9-.9-.9-1.3-.9h-1.1c-.4 0-1 .1-1.5.7s-2 2-2 4.8 2.1 5.6 2.4 6c.3.4 4.1 6.5 10.2 8.8 5 1.9 6 .9 7.1.8s3.5-1.4 4-2.8c.5-1.4.5-2.6.3-2.8-.1-.3-.5-.4-1.1-.7l-3.8-1.9c-.6-.2-1-.4-1.4.3-.4.6-1.6 1.9-1.9 2.3-.4.4-.7.4-1.3.1-.6-.3-2.5-.9-4.7-2.9-1.7-1.5-2.9-3.4-3.3-4-.3-.6 0-.9.3-1.2.3-.3.6-.7.9-1 .3-.4.4-.6.6-1 .2-.4.1-.8-.1-1.1l-1.8-3.5Z" fill="#fff" />
    </svg>
  );
}

function HotmartLogo() {
  return (
    <svg viewBox="0 0 52 52" aria-hidden="true">
      <rect fill="#fff3e8" height="52" rx="14" width="52" />
      <path d="M28.8 8.8c1.6 8-6.9 9.9-5.1 16.1 1.6-3.1 4.3-5.2 7.6-6.4-.1 5.5 7.1 8.2 7.1 15 0 7.1-5.6 11.1-12.1 11.1-6.7 0-12.7-4.4-12.7-11.8 0-7 5.5-10.9 8.1-15.4 1.6-2.9 2.1-6.1 1.7-9.8 2.2.4 4 1.1 5.4 1.2Z" fill="#f97316" />
      <path d="M25.9 38.6c-3 0-5.3-2-5.3-4.9 0-2.5 1.8-4 3.2-5.8.7 2.8 3.7 3.5 4.6 6 .7 2.1-.5 4.7-2.5 4.7Z" fill="#fff" opacity=".9" />
    </svg>
  );
}

function AsaasLogo() {
  return (
    <svg viewBox="0 0 52 52" aria-hidden="true">
      <rect fill="#eef4ff" height="52" rx="14" width="52" />
      <path d="M15 17c5.8-3.2 12.8-.8 16 4.8 2.8-4.8 7.2-6.1 11-3.8-1 9.9-6.2 16.8-14.8 19.7C20 35.2 15.4 28.5 15 17Z" fill="#145df5" />
      <path d="M15 17c2.3 9 7.2 15 12.2 20.7C19.7 35.2 11.6 29.7 10 20.2c1.5-1.5 3.2-2.6 5-3.2Z" fill="#3f7cff" />
    </svg>
  );
}

function IntegrationLogo({ provider, className = '' }) {
  const id = typeof provider === 'string' ? provider : provider?.logo || provider?.provider || '';
  const name = typeof provider === 'string' ? provider : provider?.name || provider?.provider_name || '';

  return (
    <span aria-label={name || id} className={`fm-integration-logo is-${id} ${className}`}>
      {id === 'mercadopago' && <MercadoPagoLogo />}
      {id === 'pagarme' && <PagarmeLogo />}
      {id === 'smtp' && <SmtpLogo />}
      {id === 'whatsapp' && <WhatsAppLogo />}
      {id === 'hotmart' && <HotmartLogo />}
      {id === 'asaas' && <AsaasLogo />}
      {!['mercadopago', 'pagarme', 'smtp', 'whatsapp', 'hotmart', 'asaas'].includes(id) && (
        <span style={{ fontWeight: 700, fontSize: '1rem' }}>{String(name || id || '?').slice(0, 2).toUpperCase()}</span>
      )}
    </span>
  );
}

// ─── sub-components ───────────────────────────────────────────────────────────

const STATUS_LABELS = { connected: 'Conectado', active: 'Ativo', pending: 'Pendente', disabled: 'Desativado', error: 'Erro' };

function IntegrationStatusBadge({ status = 'pending' }) {
  const mapped = status === 'connected' || status === 'active' ? 'connected' : status;
  return <span className={`fm-integration-status is-${mapped}`}>{STATUS_LABELS[mapped] || status}</span>;
}

function IntegrationCard({ integration, onAction }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <article className="fm-integration-saved-card">
      <div className="fm-integration-saved-card__logo" style={{ '--integration-accent': integration.provider_accent || '#ec245c' }}>
        <IntegrationLogo provider={{ logo: integration.provider, provider: integration.provider, provider_name: integration.provider_name || integration.provider }} />
      </div>
      <div className="fm-integration-saved-card__body">
        <strong>{integration.name || integration.provider_name || integration.provider}</strong>
        <IntegrationStatusBadge status={integration.status} />
        <span>{integration.environment === 'production' ? 'Produção' : 'Teste'}</span>
      </div>
      <div className="fm-integration-saved-card__menu">
        <button aria-label="Ações" onClick={() => setMenuOpen((c) => !c)} type="button">•••</button>
        {menuOpen ? (
          <div onClick={() => setMenuOpen(false)}>
            <button onClick={() => onAction?.('edit', integration)} type="button">Editar</button>
            <button onClick={() => onAction?.('test', integration)} type="button">Testar</button>
            <button onClick={() => onAction?.('delete', integration)} type="button">Remover</button>
          </div>
        ) : null}
      </div>
    </article>
  );
}

// ─── SMTP form ────────────────────────────────────────────────────────────────

const defaultSmtpForm = {
  provider: 'smtp', name: 'SMTP', host: '', port: 587, encryption: 'tls', auth: true,
  username: '', password: '', from_email: '', from_name: '', reply_to: '', test_email: '',
  auto_tls: true, return_path: false, timeout: 20, enabled: true,
};

function SmtpForm({ form, onChange, onTest }) {
  const [testing, setTesting] = useState(false);
  const [testMsg, setTestMsg] = useState('');
  const [testErr, setTestErr] = useState('');
  const set = (field, value) => onChange?.({ [field]: value });
  async function runTest() {
    setTesting(true); setTestMsg(''); setTestErr('');
    try { const r = await onTest?.({ ...defaultSmtpForm, ...form, provider: 'smtp' }); setTestMsg(r?.message || 'E-mail de teste enviado.'); }
    catch (err) { setTestErr(err.message || 'Nao foi possivel testar o SMTP.'); }
    finally { setTesting(false); }
  }
  return (
    <div className="fm-integration-config-form fm-smtp-form">
      <div className="fm-integration-config-form__header"><h3>SMTP</h3><p>Configure qualquer servidor SMTP.</p></div>
      <div className="fm-smtp-grid">
        <label className="is-wide"><span>Nome</span><input onChange={(e) => set('name', e.target.value)} placeholder="SMTP principal" value={form.name || ''} /></label>
        <label className="is-wide"><span>Servidor SMTP</span><input onChange={(e) => set('host', e.target.value)} placeholder="smtp.dominio.com" value={form.host || ''} /></label>
        <label><span>Porta</span><input inputMode="numeric" onChange={(e) => set('port', e.target.value.replace(/\D/g, ''))} placeholder="587" value={form.port || ''} /></label>
        <label><span>Criptografia</span>
          <select onChange={(e) => set('encryption', e.target.value)} value={form.encryption || 'tls'}>
            <option value="tls">TLS</option><option value="ssl">SSL</option><option value="none">Nenhuma</option>
          </select>
        </label>
        <label className="is-wide"><span>Usuário</span><input onChange={(e) => set('username', e.target.value)} placeholder="email@dominio.com" value={form.username || ''} /></label>
        <label className="is-wide"><span>Senha</span><input onChange={(e) => set('password', e.target.value)} placeholder="Senha" type="password" value={form.password || ''} /></label>
        <label><span>E-mail remetente</span><input onChange={(e) => set('from_email', e.target.value)} placeholder="contato@dominio.com" type="email" value={form.from_email || ''} /></label>
        <label><span>Nome remetente</span><input onChange={(e) => set('from_name', e.target.value)} placeholder="Sua plataforma" value={form.from_name || ''} /></label>
        <label><span>Responder para</span><input onChange={(e) => set('reply_to', e.target.value)} placeholder="suporte@dominio.com" type="email" value={form.reply_to || ''} /></label>
        <label><span>E-mail de teste</span><input onChange={(e) => set('test_email', e.target.value)} placeholder="voce@dominio.com" type="email" value={form.test_email || ''} /></label>
      </div>
      <div className="fm-smtp-switches">
        <label><input checked={form.enabled !== false} onChange={(e) => set('enabled', e.target.checked)} type="checkbox" /><span>Ativar SMTP</span></label>
        <label><input checked={form.auth !== false} onChange={(e) => set('auth', e.target.checked)} type="checkbox" /><span>Usar autenticação</span></label>
        <label><input checked={form.auto_tls !== false} onChange={(e) => set('auto_tls', e.target.checked)} type="checkbox" /><span>Auto TLS</span></label>
      </div>
      <div className="fm-smtp-test-row">
        <button disabled={testing} onClick={runTest} type="button">{testing ? 'Testando...' : 'Enviar teste'}</button>
        {testMsg ? <span className="is-success">{testMsg}</span> : null}
        {testErr ? <span className="is-error">{testErr}</span> : null}
      </div>
    </div>
  );
}

// ─── MercadoPago form ─────────────────────────────────────────────────────────

const defaultMercadoPagoForm = {
  provider: 'mercadopago', name: 'Mercado Pago', environment: 'production', auth_mode: 'oauth',
  webhook_url: '', payment_methods: ['card', 'pix', 'boleto'], financing_mode: 'mercadopago', enabled: true,
};

function MercadoPagoForm({ form, onChange }) {
  const mode = form.financing_mode === 'free_members' ? 'free_members' : 'mercadopago';
  return (
    <div className="fm-integration-config-form fm-mp-oauth-only">
      <div className="fm-integration-config-form__header"><h3>Mercado Pago</h3><p>Defina como os juros de parcelamento são calculados.</p></div>
      <div className="fm-mp-financing-options">
        <button className={mode === 'mercadopago' ? 'is-active' : ''} onClick={() => onChange?.({ financing_mode: 'mercadopago' })} type="button">
          <strong>Juros calculado pelo Mercado Pago</strong>
          <span>Padrão. A plataforma usa as condições da integração do Mercado Pago.</span>
        </button>
        <button className={mode === 'free_members' ? 'is-active' : ''} onClick={() => onChange?.({ financing_mode: 'free_members' })} type="button">
          <strong>Juros calculado pela Free Members</strong>
          <span>Você define taxa, parcelas sem juros e parcela padrão no builder de checkout.</span>
        </button>
      </div>
      {mode === 'free_members' ? (
        <div className="fm-mp-financing-alert">
          <strong>Atenção</strong>
          <p>Habilite "Oferecer parcelado vendedor" no Mercado Pago para não duplicar os juros.</p>
        </div>
      ) : null}
    </div>
  );
}

// ─── Pagar.me form ────────────────────────────────────────────────────────────

const defaultPagarmeForm = {
  provider: 'pagarme', name: 'Pagar.me', payment_methods: ['credit_card', 'pix', 'boleto'], enabled: true,
};

const PAGARME_METHOD_LABELS = { credit_card: 'Cartão', pix: 'Pix', boleto: 'Boleto' };

function PagarmeForm({ form }) {
  const methods = Array.isArray(form?.payment_methods) && form.payment_methods.length ? form.payment_methods : ['credit_card', 'pix', 'boleto'];
  return (
    <div className="fm-integration-config-form fm-mp-oauth-only">
      <div className="fm-integration-config-form__header"><h3>Pagar.me</h3><p>A conexão é feita pelo Pagar.me Hub. Nenhuma chave precisa ser preenchida.</p></div>
      <div className="fm-mp-oauth-panel">
        <strong>Conexão segura</strong>
        <p>Ao continuar, o painel Pagar.me abrirá em nova aba para autorização automática.</p>
      </div>
      <div className="fm-mp-summary-list">
        <div><span>Métodos habilitados</span><strong>{methods.map((m) => PAGARME_METHOD_LABELS[m] || m).join(', ')}</strong></div>
      </div>
    </div>
  );
}

// ─── provider grid ────────────────────────────────────────────────────────────

const SECTION_LABELS = { payments: 'Gateways', checkouts: 'Checkouts', messages: 'Mensagens' };

function ProviderCard({ provider, selected, onSelect }) {
  return (
    <button
      className={`fm-provider-card ${selected ? 'is-selected' : ''} ${provider.status !== 'available' ? 'is-soon' : ''}`}
      onClick={() => onSelect(provider)}
      type="button"
    >
      <span className="fm-provider-card__logo" style={{ '--integration-accent': provider.accent || '#ec245c' }}>
        <IntegrationLogo provider={provider} />
      </span>
      <strong>{provider.name}</strong>
      {selected ? <span className="fm-provider-card__check">✓</span> : null}
    </button>
  );
}

function ProviderGrid({ providers = [], selectedProvider, onSelect }) {
  const sections = ['payments', 'checkouts', 'messages']
    .map((cat) => ({ cat, items: providers.filter((p) => p.category === cat) }))
    .filter((s) => s.items.length);
  return (
    <div className="fm-provider-grid">
      {sections.map((section) => (
        <section className="fm-provider-section" key={section.cat}>
          <span>{SECTION_LABELS[section.cat] || section.cat}</span>
          <div>
            {section.items.map((p) => <ProviderCard key={p.id} onSelect={onSelect} provider={p} selected={selectedProvider?.id === p.id} />)}
          </div>
        </section>
      ))}
      {!providers.length ? <p className="fm-provider-empty">Nenhuma integração encontrada.</p> : null}
    </div>
  );
}

// ─── config form ──────────────────────────────────────────────────────────────

function ConfigForm({ form, onChange, onOAuthStart, onTest, provider }) {
  if (!provider) return null;
  if (provider.id === 'mercadopago') return <MercadoPagoForm form={form} onChange={onChange} onOAuthStart={onOAuthStart} />;
  if (provider.id === 'pagarme') return <PagarmeForm form={form} />;
  if (provider.id === 'smtp') return <SmtpForm form={form} onChange={onChange} onTest={onTest} />;
  return <div className="fm-integration-coming-soon"><h3>{provider.name}</h3><p>Em breve disponível.</p></div>;
}

// ─── modal ────────────────────────────────────────────────────────────────────

function defaultFormForProvider(id) {
  if (id === 'pagarme') return defaultPagarmeForm;
  if (id === 'smtp') return defaultSmtpForm;
  return defaultMercadoPagoForm;
}

function formFromIntegration(integration, providers) {
  if (!integration) return defaultMercadoPagoForm;
  if (integration.provider === 'pagarme') return { ...defaultPagarmeForm, provider: 'pagarme', name: integration.name || 'Pagar.me', enabled: integration.status === 'connected' };
  if (integration.provider === 'smtp') {
    const s = integration.settings || {};
    return { ...defaultSmtpForm, provider: 'smtp', name: integration.name || 'SMTP', host: s.host || '', port: s.port || 587, encryption: s.encryption || 'tls', auth: s.auth !== false, username: s.username || '', from_email: s.from_email || '', from_name: s.from_name || '', reply_to: s.reply_to || '', enabled: integration.status === 'connected' };
  }
  return { ...defaultMercadoPagoForm, provider: integration.provider, name: integration.name || integration.provider, environment: integration.environment || 'production', financing_mode: integration.settings?.financing_mode || 'mercadopago', enabled: integration.status === 'connected' };
}

function CreateIntegrationModal({ creating, editingIntegration, error, onClose, onCreate, onOAuthStart, onTest, onUpdate, providers }) {
  const editing = Boolean(editingIntegration);
  const initialProvider = editing ? (providers || []).find((p) => p.id === editingIntegration.provider) || null : null;
  const [step, setStep] = useState(editing ? 'config' : 'choose');
  const [query, setQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState(initialProvider);
  const [form, setForm] = useState(editing ? formFromIntegration(editingIntegration, providers) : defaultMercadoPagoForm);

  const filteredProviders = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? (providers || []).filter((p) => `${p.name} ${p.category}`.toLowerCase().includes(q)) : (providers || []);
  }, [providers, query]);

  function handleFormChange(patch) { setForm((c) => ({ ...c, ...patch })); }

  function selectProvider(provider) { setSelectedProvider(provider); setForm(defaultFormForProvider(provider.id)); }

  function connectOAuth(provider = 'mercadopago') {
    const payload = provider === 'pagarme' ? { ...defaultPagarmeForm, ...form, provider: 'pagarme' } : { ...defaultMercadoPagoForm, ...form, provider: 'mercadopago', auth_mode: 'oauth' };
    onOAuthStart(payload);
  }

  function nextStep() {
    if (!selectedProvider || selectedProvider.status !== 'available') return;
    if (selectedProvider.id === 'mercadopago') { connectOAuth('mercadopago'); return; }
    if (selectedProvider.id === 'pagarme') { connectOAuth('pagarme'); return; }
    setStep('config');
  }

  function submit() {
    if (!selectedProvider || selectedProvider.status !== 'available') return;
    if (selectedProvider.id === 'mercadopago') { connectOAuth('mercadopago'); return; }
    if (selectedProvider.id === 'pagarme') { connectOAuth('pagarme'); return; }
    const payload = { ...form, provider: selectedProvider.id };
    if (editing) { onUpdate(editingIntegration.id, payload); } else { onCreate(payload); }
  }

  const canAdvance = selectedProvider?.status === 'available';
  const isOAuth = selectedProvider?.id === 'mercadopago' || selectedProvider?.id === 'pagarme';
  const title = editing ? 'Editar integração' : 'Nova integração';

  return (
    <div className="fm-integrations-overlay" role="presentation">
      <div aria-label={title} aria-modal="true" className="fm-create-integration-modal" role="dialog">
        <header className="fm-create-integration-modal__header">
          <div><h2>{title}</h2><p>{editing ? 'Reconecte ou revise a integração.' : 'Escolha um serviço para conectar.'}</p></div>
          <button aria-label="Fechar" onClick={onClose} type="button">×</button>
        </header>

        {step === 'choose' ? (
          <>
            <label className="fm-integration-search">
              <span aria-hidden="true">⌕</span>
              <input onChange={(e) => setQuery(e.target.value)} placeholder="Buscar integração..." value={query} />
            </label>
            <ProviderGrid onSelect={selectProvider} providers={filteredProviders} selectedProvider={selectedProvider} />
          </>
        ) : null}

        {step === 'config' ? (
          <ConfigForm form={form} onChange={handleFormChange} onOAuthStart={onOAuthStart} onTest={onTest} provider={selectedProvider} />
        ) : null}

        {error ? <div className="fm-integration-modal-error">{error}</div> : null}

        <footer className="fm-create-integration-modal__footer">
          {step === 'choose' ? <button onClick={onClose} type="button">Cancelar</button> : null}
          {step === 'config' && !editing ? <button onClick={() => setStep('choose')} type="button">Voltar</button> : null}
          {step === 'config' && editing ? <button onClick={onClose} type="button">Cancelar</button> : null}
          {step === 'choose' ? (
            <button disabled={!canAdvance || creating} onClick={nextStep} type="button">
              {creating ? 'Abrindo...' : (isOAuth ? 'Conectar' : 'Avançar')}
            </button>
          ) : (
            <button disabled={!canAdvance || creating} onClick={submit} type="button">
              {creating ? 'Salvando...' : (editing ? 'Salvar alterações' : 'Criar integração')}
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}

// ─── integration icon ─────────────────────────────────────────────────────────

function IntegrationsIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 10V3L4 14h7v7l9-11h-7Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

// ─── main module ──────────────────────────────────────────────────────────────

const INTEGRATION_SECTIONS = [
  { id: 'payments', label: 'Gateways' },
  { id: 'checkouts', label: 'Checkouts' },
  { id: 'messages', label: 'Mensagens' },
];

export default function CloudIntegrationsModule() {
  const [integrations, setIntegrations] = useState([]);
  const [providers, setProviders] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [modalError, setModalError] = useState('');

  async function loadData() {
    setError('');
    try {
      const [intData, provData] = await Promise.all([
        apiFetch('/api/integrations'),
        apiFetch('/api/integrations/providers'),
      ]);
      setIntegrations(Array.isArray(intData?.items) ? intData.items : (Array.isArray(intData) ? intData : []));
      setProviders(Array.isArray(provData?.providers) ? provData.providers : (Array.isArray(provData) ? provData : []));
    } catch (err) {
      setError(err.message || 'Falha ao carregar integrações.');
    }
  }

  useEffect(() => { loadData(); }, []);

  async function handleOAuthStart(payload) {
    setCreating(true);
    setModalError('');
    try {
      const providerKey = payload?.provider || 'mercadopago';
      const endpointMap = { mercadopago: '/api/integrations/mercadopago/oauth/start', pagarme: '/api/integrations/pagarme/hub/start' };
      const endpoint = endpointMap[providerKey];
      if (!endpoint) throw new Error('Provider nao suportado.');
      const data = await apiFetch(endpoint, { method: 'POST', body: JSON.stringify(payload) });
      if (data?.auth_url) {
        window.open(data.auth_url, '_blank', 'noopener,noreferrer');
        setModalOpen(false);
        setEditingIntegration(null);
        setMessage(`Autorização aberta. Conclua o acesso e volte para esta tela.`);
        return data;
      }
      throw new Error('URL de autorização não recebida.');
    } catch (err) {
      setModalError(err.message || 'Não foi possível iniciar a conexão.');
      throw err;
    } finally {
      setCreating(false);
    }
  }

  async function createIntegration(payload) {
    setCreating(true);
    setModalError('');
    try {
      const created = await apiFetch('/api/integrations', { method: 'POST', body: JSON.stringify(payload) });
      setModalOpen(false);
      setMessage('Integração criada com sucesso.');
      await loadData();
      return created;
    } catch (err) {
      setModalError(err.message || 'Não foi possível criar integração.');
    } finally {
      setCreating(false);
    }
  }

  async function updateIntegration(id, payload) {
    setCreating(true);
    setModalError('');
    try {
      await apiFetch(`/api/integrations/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      setModalOpen(false);
      setEditingIntegration(null);
      setMessage('Integração atualizada.');
      await loadData();
    } catch (err) {
      setModalError(err.message || 'Não foi possível atualizar integração.');
    } finally {
      setCreating(false);
    }
  }

  async function testSmtp(payload) {
    return await apiFetch('/api/integrations/smtp/test', { method: 'POST', body: JSON.stringify(payload) });
  }

  async function handleAction(action, integration) {
    setMessage('');
    setError('');
    try {
      if (action === 'test') {
        await apiFetch(`/api/integrations/${integration.id}/test`, { method: 'POST', body: JSON.stringify({}) });
        setMessage('Conexão testada com sucesso.');
      }
      if (action === 'delete') {
        await apiFetch(`/api/integrations/${integration.id}`, { method: 'DELETE' });
        setIntegrations((current) => current.filter((item) => item.id !== integration.id));
        setMessage('Integração removida.');
      }
      if (action === 'edit') {
        setModalError('');
        setEditingIntegration(integration);
        setModalOpen(true);
      }
    } catch (err) {
      setError(err.message || 'Ação não concluída.');
    }
  }

  const providerById = useMemo(() => providers.reduce((map, p) => ({ ...map, [p.id]: p }), {}), [providers]);
  const integrationSections = useMemo(() => INTEGRATION_SECTIONS
    .map((section) => ({
      ...section,
      integrations: integrations.filter((integration) => {
        const provider = providerById[integration.provider];
        return provider ? provider.category === section.id : false;
      }),
    }))
    .filter((s) => s.integrations.length), [integrations, providerById]);

  return (
    <section className="fm-integrations-page">
      <div className="fm-integrations-surface">
        <header className="fm-catalog-header fm-integrations-surface__header">
          <div className="fm-catalog-header__title">
            <span className="fm-catalog-header__icon" aria-hidden="true"><IntegrationsIcon /></span>
            <div>
              <h3>Integrações</h3>
              <p>Conecte serviços, gateways e automações da sua plataforma.</p>
            </div>
          </div>
          <button className="fm-button fm-button--gradient" onClick={() => { setModalError(''); setEditingIntegration(null); setModalOpen(true); }} type="button">
            <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" viewBox="0 0 24 24" width="14"><path d="M12 5v14M5 12h14" /></svg>
            <span>Nova integração</span>
          </button>
        </header>

        {message ? <div className="fm-sales-notice is-success">{message}</div> : null}
        {error ? <div className="fm-sales-notice is-error">{error}</div> : null}

        {integrations.length > 0 ? (
          <div className="fm-integrations-sections">
            {integrationSections.length > 0 ? integrationSections.map((section) => (
              <section className="fm-integrations-section" key={section.id}>
                <span>{section.label}</span>
                <div className="fm-integrations-grid">
                  {section.integrations.map((integration) => (
                    <IntegrationCard integration={integration} key={integration.id} onAction={handleAction} />
                  ))}
                </div>
              </section>
            )) : (
              integrations.map((integration) => (
                <IntegrationCard integration={integration} key={integration.id} onAction={handleAction} />
              ))
            )}
          </div>
        ) : (
          <div className="fm-empty-state fm-empty-state--students">
            <div className="fm-empty-state__content">
              <div className="fm-empty-state__icon" aria-hidden="true"><IntegrationsIcon /></div>
              <h4>Nenhuma integração criada</h4>
              <p>Clique em Nova integração para conectar o primeiro serviço.</p>
            </div>
          </div>
        )}
      </div>

      {modalOpen ? (
        <CreateIntegrationModal
          creating={creating}
          editingIntegration={editingIntegration}
          error={modalError}
          onClose={() => { setModalOpen(false); setEditingIntegration(null); }}
          onCreate={createIntegration}
          onOAuthStart={handleOAuthStart}
          onTest={testSmtp}
          onUpdate={updateIntegration}
          providers={providers}
        />
      ) : null}
    </section>
  );
}
