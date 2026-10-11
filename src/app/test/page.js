'use client';

import { useCallback, useEffect, useState } from 'react';
import './test.css';

const FUELS = ['Diesel', 'Super E5', 'Super E10'];
const COLORS = { Diesel: '#d97706', 'Super E5': '#2563eb', 'Super E10': '#16a34a' };

const TABS = [
  { key: 'current', label: 'Giá hiện tại', path: (id) => `/api/prices/${id}/current` },
  { key: 'history', label: 'Lịch sử', path: (id, o) => `/api/prices/${id}/history?fuel=${encodeURIComponent(o.fuel)}&days=${o.days}` },
  { key: 'forecast', label: 'Dự đoán', path: (id, o) => `/api/prices/${id}/forecast?fuel=${encodeURIComponent(o.fuel)}&hours=${o.hours}` },
  { key: 'best-time', label: 'Giờ rẻ nhất', path: (id, o) => `/api/prices/${id}/best-time?fuel=${encodeURIComponent(o.fuel)}` },
  { key: 'stats', label: 'Thống kê', path: (id, o) => `/api/prices/${id}/stats?days=${o.days}` },
  { key: 'detail', label: 'Chi tiết trạm', path: (id) => `/api/stations/${id}` },
];

async function call(method, url, body) {
  const started = performance.now();
  try {
    const res = await fetch(url, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }
    return { method, url, status: res.status, ms: Math.round(performance.now() - started), data };
  } catch (err) {
    return { method, url, status: 0, ms: Math.round(performance.now() - started), data: { error: err.message } };
  }
}

// Gộp 2 format trạm (watched từ DB / search từ Tankerkönig) về 1 dạng
function normalize(s) {
  const prices = s.current_prices
    ? s.current_prices.map((p) => ({ name: p.fuel_name, price: p.price }))
    : (s.fuels || []).map((f) => ({ name: f.name, price: f.price }));
  const name = s.name || '';
  const brandInName = s.brand && name.toLowerCase().includes(s.brand.toLowerCase());
  return {
    id: s.id,
    title: s.label || (brandInName ? name : `${s.brand || ''} ${name}`.trim()),
    addr: [s.street, s.postal_code || s.postalCode, s.place].filter(Boolean).join(', '),
    distance: s.distance,
    prices,
  };
}

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

function HistoryChart({ graphs }) {
  const series = Object.entries(graphs || {}).filter(([, pts]) => pts.length > 0);
  if (series.length === 0) return <div className="empty">Chưa có dữ liệu lịch sử.</div>;

  const all = series.flatMap(([, pts]) => pts.map((p) => ({ t: new Date(p.time.replace(' ', 'T') + 'Z').getTime(), v: p.price })));
  const tMin = Math.min(...all.map((p) => p.t));
  const tMax = Math.max(...all.map((p) => p.t));
  let vMin = Math.min(...all.map((p) => p.v));
  let vMax = Math.max(...all.map((p) => p.v));
  if (vMax - vMin < 0.02) { vMin -= 0.01; vMax += 0.01; }

  const W = 800, H = 220, L = 44, R = 10, T = 10, B = 24;
  const x = (t) => (tMax === tMin ? (L + W - R) / 2 : L + ((t - tMin) / (tMax - tMin)) * (W - L - R));
  const y = (v) => T + (1 - (v - vMin) / (vMax - vMin)) * (H - T - B);
  const ticks = [vMin, (vMin + vMax) / 2, vMax];
  const fmt = (t) => new Date(t).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

  return (
    <>
      <div className="legend">
        {series.map(([name, pts]) => (
          <span key={name}><i style={{ background: COLORS[name] || '#888' }} />{name} ({pts.length} điểm)</span>
        ))}
      </div>
      <svg className="chart" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        {ticks.map((v) => (
          <g key={v}>
            <line className="axis" x1={L} x2={W - R} y1={y(v)} y2={y(v)} />
            <text x={L - 4} y={y(v) + 3} textAnchor="end">{v.toFixed(3)}</text>
          </g>
        ))}
        <text x={L} y={H - 6}>{fmt(tMin)}</text>
        <text x={W - R} y={H - 6} textAnchor="end">{fmt(tMax)}</text>
        {series.map(([name, pts]) => {
          const xy = pts.map((p) => [x(new Date(p.time.replace(' ', 'T') + 'Z').getTime()), y(p.price)]);
          // Giá xăng thay đổi theo bậc → vẽ step line
          const d = xy.map(([px, py], i) => (i === 0 ? `M${px},${py}` : `H${px}V${py}`)).join('');
          return (
            <g key={name}>
              <path d={d} fill="none" stroke={COLORS[name] || '#888'} strokeWidth="2" vectorEffect="non-scaling-stroke" />
              {xy.map(([px, py], i) => <circle key={i} cx={px} cy={py} r="2.5" fill={COLORS[name] || '#888'} />)}
            </g>
          );
        })}
      </svg>
    </>
  );
}

export default function TestPage() {
  const [watched, setWatched] = useState([]);
  const [results, setResults] = useState([]);
  const [listMode, setListMode] = useState('watched');
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState('current');
  const [opts, setOpts] = useState({ fuel: 'Diesel', days: 7, hours: 24 });
  const [search, setSearch] = useState({ lat: '51.4947', lng: '11.989', rad: '5' });
  const [postal, setPostal] = useState('06118');
  const [detail, setDetail] = useState(null);
  const [misc, setMisc] = useState(null);
  const [busy, setBusy] = useState(false);

  const loadWatched = useCallback(async () => {
    const r = await call('GET', '/api/stations/watched');
    setWatched((r.data?.stations || []).map(normalize));
    return r;
  }, []);

  useEffect(() => { loadWatched(); }, [loadWatched]);

  // Tự gọi lại endpoint khi đổi trạm / tab / tham số
  useEffect(() => {
    if (!selected) return;
    const t = TABS.find((x) => x.key === tab);
    let cancelled = false;
    call('GET', t.path(selected.id, opts)).then((r) => { if (!cancelled) setDetail(r); });
    return () => { cancelled = true; };
  }, [selected, tab, opts]);

  async function run(fn) {
    setBusy(true);
    try { await fn(); } finally { setBusy(false); }
  }

  const doSearch = () => run(async () => {
    const r = await call('GET', `/api/stations/search?lat=${search.lat}&lng=${search.lng}&rad=${search.rad}`);
    setMisc(r);
    setResults((r.data?.stations || []).map(normalize));
    setListMode('search');
  });

  const doPostal = () => run(async () => {
    const r = await call('GET', `/api/stations/postalcode/${encodeURIComponent(postal)}`);
    setMisc(r);
    setResults((r.data?.stations || []).map(normalize));
    setListMode('search');
  });

  const watchArea = () => run(async () => {
    setMisc(await call('POST', '/api/stations/watch', { lat: search.lat, lng: search.lng, radius: search.rad }));
    await loadWatched();
  });

  const watchOne = (id) => run(async () => {
    setMisc(await call('POST', `/api/stations/watch/${id}`, {}));
    await loadWatched();
  });

  const unwatch = (id) => run(async () => {
    setMisc(await call('DELETE', `/api/stations/watch/${id}`));
    await loadWatched();
  });

  const simple = (method, url) => run(async () => {
    setMisc(await call(method, url));
    if (url.endsWith('/collect')) await loadWatched();
  });

  const list = listMode === 'watched' ? watched : results;
  const watchedIds = new Set(watched.map((s) => s.id));
  const needFuel = ['history', 'forecast', 'best-time'].includes(tab);
  const needDays = ['history', 'stats'].includes(tab);

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
              <button className="primary" onClick={doSearch} disabled={busy}>Tìm theo tọa độ</button>
              <button onClick={watchArea} disabled={busy}>Theo dõi cả vùng</button>
            </div>
            <div className="row">
              <label className="f">Mã bưu điện (chỉ tìm trong DB local)<input value={postal} onChange={(e) => setPostal(e.target.value)} /></label>
            </div>
            <div className="row"><button onClick={doPostal} disabled={busy}>Tìm theo mã bưu điện</button></div>
          </div>

          <div className="panel">
            <div className="tabs">
              <button className={listMode === 'watched' ? 'on' : ''} onClick={() => setListMode('watched')}>Đang theo dõi ({watched.length})</button>
              <button className={listMode === 'search' ? 'on' : ''} onClick={() => setListMode('search')}>Kết quả tìm ({results.length})</button>
            </div>
            <div className="list">
              {list.length === 0 && <div className="empty">Không có trạm nào.</div>}
              {list.map((s) => (
                <div key={s.id}>
                  <button className={`station ${selected?.id === s.id ? 'active' : ''}`} onClick={() => setSelected(s)}>
                    <div className="name">{s.title}{s.distance != null && <span className="muted"> · {s.distance} km</span>}</div>
                    <div className="addr">{s.addr}</div>
                    <div className="prices">
                      {s.prices.map((p) => <span key={p.name}>{p.name}: <b>{p.price != null ? `${p.price.toFixed(3)} €` : '—'}</b></span>)}
                    </div>
                  </button>
                  <div className="row" style={{ marginTop: 4 }}>
                    {watchedIds.has(s.id)
                      ? <button onClick={() => unwatch(s.id)} disabled={busy}>Bỏ theo dõi</button>
                      : <button onClick={() => watchOne(s.id)} disabled={busy}>+ Theo dõi</button>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <h2>Hệ thống</h2>
            <div className="row">
              <button onClick={() => simple('GET', '/api/stats/local')} disabled={busy}>Thống kê local</button>
              <button onClick={() => simple('GET', '/api/stats/global')} disabled={busy}>Giá TB toàn quốc</button>
              <button onClick={() => simple('POST', '/api/stats/collect')} disabled={busy}>Thu thập giá ngay</button>
            </div>
          </div>
        </div>

        <div>
          <div className="panel">
            <h2>{selected ? selected.title : 'Chọn một trạm bên trái'}</h2>
            {selected && (
              <>
                <div className="muted" style={{ marginBottom: 10, fontSize: 12 }}>{selected.addr} · ID: {selected.id}</div>
                <div className="tabs">
                  {TABS.map((t) => (
                    <button key={t.key} className={tab === t.key ? 'on' : ''} onClick={() => setTab(t.key)}>{t.label}</button>
                  ))}
                </div>
                {(needFuel || needDays || tab === 'forecast') && (
                  <div className="row" style={{ marginBottom: 10 }}>
                    {needFuel && (
                      <label className="f">Nhiên liệu
                        <select value={opts.fuel} onChange={(e) => setOpts({ ...opts, fuel: e.target.value })}>
                          {FUELS.map((f) => <option key={f}>{f}</option>)}
                        </select>
                      </label>
                    )}
                    {needDays && (
                      <label className="f">Số ngày
                        <input type="number" min="1" max="90" value={opts.days} onChange={(e) => setOpts({ ...opts, days: e.target.value })} />
                      </label>
                    )}
                    {tab === 'forecast' && (
                      <label className="f">Số giờ
                        <input type="number" min="1" max="72" value={opts.hours} onChange={(e) => setOpts({ ...opts, hours: e.target.value })} />
                      </label>
                    )}
                  </div>
                )}
                {tab === 'history' && detail?.data?.graphs && <HistoryChart graphs={detail.data.graphs} />}
                <Result r={detail} />
              </>
            )}
          </div>

          <div className="panel">
            <h2>Phản hồi gần nhất (tìm kiếm / theo dõi / hệ thống)</h2>
            {misc ? <Result r={misc} /> : <div className="empty">Chưa gọi endpoint nào.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
