'use client';

import { useEffect, useState } from 'react';
import './test.css';

const FUELS = ['Diesel', 'Super E5', 'Super E10'];
const LEVEL_LABEL = { cheap: 'Rẻ', average: 'TB', expensive: 'Đắt' };

const TABS = [
  { key: 'current', label: 'Giá hiện tại', path: (id) => `/api/prices/${id}/current` },
  { key: 'detail', label: 'Chi tiết trạm', path: (id) => `/api/stations/${id}` },
];

async function call(method, url) {
  const started = performance.now();
  try {
    const res = await fetch(url, { method });
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }
    return { method, url, status: res.status, ms: Math.round(performance.now() - started), data };
  } catch (err) {
    return { method, url, status: 0, ms: Math.round(performance.now() - started), data: { error: err.message } };
  }
}

function stationTitle(s) {
  const name = s.name || '';
  const brandInName = s.brand && name.toLowerCase().includes(s.brand.toLowerCase());
  return brandInName ? name : `${s.brand || ''} ${name}`.trim();
}

const euro = (n) => (n != null ? `${n.toFixed(3)} €` : '—');
const cents = (n) => `${n > 0 ? '+' : ''}${(n * 100).toFixed(1)} ct`;

function Result({ r }) {
  if (!r) return null;
  const ok = r.status >= 200 && r.status < 300 && !(r.data && r.data.error);
  return (
    <>
      <div className={`status ${ok ? 'ok' : 'err'}`}>
        {r.method} {r.url} → HTTP {r.status || 'lỗi mạng'} · {r.ms}ms
      </div>
      <pre className="json">{typeof r.data === 'string' ? r.data : JSON.stringify(r.data, null, 2)}</pre>
    </>
  );
}

function Summary({ summary }) {
  const fuels = FUELS.filter((f) => summary?.[f]);
  if (fuels.length === 0) return null;
  return (
    <table className="summary">
      <thead>
        <tr><th>Khu vực</th><th>Rẻ nhất</th><th>Trung bình</th><th>Đắt nhất</th><th>Số trạm</th></tr>
      </thead>
      <tbody>
        {fuels.map((f) => (
          <tr key={f}>
            <td>{f}</td>
            <td className="cheap">{euro(summary[f].min)}</td>
            <td>{euro(summary[f].avg)}</td>
            <td className="expensive">{euro(summary[f].max)}</td>
            <td>{summary[f].count}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function TestPage() {
  const [search, setSearch] = useState({ lat: '51.4947', lng: '11.989', rad: '5' });
  const [postal, setPostal] = useState('06118');
  const [fuel, setFuel] = useState('Diesel');
  const [found, setFound] = useState(null);
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState('current');
  const [detail, setDetail] = useState(null);
  const [misc, setMisc] = useState(null);
  const [busy, setBusy] = useState(false);

  // Tự gọi lại endpoint khi đổi trạm / tab
  useEffect(() => {
    if (!selected) return;
    const t = TABS.find((x) => x.key === tab);
    let cancelled = false;
    call('GET', t.path(selected.id)).then((r) => { if (!cancelled) setDetail(r); });
    return () => { cancelled = true; };
  }, [selected, tab]);

  async function load(url) {
    setBusy(true);
    try {
      const r = await call('GET', url);
      setMisc(r);
      if (r.data?.stations) setFound(r.data);
    } finally {
      setBusy(false);
    }
  }

  // Sắp xếp: trạm đang mở có giá loại nhiên liệu đã chọn, rẻ nhất lên đầu
  const priceOf = (s) => s.fuels.find((f) => f.name === fuel);
  const stations = [...(found?.stations || [])].sort((a, b) => {
    const pa = a.isOpen ? priceOf(a)?.price : null;
    const pb = b.isOpen ? priceOf(b)?.price : null;
    if (pa == null) return pb == null ? 0 : 1;
    if (pb == null) return -1;
    return pa - pb;
  });

  return (
    <div className="wrap">
      <div className="head">
        <h1>⛽ Fuel Price API — Test</h1>
        <span className="muted">Giao diện thử các endpoint ·</span>
        <a href="/api" target="_blank">/api (JSON docs)</a>
      </div>

      <div className="grid">
        <div>
          <div className="panel">
            <h2>Tìm trạm</h2>
            <div className="row">
              <label className="f">Lat<input value={search.lat} onChange={(e) => setSearch({ ...search, lat: e.target.value })} /></label>
              <label className="f">Lng<input value={search.lng} onChange={(e) => setSearch({ ...search, lng: e.target.value })} /></label>
              <label className="f">Bán kính (km)<input value={search.rad} onChange={(e) => setSearch({ ...search, rad: e.target.value })} /></label>
            </div>
            <div className="row">
              <button className="primary" onClick={() => load(`/api/stations/search?lat=${search.lat}&lng=${search.lng}&rad=${search.rad}`)} disabled={busy}>Tìm theo tọa độ</button>
            </div>
            <div className="row">
              <label className="f">Mã bưu điện<input value={postal} onChange={(e) => setPostal(e.target.value)} /></label>
            </div>
            <div className="row">
              <button onClick={() => load(`/api/stations/postalcode/${encodeURIComponent(postal)}?rad=${search.rad}`)} disabled={busy}>Tìm theo mã bưu điện</button>
            </div>
          </div>

          <div className="panel">
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
              <h2 style={{ margin: 0 }}>Kết quả ({stations.length})</h2>
              <select value={fuel} onChange={(e) => setFuel(e.target.value)} style={{ width: 'auto' }}>
                {FUELS.map((f) => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div className="list">
              {stations.length === 0 && <div className="empty">Chưa có kết quả — bấm tìm ở trên.</div>}
              {stations.map((s) => {
                const p = priceOf(s);
                return (
                  <button key={s.id} className={`station ${selected?.id === s.id ? 'active' : ''}`} onClick={() => setSelected(s)}>
                    <div className="name">
                      {stationTitle(s)}
                      {s.distance != null && <span className="muted"> · {s.distance} km</span>}
                      {!s.isOpen && <span className="muted"> · đóng cửa</span>}
                    </div>
                    <div className="addr">{[s.street, s.postalCode, s.place].filter(Boolean).join(', ')}</div>
                    {p && (
                      <div className="prices">
                        <span>{fuel}: <b>{euro(p.price)}</b></span>
                        {p.level && <span className={`badge ${p.level}`}>{p.isCheapest ? 'Rẻ nhất' : LEVEL_LABEL[p.level]} {cents(p.diffFromAvg)}</span>}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="panel">
            <h2>Khác</h2>
            <div className="row">
              <button onClick={() => load('/api/stats/global')} disabled={busy}>Giá TB tham khảo</button>
            </div>
          </div>
        </div>

        <div>
          {found?.summary && (
            <div className="panel">
              <h2>So sánh khu vực{found.location && <span className="muted"> — {found.location.name}</span>}</h2>
              <Summary summary={found.summary} />
            </div>
          )}

          <div className="panel">
            <h2>{selected ? stationTitle(selected) : 'Chọn một trạm bên trái'}</h2>
            {selected && (
              <>
                <div className="muted" style={{ marginBottom: 10, fontSize: 12 }}>ID: {selected.id}</div>
                <div className="tabs">
                  {TABS.map((t) => (
                    <button key={t.key} className={tab === t.key ? 'on' : ''} onClick={() => setTab(t.key)}>{t.label}</button>
                  ))}
                </div>
                <Result r={detail} />
              </>
            )}
          </div>

          <div className="panel">
            <h2>Phản hồi gần nhất</h2>
            {misc ? <Result r={misc} /> : <div className="empty">Chưa gọi endpoint nào.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
