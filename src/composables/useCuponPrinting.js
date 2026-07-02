import { ref } from "vue"
import LogoPena from "../assets/Boca_escudo.png"

// El papel es un MEMBRETE pre-impreso de 210x100mm (apaisado) con el diseño de
// Boca (escudo, nombre, dirección) ya impreso en la FRANJA INFERIOR (~28mm) y un
// TROQUEL a 70mm del borde derecho (la copia del socio). El sistema imprime SOLO
// los datos en la zona blanca de arriba, sin repetir escudo/encabezado.
// Calibración: si todo sale corrido, ajustar --shift-x / --shift-y (en mm).
const CUPON_STYLES = `
  *{box-sizing:border-box}
  :root{ --ink:#242450; --muted:#5b5b74; --line:#8b90a6; --shift-x:0mm; --shift-y:0mm; }
  @page{ size: 210mm 100mm; margin:0 }
  html,body{ margin:0; font-family:Arial,Helvetica,sans-serif; color:var(--ink); background:#fff; }
  .ticket{ position:relative; width:210mm; height:100mm; overflow:hidden; page-break-after:always; break-after:page; }
  .ticket:last-child{ page-break-after:auto; break-after:auto; }
  .divisor{ position:absolute; left:140mm; top:6mm; height:58mm; border-left:1px dashed #cdd1dd; transform:translate(var(--shift-x),var(--shift-y)); }
  .lado-cobrador{ position:absolute; left:0; top:0; width:140mm; height:72mm; padding:7mm 8mm 0 11mm; transform:translate(var(--shift-x),var(--shift-y)); }
  .lado-socio{ position:absolute; left:140mm; top:0; width:70mm; height:72mm; padding:7mm 7mm 0 8mm; transform:translate(var(--shift-x),var(--shift-y)); }
  .comprobante{ position:absolute; top:6mm; right:8mm; font-size:8.5pt; color:var(--muted); text-align:right; text-transform:uppercase; letter-spacing:.3px; }
  .comprobante strong{ display:block; color:var(--ink); font-size:13pt; letter-spacing:.5px; }
  .campos{ margin-top:8mm; display:grid; grid-template-columns:1fr 1fr; gap:5mm 8mm; width:112mm; }
  .campo{ display:flex; flex-direction:column; min-width:0; }
  .campo.full{ grid-column:1 / -1; }
  .lbl{ font-size:7.5pt; color:var(--muted); text-transform:uppercase; letter-spacing:.4px; font-weight:700; margin-bottom:1mm; }
  .val{ font-size:12pt; font-weight:800; line-height:1.1; }
  .mono{ font-variant-numeric:tabular-nums; }
  .campo.total{ grid-column:2 / 3; }
  .campo.total .lbl{ font-size:8.5pt; }
  .campo.total .val{ font-size:15pt; color:var(--ink); white-space:nowrap; }
  .firmas{ position:absolute; left:11mm; right:12mm; bottom:5mm; display:flex; gap:12mm; }
  .firma{ flex:1; text-align:center; }
  .firma .linea{ display:block; border-top:1px solid var(--line); margin-bottom:1.5mm; }
  .firma .fl{ font-size:7.5pt; color:var(--muted); }
  .lado-socio .titulo{ font-size:7.5pt; color:var(--muted); text-transform:uppercase; letter-spacing:.5px; font-weight:800; margin-bottom:1mm; }
  .lado-socio .campo{ margin-top:5mm; }
  .lado-socio .val{ font-size:11pt; }
  .lado-socio .campo.total{ grid-column:auto; }
  .lado-socio .campo.total .val{ font-size:15pt; }
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
    const nro = String(cuota.id).padStart(8, '0')
    const socio = `${safe(cuota.socioApellido)}, ${safe(cuota.socioNombre)}`
    const periodo = formatoPeriodoCupon(cuota.periodo)
    const venc = fechaCorta(cuota.fechaVencimiento)
    const monto = `$ ${formatMoney(cuota.montoAPagar)}`
    return `
    <section class="ticket">
      <div class="divisor"></div>
      <div class="lado-cobrador">
        <div class="comprobante">Comprobante N°<strong>${nro}</strong></div>
        <div class="campos">
          <div class="campo full"><span class="lbl">Socio</span><span class="val">${socio}</span></div>
          <div class="campo"><span class="lbl">DNI</span><span class="val mono">${safe(cuota.socioDni)}</span></div>
          <div class="campo"><span class="lbl">Período</span><span class="val">${periodo}</span></div>
          <div class="campo"><span class="lbl">Vencimiento</span><span class="val mono">${venc}</span></div>
          <div class="campo total"><span class="lbl">Total a pagar</span><span class="val mono">${monto}</span></div>
        </div>
        <div class="firmas">
          <div class="firma"><span class="linea"></span><span class="fl">Firma del socio</span></div>
          <div class="firma"><span class="linea"></span><span class="fl">Firma del cobrador</span></div>
        </div>
      </div>
      <div class="lado-socio">
        <div class="comprobante">N°<strong>${nro}</strong></div>
        <div class="titulo">Recibo del socio</div>
        <div class="campo full"><span class="lbl">Socio</span><span class="val">${socio}</span></div>
        <div class="campo"><span class="lbl">Período</span><span class="val">${periodo}</span></div>
        <div class="campo total"><span class="lbl">Monto</span><span class="val mono">${monto}</span></div>
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
