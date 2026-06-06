import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';

function money(value, currency = 'BRL') {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
}

const STATUS_LABELS = { pending: 'Pendente', paid: 'Pago', approved: 'Aprovado', failed: 'Falhou', refunded: 'Reembolsado', cancelled: 'Cancelado' };
const STATUS_TONES = { paid: 'green', approved: 'green', pending: 'yellow', failed: 'red', refunded: 'gray', cancelled: 'gray' };

export default function CloudSalesModule() {
  const [tab, setTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { loadOrders(); }, []);

  async function loadOrders() {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/api/orders');
      const list = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
      setOrders(list);
    } catch (err) {
      setError(err.message || 'Falha ao carregar pedidos.');
    } finally {
      setLoading(false);
    }
  }

  const totalRevenue = orders.filter((o) => o.status === 'paid' || o.status === 'approved').reduce((sum, o) => sum + Number(o.amount || 0), 0);
  const pendingCount = orders.filter((o) => o.status === 'pending').length;

  return (
    <section className="fm-sales-screen">
      <header className="fm-sales-header">
        <div>
          <span>Vendas</span>
          <h1>Pagamentos nativos</h1>
        </div>
        <div className="fm-sales-tabs">
          {['orders'].map((item) => (
            <button className={tab === item ? 'is-active' : ''} key={item} onClick={() => setTab(item)} type="button">
              {item === 'orders' ? 'Pedidos' : item}
            </button>
          ))}
        </div>
      </header>

      {error ? <div className="fm-sales-notice is-error">{error}</div> : null}

      <div className="fm-sales-summary">
        <div className="fm-sales-summary-card">
          <span>Receita aprovada</span>
          <strong>{money(totalRevenue)}</strong>
        </div>
        <div className="fm-sales-summary-card">
          <span>Pedidos pendentes</span>
          <strong>{pendingCount}</strong>
        </div>
        <div className="fm-sales-summary-card">
          <span>Total de pedidos</span>
          <strong>{orders.length}</strong>
        </div>
      </div>

      {tab === 'orders' ? (
        <div className="fm-sales-panel">
          <h2>Pedidos recentes</h2>
          {loading ? (
            <div className="fm-editor-skeleton" style={{ height: 200 }} />
          ) : (
            <div className="fm-sales-table">
              <div className="is-head">
                <span>Pedido</span>
                <span>Cliente</span>
                <span>Checkout</span>
                <span>Método</span>
                <span>Status</span>
                <span>Total</span>
                <span>Data</span>
              </div>
              {orders.map((order) => (
                <div key={order.id}>
                  <span>
                    <strong>#{order.id}</strong>
                    {order.gateway_order_id ? <small>{order.gateway_order_id}</small> : null}
                  </span>
                  <span>
                    {order.student_name || order.student_email || '—'}
                    {order.student_email ? <small>{order.student_email}</small> : null}
                  </span>
                  <span>{order.checkout_name || '—'}</span>
                  <span>{order.payment_method === 'pix' ? 'Pix' : order.payment_method === 'boleto' ? 'Boleto' : 'Cartão'}</span>
                  <span>
                    <b className={`is-${STATUS_TONES[order.status] || 'gray'}`} style={{ background: 'transparent' }}>
                      <span className={`fm-status-badge is-${STATUS_TONES[order.status] || 'gray'}`}>{STATUS_LABELS[order.status] || order.status}</span>
                    </b>
                  </span>
                  <span>{money(order.amount, order.currency)}</span>
                  <span><small>{formatDate(order.created_at)}</small></span>
                </div>
              ))}
              {!orders.length ? (
                <div className="fm-empty-state" style={{ padding: '3rem 1rem', textAlign: 'center' }}>
                  <p>Nenhum pedido registrado ainda.</p>
                  <small>Os pedidos aparecerão aqui quando clientes comprarem via checkout.</small>
                </div>
              ) : null}
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}
