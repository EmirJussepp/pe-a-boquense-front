import { ref } from "vue"
import LogoPena from "../assets/Boca_escudo.png"

const THEME = { blue: '#003a70', yellow: '#f6c011', text: '#0b3c5d' }
const CLUB = {
  nombreLinea1: 'ASOCIACIÓN CIVIL',
  nombreLinea2: 'PEÑA BOQUENSE SAN FRANCISCO',
  nombreLinea3: 'ANTONIO UBALDO RATTÍN',
}

const CUPON_STYLES = `
  *{box-sizing:border-box}
  :root{ --blue:${THEME.blue}; --yellow:${THEME.yellow}; --text:${THEME.text}; }
  @page{ size: A4 portrait; margin: 8mm }
  html,body{
    width:210mm;max-width:210mm;margin:0 auto;color:var(--text);
    font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Helvetica,Arial,sans-serif;
    background:#f7f9fc;
  }
  .ticket{
    max-width:740px;
    margin:0 auto 20px;
    border:2px solid var(--blue);
    border-radius:10px;
    overflow:hidden;
    background:#fff;
    box-shadow:0 2px 6px rgba(0,0,0,0.08);
    page-break-inside:avoid;
  }
  .hdr{display:grid;grid-template-columns:auto 1fr;position:relative}
  .hdr-left{display:flex;align-items:center;gap:10px;background:var(--blue);color:#fff;padding:10px 14px}
  .escudo{width:60px;height:auto;flex-shrink:0;background:none;border:none;border-radius:0;display:grid;place-items:center;overflow:visible;}
  .escudo img{width:60px;height:auto;display:block;object-fit:contain}
  .club{line-height:1.1;text-transform:uppercase}
  .club .l1{display:block;font-weight:700;opacity:.95;font-size:.7rem}
  .club .l2{display:block;font-weight:1000;letter-spacing:.4px;font-size:.9rem}
  .club .l3{display:block;font-weight:800;opacity:.95;font-size:.8rem}
  .hdr-right{display:flex;align-items:center;justify-content:flex-end;padding:8px 12px;background:#f8fafc;gap:10px}
  .comprob span{display:block;font-size:.7rem;color:#475569;font-weight:800}
  .comprob strong{display:block;font-size:1rem;color:var(--blue);letter-spacing:.5px}
  .faja{position:absolute;left:0;right:0;bottom:-1px;height:5px;background:var(--yellow)}
  .hdr-stub{display:block;background:var(--blue);color:#fff;padding:12px 8px;text-align:center;position:relative;}
  .hdr-stub .escudo img{width:45px;margin-bottom:4px}
  .hdr-stub .club .l1{font-size:.6rem}
  .hdr-stub .club .l2{font-size:.8rem;letter-spacing:.25px}
  .hdr-stub .club .l3{font-size:.7rem}
  .hdr-stub .pill{display:inline-block;background:var(--yellow);color:var(--blue);font-weight:1000;border-radius:999px;padding:3px 10px;font-size:.7rem;margin:6px 0 3px;}
  .hdr-stub .sub{font-size:.8rem;font-weight:900;letter-spacing:.2px;margin-top:2px;color:#dbeafe}
  .hdr-stub .faja{position:absolute;left:0;right:0;bottom:-1px;height:4px;background:var(--yellow)}
  .cup-body{display:flex;align-items:stretch;gap:4px}
  .lado-cobrador{flex:2;min-width:0}
  .lado-socio{flex:0.8;min-width:190px;background:#fcfdff;border-left:1px dashed #cbd5e1}
  .body{padding:12px 16px}
  .grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px 14px;margin-bottom:10px}
  .row{display:flex;justify-content:space-between;gap:12px;padding:6px 0;border-bottom:1px dashed #e6e9f2}
  .lbl{color:#64748b;font-weight:900;font-size:.9rem}
  .val{font-weight:900;font-size:.9rem}
  .mono{font-variant-numeric:tabular-nums}
  .importe .lbl{color:var(--blue)}
  .importe .val{font-size:1.1rem;color:var(--blue)}
  .firmas{display:grid;grid-template-columns:1fr 1fr;gap:30px;margin:20px 0 6px;padding-top:6px;}
  .firma-box .linea{height:1.3px;background:#475569;margin:28px 0 8px}
  .firma-box .label{font-size:.85rem;color:#475569;text-align:center}
  .stub{padding:10px 12px}
  .stub .kvg{display:grid;gap:8px}
  .stub .kv{display:flex;justify-content:space-between;gap:6px}
  .stub .kv .k{font-size:.78rem;color:#64748b;font-weight:900}
  .stub .kv .v{font-weight:1000;font-size:.85rem}
  .stub .monto{font-size:.95rem;color:var(--blue)}
  @media print{body{margin:0;zoom:100%;}.ticket{border:none;border-radius:0;page-break-inside:avoid;break-inside:avoid;page-break-after:always;break-after:page;}.ticket:last-child{page-break-after:auto;break-after:auto;}}
`

export function useCuponPrinting() {
  const logoDataUrl = ref('')

  async function ensureLogoDataUrl() {
    if (logoDataUrl.value) return
    try {
      const resp = await fetch(LogoPena, { cache: 'force-cache' })
      const blob = await resp.blob()
      const dataUrl = await new Promise((res, rej) => {
        const r = new FileReader()
        r.onload = () => res(r.result)
        r.onerror = rej
        r.readAsDataURL(blob)
      })
      logoDataUrl.value = String(dataUrl || '')
    } catch {
      logoDataUrl.value = LogoPena
    }
  }

  const safe = (s) => String(s ?? '').replace(/[<>&"]/g, m => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[m]))

  const fechaCorta = (v) => {
    if (!v) return '—'
    const d = new Date(v)
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('es-AR')
  }

  const formatoPeriodoCupon = (periodo) => {
    const value = String(periodo ?? '')
    return value.length === 6 ? `${value.slice(4, 6)}/${value.slice(0, 4)}` : value
  }

  const formatMoney = (value) =>
    new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value || 0))

  function buildCuponHTML(cuota) {
    const LOGO = logoDataUrl.value || LogoPena
    const header = `
      <div class="hdr">
        <div class="hdr-left">
          <div class="escudo"><img src="${LOGO}" alt="Peña" /></div>
          <div class="club">
            <span class="l1">${safe(CLUB.nombreLinea1)}</span>
            <span class="l2">${safe(CLUB.nombreLinea2)}</span>
            <span class="l3">${safe(CLUB.nombreLinea3)}</span>
          </div>
        </div>
        <div class="hdr-right">
          <div class="comprob">
            <span>COMPROBANTE</span>
            <strong>#${String(cuota.id).padStart(8, '0')}</strong>
          </div>
        </div>
        <div class="faja"></div>
      </div>`
    const headerStub = `
      <div class="hdr-stub">
        <div class="escudo"><img src="${LOGO}" alt="Peña" /></div>
        <div class="club">
          <span class="l1">${safe(CLUB.nombreLinea1)}</span>
          <span class="l2">${safe(CLUB.nombreLinea2)}</span>
          <span class="l3">${safe(CLUB.nombreLinea3)}</span>
        </div>
        <div class="pill">RECIBO PARA EL SOCIO</div>
        <div class="sub">${safe(cuota.socioApellido)}, ${safe(cuota.socioNombre)}</div>
        <div class="faja"></div>
      </div>`
    return `
    <section class="ticket">
      <div class="cup-body">
        <div class="lado-cobrador">
          ${header}
          <div class="body">
            <div class="grid">
              <div class="row"><span class="lbl">Socio</span><span class="val">${safe(cuota.socioApellido)}, ${safe(cuota.socioNombre)}</span></div>
              <div class="row"><span class="lbl">DNI</span><span class="val mono">${safe(cuota.socioDni)}</span></div>
              <div class="row"><span class="lbl">Período</span><span class="val">${formatoPeriodoCupon(cuota.periodo)}</span></div>
              <div class="row"><span class="lbl">Vencimiento</span><span class="val mono">${fechaCorta(cuota.fechaVencimiento)}</span></div>
              <div class="row importe"><span class="lbl">TOTAL</span><span class="val mono">$ ${formatMoney(cuota.montoAPagar)}</span></div>
            </div>
            <div class="firmas">
              <div class="firma-box"><div class="linea"></div><div class="label">Firma del socio</div></div>
              <div class="firma-box"><div class="linea"></div><div class="label">Firma del cobrador</div></div>
            </div>
          </div>
        </div>
        <div class="lado-socio">
          ${headerStub}
          <div class="stub">
            <div class="kvg">
              <div class="kv"><span class="k">Período</span><span class="v">${formatoPeriodoCupon(cuota.periodo)}</span></div>
              <div class="kv"><span class="k">Monto</span><span class="v mono monto">$ ${formatMoney(cuota.montoAPagar)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>`
  }

  function printHTML(html) {
    const iframe = document.createElement('iframe')
    Object.assign(iframe.style, { position: 'fixed', right: '0', bottom: '0', width: '0', height: '0', border: '0' })
    iframe.setAttribute('aria-hidden', 'true')
    document.body.appendChild(iframe)
    const win = iframe.contentWindow
    const doc = win.document
    doc.open(); doc.write(html); doc.close()
    const fallback = setTimeout(() => { try { win.focus(); win.print() } catch {} }, 1500)
    win.addEventListener('afterprint', () => { clearTimeout(fallback); setTimeout(() => document.body.removeChild(iframe), 300) })
  }

  function wrapCuponesHTML(ticketsHTML, titulo) {
    return `<!doctype html><html lang="es"><head>
      <meta charset="utf-8"><title>${titulo}</title>
      <style>${CUPON_STYLES}</style>
    </head><body>
      ${ticketsHTML}
      <script>
        (async () => {
          try { if (document.fonts && document.fonts.ready) await document.fonts.ready; } catch(e){}
          try {
            const imgs = Array.from(document.images);
            await Promise.all(imgs.map(img => img.decode ? img.decode().catch(()=>{}) : Promise.resolve()));
          } catch(e){}
          window.print();
        })();
      <\/script>
    </body></html>`
  }

  return { ensureLogoDataUrl, buildCuponHTML, printHTML, wrapCuponesHTML }
}

export function normalizeCuotaParaImprimir(item) {
  return {
    id: Number(item?.cuotaId ?? item?.id ?? 0),
    socioNombre: String(item?.socioNombre ?? ''),
    socioApellido: String(item?.socioApellido ?? ''),
    socioDni: String(item?.socioDni ?? ''),
    periodo: item?.periodo ?? '',
    fechaVencimiento: item?.fechaVencimiento ?? null,
    montoAPagar: Number(item?.montoAPagar ?? 0),
    estado: String(item?.estado ?? ''),
    socioId: Number(item?.socioId ?? 0),
  }
}
