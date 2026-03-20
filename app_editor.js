/* ══════════════════════════════════════════
   EDITOR VISUAL v3
   - Nota em branco
   - Resize de TODAS as seções nativas
   - Subtotal manual
   - Bordas configuráveis
   - Toolbar fixa ao selecionar
══════════════════════════════════════════ */

let evElements   = [];
let evSelected   = null;
let evSelSection = null;
let evBg         = '#ffffff';
let evBgBorder   = '#e5e7eb';
let evDragging   = null;
let evDragOffset = {x:0,y:0};
let evResizingSection = null;
let evResizeSectionStart = {};

/* Seções: visível + tamanhos personalizáveis */
let evSections = {
  logo:     { visible:true, w:200, minW:120, maxW:320 },
  emitente: { visible:true, h:null, fontSize:22 },
  cliente:  { visible:true, h:null, fontSize:14 },
  itens:    { visible:true, h:null },
  totais:   { visible:true, w:220, minW:160, maxW:380 },
  obs:      { visible:true, h:null, fontSize:12 },
  fotos:    { visible:true, h:null, fotoSize:120 },
};

/* Bordas da nota */
let evBorda = {
  ativa: false,
  tipo: 'solid',      // solid | dashed | dotted | double
  espessura: 2,
  cor: '#e5e7eb',
  raio: 14,
  interna: false,     // borda interna (dentro das seções)
};

/* Subtotal manual */
let evSubtotalManual = null;  // null = calculado automaticamente

/* ══ ENTRY POINT ══ */
function rEditorVisual(el, acts) {
  acts.innerHTML = `
    <button class="btn btn-ghost btn-sm" onclick="go('notas')">← Voltar</button>
    <button class="btn btn-sm" onclick="evNotaEmBranco()">📄 Nota em branco</button>
    <button class="btn btn-sm" onclick="salvarDoEditor()">💾 Salvar</button>
    <button class="btn btn-gold btn-sm" onclick="pdfDoEditor()">⬇ PDF</button>`;

  if(nfModel._evElements) evElements  = nfModel._evElements;
  if(nfModel._evBg)       evBg        = nfModel._evBg;
  if(nfModel._evSections) evSections  = deepMerge(evSections, nfModel._evSections);
  if(nfModel._evBorda)    evBorda     = {...evBorda, ...nfModel._evBorda};
  if(nfModel._evSubManual!==undefined) evSubtotalManual = nfModel._evSubManual;

  el.innerHTML = `
  <style>
  .ev-wrap{display:flex;gap:0;height:calc(100vh - 120px);overflow:hidden}
  .ev-left{width:272px;flex-shrink:0;background:var(--bg2);border-right:.5px solid var(--border);overflow-y:auto;padding:1rem}
  .ev-center{flex:1;background:#d1d5db;overflow:auto;display:flex;justify-content:center;padding:2.5rem 2rem}
  .ev-right{width:210px;flex-shrink:0;background:var(--bg2);border-left:.5px solid var(--border);overflow-y:auto;padding:1rem}

  .ev-add-btn{display:flex;align-items:center;gap:8px;width:100%;padding:8px 12px;background:var(--bg3);border:.5px solid var(--border2);border-radius:var(--rs);color:var(--text2);font-family:'Outfit',sans-serif;font-size:13px;cursor:pointer;margin-bottom:5px;transition:all .15s;text-align:left}
  .ev-add-btn:hover{background:var(--gold-dim);color:var(--gold);border-color:var(--gold)}

  /* Elementos livres */
  .ev-el{position:absolute;cursor:move;user-select:none}
  .ev-toolbar{display:none;position:absolute;bottom:calc(100% + 8px);left:0;background:#1e293b;border:.5px solid rgba(255,255,255,.18);border-radius:10px;padding:5px 6px;gap:3px;z-index:200;white-space:nowrap;align-items:center;box-shadow:0 4px 16px rgba(0,0,0,.5)}
  .ev-el.ev-selected .ev-toolbar{display:flex}
  .ev-toolbar button{background:none;border:none;color:#e2e8f0;font-size:12px;padding:4px 9px;cursor:pointer;border-radius:6px;font-family:inherit;transition:background .12s}
  .ev-toolbar button:hover{background:rgba(255,255,255,.12)}
  .ev-toolbar select,.ev-toolbar input[type=color]{background:#0f172a;color:#e2e8f0;border:.5px solid rgba(255,255,255,.15);border-radius:5px;font-size:11px;cursor:pointer;height:24px}
  .ev-toolbar select{padding:0 4px}
  .ev-toolbar input[type=color]{width:26px;padding:1px}
  .ev-sep{width:.5px;background:rgba(255,255,255,.15);height:16px;margin:0 2px;flex-shrink:0}
  .ev-resize{position:absolute;bottom:-5px;right:-5px;width:14px;height:14px;background:var(--gold);border-radius:3px;cursor:se-resize;z-index:10;border:2px solid #0f1117}

  /* Seções nativas */
  .ev-native{cursor:pointer;border-radius:6px;padding:4px;transition:outline .15s;position:relative}
  .ev-native:hover{outline:2px dashed rgba(201,168,76,.35);outline-offset:3px}
  .ev-native.ev-selected{outline:2px solid var(--gold)!important;outline-offset:3px}
  .ev-native-toolbar{display:none;position:absolute;top:calc(100% + 6px);left:0;background:#1e293b;border:.5px solid rgba(255,255,255,.18);border-radius:10px;padding:5px 6px;gap:3px;z-index:200;white-space:nowrap;align-items:center;box-shadow:0 4px 16px rgba(0,0,0,.5)}
  .ev-native.ev-selected .ev-native-toolbar{display:flex}
  .ev-native-toolbar button{background:none;border:none;color:#e2e8f0;font-size:12px;padding:4px 9px;cursor:pointer;border-radius:6px;font-family:inherit;transition:background .12s}
  .ev-native-toolbar button:hover{background:rgba(255,255,255,.12)}

  /* Handle de resize para seções nativas */
  .ev-sec-resize-h{position:absolute;right:0;top:0;bottom:0;width:6px;cursor:ew-resize;background:transparent;z-index:50}
  .ev-sec-resize-h:hover,.ev-sec-resize-h.active{background:rgba(201,168,76,.4);border-radius:0 4px 4px 0}
  .ev-sec-resize-v{position:absolute;left:0;right:0;bottom:-4px;height:8px;cursor:ns-resize;background:transparent;z-index:50;display:flex;align-items:center;justify-content:center}
  .ev-sec-resize-v:hover,.ev-sec-resize-v.active{background:rgba(201,168,76,.25);border-radius:0 0 4px 4px}
  .ev-sec-resize-v::after{content:'⋯';font-size:14px;color:rgba(201,168,76,.8);line-height:1}

  #ev-nota{font-family:'Outfit',sans-serif;position:relative;background:white}
  </style>

  <div class="ev-wrap">
    <div class="ev-left" id="ev-props">
      <div style="font-size:10px;font-weight:700;color:var(--text3);letter-spacing:.12em;text-transform:uppercase;margin-bottom:.75rem">Propriedades</div>
      <p style="font-size:12px;color:var(--text3)">Clique em qualquer seção da nota para editar.</p>
    </div>

    <div class="ev-center" id="ev-center">
      <div id="ev-nota"></div>
    </div>

    <div class="ev-right">
      <div style="font-size:10px;font-weight:700;color:var(--text3);letter-spacing:.12em;text-transform:uppercase;margin-bottom:.75rem">Adicionar</div>
      <button class="ev-add-btn" onclick="evAddTexto()">T&nbsp;&nbsp;Texto livre</button>
      <button class="ev-add-btn" onclick="evAddImagem()">🖼&nbsp;&nbsp;Imagem</button>
      <button class="ev-add-btn" onclick="evAddLinha()">—&nbsp;&nbsp;Linha</button>
      <button class="ev-add-btn" onclick="evAddRetangulo()">▭&nbsp;&nbsp;Retângulo</button>

      <div style="font-size:10px;font-weight:700;color:var(--text3);letter-spacing:.12em;text-transform:uppercase;margin:.75rem 0 .5rem">Seções</div>
      ${Object.keys(evSections).map(k=>`
        <label style="display:flex;align-items:center;gap:7px;font-size:12px;color:var(--text2);cursor:pointer;margin-bottom:5px">
          <input type="checkbox" id="chk-sec-${k}" ${evSections[k].visible?'checked':''} onchange="evToggleSection('${k}',this.checked)" style="cursor:pointer;width:13px;height:13px"/>
          ${{logo:'Barra lateral',emitente:'Emitente',cliente:'Cliente',itens:'Itens',totais:'Totais',obs:'Observações',fotos:'Fotos'}[k]}
        </label>`).join('')}

      <div style="font-size:10px;font-weight:700;color:var(--text3);letter-spacing:.12em;text-transform:uppercase;margin:.75rem 0 .5rem">Fundo</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin-bottom:8px">
        ${[{l:'Branco',bg:'#ffffff',b:'#e5e7eb'},{l:'Creme',bg:'#fefce8',b:'#fde68a'},{l:'Azul',bg:'#f0f9ff',b:'#bae6fd'},{l:'Verde',bg:'#f0fdf4',b:'#bbf7d0'},{l:'Cinza',bg:'#f9fafb',b:'#e5e7eb'},{l:'Escuro',bg:'#1e293b',b:'#334155'}].map(b=>`
          <div onclick="evSetBg('${b.bg}','${b.b}')" title="${b.l}" style="aspect-ratio:1;border-radius:5px;background:${b.bg};border:2px solid ${evBg===b.bg?'var(--gold)':b.b};cursor:pointer;display:flex;align-items:flex-end;justify-content:center;padding-bottom:2px">
            <span style="font-size:8px;color:#666">${b.l}</span></div>`).join('')}
      </div>
      <input type="color" value="${evBg}" oninput="evSetBg(this.value,'#e5e7eb')" style="width:100%;height:26px;border-radius:5px;border:.5px solid var(--border2);cursor:pointer;margin-bottom:10px"/>

      <div style="font-size:10px;font-weight:700;color:var(--text3);letter-spacing:.12em;text-transform:uppercase;margin-bottom:.5rem">Barra lateral</div>
      <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:5px">
        ${['#111827','#0c2340','#0d2b1a','#2d0a14','#18181b','#7c3aed','#b45309','#065f46','#1e3a5f'].map(c=>`
          <div onclick="evSetSidebar('${c}')" style="width:20px;height:20px;border-radius:4px;background:${c};cursor:pointer;border:2px solid ${activeTheme.sidebar===c?'var(--gold)':'transparent'}"></div>`).join('')}
      </div>
      <input type="color" value="${activeTheme.sidebar}" oninput="evSetSidebar(this.value)" style="width:100%;height:26px;border-radius:5px;border:.5px solid var(--border2);cursor:pointer;margin-bottom:10px"/>

      <div style="font-size:10px;font-weight:700;color:var(--text3);letter-spacing:.12em;text-transform:uppercase;margin-bottom:.5rem">Cor de destaque</div>
      <input type="color" value="${activeTheme.accent}" oninput="evSetAccent(this.value)" style="width:100%;height:26px;border-radius:5px;border:.5px solid var(--border2);cursor:pointer;margin-bottom:10px"/>

      <div style="font-size:10px;font-weight:700;color:var(--text3);letter-spacing:.12em;text-transform:uppercase;margin-bottom:.5rem">Borda da nota</div>
      <label style="display:flex;align-items:center;gap:7px;font-size:12px;color:var(--text2);cursor:pointer;margin-bottom:6px">
        <input type="checkbox" ${evBorda.ativa?'checked':''} onchange="evBorda.ativa=this.checked;evRenderCanvas()" style="cursor:pointer"/>
        Ativar borda
      </label>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-bottom:5px">
        ${['solid','dashed','dotted','double'].map(t=>`
          <button onclick="evBorda.tipo='${t}';evBorda.ativa=true;evRenderCanvas()" style="padding:5px;border-radius:5px;font-size:11px;font-family:inherit;cursor:pointer;border:.5px solid ${evBorda.tipo===t?'var(--gold)':'var(--border2)'};background:${evBorda.tipo===t?'var(--gold-dim)':'var(--bg3)'};color:var(--text2)">${t}</button>`).join('')}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-bottom:5px">
        <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Espessura</div>
          <input type="number" min="1" max="12" value="${evBorda.espessura}" style="width:100%;padding:5px 8px;font-size:12px;background:var(--bg3);border:.5px solid var(--border2);border-radius:5px;color:var(--text);outline:none" oninput="evBorda.espessura=parseInt(this.value)||1;evRenderCanvas()"/></div>
        <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Arredondamento</div>
          <input type="number" min="0" max="40" value="${evBorda.raio}" style="width:100%;padding:5px 8px;font-size:12px;background:var(--bg3);border:.5px solid var(--border2);border-radius:5px;color:var(--text);outline:none" oninput="evBorda.raio=parseInt(this.value)||0;evRenderCanvas()"/></div>
      </div>
      <input type="color" value="${evBorda.cor}" oninput="evBorda.cor=this.value;evBorda.ativa=true;evRenderCanvas()" style="width:100%;height:26px;border-radius:5px;border:.5px solid var(--border2);cursor:pointer"/>
    </div>
  </div>`;

  evRenderCanvas();
}

/* ══ NOTA EM BRANCO ══ */
window.evNotaEmBranco = () => {
  if(!confirm('Limpar todos os campos da nota e começar do zero?')) return;
  nfModel = { tipo:nfModel.tipo||'nfse', moeda:nfModel.moeda||'BRL', data:nowDate(), desconto:0, impostos:0 };
  nfItems = [{desc:'',qty:1,unit:'un',price:0,total:0}];
  nfLogo  = null;
  nfImages= [];
  evElements = [];
  evSubtotalManual = null;
  evSections = {
    logo:{visible:true,w:200,minW:120,maxW:320},
    emitente:{visible:true,h:null,fontSize:22},
    cliente:{visible:true,h:null,fontSize:14},
    itens:{visible:true,h:null},
    totais:{visible:true,w:220,minW:160,maxW:380},
    obs:{visible:true,h:null,fontSize:12},
    fotos:{visible:true,h:null,fotoSize:120},
  };
  evRenderCanvas();
  evUpdateProps();
  toast('Nota em branco criada!','ok');
};

/* ══ RENDER DA NOTA ══ */
function evRenderCanvas() {
  const nota = document.getElementById('ev-nota'); if(!nota) return;
  const m    = nfModel||{}, moeda = m.moeda||'BRL';
  const th   = activeTheme;
  const sideW = evSections.logo.w||200;

  // Calcula totais
  const sub = evSubtotalManual !== null ? evSubtotalManual :
    nfItems.reduce((a,it)=>a+(parseFloat(it.total)||0),0);
  const descVal = parseFloat(m.desconto)||0;
  const taxVal  = parseFloat(m.impostos)||0;
  const total   = Math.max(0, sub - descVal + taxVal);

  const fd = d => { if(!d)return'—'; const s=(d.split('T')[0]).split('-'); return`${s[2]}/${s[1]}/${s[0]}`; };
  const fmtM = v => fmt(v, moeda);

  const borderStyle = evBorda.ativa
    ? `border:${evBorda.espessura}px ${evBorda.tipo} ${evBorda.cor};`
    : '';
  const borderRadius = `border-radius:${evBorda.raio}px;`;

  // Itens
  const iRows = nfItems.map(it=>`<tr>
    <td style="padding:10px 12px;font-size:13px;color:#374151;border-bottom:1px solid #f3f4f6">${esc(it.desc||'')}</td>
    <td style="padding:10px 12px;font-size:13px;text-align:center;color:#374151;border-bottom:1px solid #f3f4f6">${it.qty||1}</td>
    <td style="padding:10px 12px;font-size:13px;text-align:center;color:#9ca3af;border-bottom:1px solid #f3f4f6">${esc(it.unit||'')}</td>
    <td style="padding:10px 12px;font-size:13px;text-align:right;color:#374151;border-bottom:1px solid #f3f4f6">${fmtM(parseFloat(it.price)||0)}</td>
    <td style="padding:10px 12px;font-size:13px;text-align:right;font-weight:600;color:#111827;border-bottom:1px solid #f3f4f6">${fmtM(it.total||0)}</td>
  </tr>`).join('');

  nota.style.cssText = `width:820px;min-height:580px;background:${evBg};${borderStyle}${borderRadius}overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,.25);font-family:'Outfit',sans-serif;position:relative`;

  nota.innerHTML = `
  <!-- Barra de destaque -->
  <div style="height:4px;background:linear-gradient(90deg,${th.sidebar},${th.accent},${th.accentL||th.accent},${th.sidebar})"></div>

  <div style="display:flex;min-height:576px">

    <!-- ══ BARRA LATERAL ══ -->
    ${evSections.logo.visible ? `
    <div id="ev-sec-logo" class="ev-native${evSelSection==='logo'?' ev-selected':''}"
      onclick="event.stopPropagation();evSelectSection('logo')"
      style="width:${sideW}px;flex-shrink:0;background:${th.sidebar};padding:1.75rem 1.5rem;display:flex;flex-direction:column;position:relative;-webkit-print-color-adjust:exact;print-color-adjust:exact">
      <div class="ev-native-toolbar">
        <button onmousedown="event.stopPropagation()" onclick="event.stopPropagation();evSelectSection('logo')">✏️ Editar</button>
        <span class="ev-sep"></span>
        <button onmousedown="event.stopPropagation()" onclick="event.stopPropagation();evToggleSection('logo',false)">🙈 Ocultar</button>
      </div>
      <!-- Handle horizontal para redimensionar largura -->
      <div class="ev-sec-resize-h" id="rh-logo" onmousedown="evStartSecResize(event,'logo','w')" title="Arrastar para redimensionar"></div>

      ${nfLogo ? `<div style="margin-bottom:1.5rem"><img src="${esc(nfLogo)}" style="max-height:52px;max-width:${sideW-30}px;object-fit:contain;display:block"/></div>`
        : `<div style="margin-bottom:1.5rem;font-family:'Playfair Display',serif;font-size:${m._nomeSize||16}px;color:${th.accentL||th.accent};line-height:1.3;font-weight:700">${esc(m.nome||'')}</div>`}

      <div style="font-size:9px;font-weight:700;color:#4b5563;text-transform:uppercase;letter-spacing:.18em;margin-bottom:1.5rem;padding-bottom:1rem;border-bottom:.5px solid rgba(255,255,255,.07)">${tipoInfo(m.tipo||'nfse').l}</div>

      ${m.numero?`<div style="margin-bottom:.9rem"><div style="font-size:9px;font-weight:700;color:#4b5563;text-transform:uppercase;letter-spacing:.12em;margin-bottom:3px">Número</div><div style="font-size:${m._numSize||14}px;color:${th.accent};font-weight:700">#${esc(m.numero)}</div></div>`:''}
      <div style="margin-bottom:.9rem"><div style="font-size:9px;font-weight:700;color:#4b5563;text-transform:uppercase;letter-spacing:.12em;margin-bottom:3px">Emissão</div><div style="font-size:12px;color:#c9d0e0">${fd(m.data)}</div></div>
      ${m.venc?`<div style="margin-bottom:.9rem"><div style="font-size:9px;font-weight:700;color:#4b5563;text-transform:uppercase;letter-spacing:.12em;margin-bottom:3px">Vencimento</div><div style="font-size:12px;color:#c9d0e0">${fd(m.venc)}</div></div>`:''}
      <div style="height:.5px;background:rgba(255,255,255,.07);margin:.9rem 0"></div>
      <div style="margin-bottom:.9rem"><div style="font-size:9px;font-weight:700;color:#4b5563;text-transform:uppercase;letter-spacing:.12em;margin-bottom:3px">Total</div><div style="font-size:${m._totalSize||15}px;color:${th.accent};font-weight:700">${fmtM(total)}</div></div>
      <div style="height:.5px;background:rgba(255,255,255,.07);margin:.9rem 0"></div>
      ${m.cnpj?`<div style="margin-bottom:.7rem"><div style="font-size:9px;font-weight:700;color:#4b5563;text-transform:uppercase;letter-spacing:.12em;margin-bottom:2px">CNPJ/CPF</div><div style="font-size:${m._contatoSize||11}px;color:#c9d0e0">${esc(m.cnpj)}</div></div>`:''}
      ${m.email?`<div style="margin-bottom:.7rem"><div style="font-size:9px;font-weight:700;color:#4b5563;text-transform:uppercase;letter-spacing:.12em;margin-bottom:2px">E-mail</div><div style="font-size:${m._contatoSize||11}px;color:#c9d0e0">${esc(m.email)}</div></div>`:''}
      ${m.tel?`<div style="margin-bottom:.7rem"><div style="font-size:9px;font-weight:700;color:#4b5563;text-transform:uppercase;letter-spacing:.12em;margin-bottom:2px">Telefone</div><div style="font-size:${m._contatoSize||11}px;color:#c9d0e0">${esc(m.tel)}</div></div>`:''}
    </div>`
    :`<div onclick="evToggleSection('logo',true)" style="width:48px;flex-shrink:0;background:${th.sidebar};display:flex;align-items:center;justify-content:center;cursor:pointer;opacity:.5">
        <span style="color:#fff;font-size:10px;writing-mode:vertical-rl;text-align:center">+ Sidebar</span>
      </div>`}

    <!-- ══ ÁREA PRINCIPAL ══ -->
    <div style="flex:1;padding:2rem 1.75rem;background:${evBg};position:relative;min-width:0">

      <!-- Emitente -->
      ${evSections.emitente.visible?`
      <div id="ev-sec-emitente" class="ev-native${evSelSection==='emitente'?' ev-selected':''}"
        onclick="event.stopPropagation();evSelectSection('emitente')"
        style="padding-bottom:1.5rem;border-bottom:1.5px solid ${evBgBorder};margin-bottom:1.5rem;position:relative${evSections.emitente.h?';min-height:'+evSections.emitente.h+'px':''}">
        <div class="ev-native-toolbar">
          <button onmousedown="event.stopPropagation()" onclick="event.stopPropagation();evSelectSection('emitente')">✏️ Editar</button>
          <span class="ev-sep"></span>
          <button onmousedown="event.stopPropagation()" onclick="event.stopPropagation();evToggleSection('emitente',false)">🙈 Ocultar</button>
        </div>
        <div class="ev-sec-resize-v" onmousedown="evStartSecResize(event,'emitente','h')"></div>
        <div style="font-size:${m._nomeMainSize||22}px;font-weight:700;color:#111827;letter-spacing:-.3px;margin-bottom:2px">${esc(m.nome||'')}</div>
        ${m.end?`<div style="font-size:12px;color:#6b7280">${esc(m.end)}</div>`:''}
        ${m.nome||m.end?`<div style="font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:.1em;font-weight:700;margin-top:5px">${tipoInfo(m.tipo||'nfse').full}</div>`:''}
      </div>`
      :`<div onclick="evToggleSection('emitente',true)" style="border:1.5px dashed rgba(0,0,0,.1);border-radius:6px;padding:8px;text-align:center;color:#9ca3af;font-size:12px;cursor:pointer;margin-bottom:1rem">+ Mostrar emitente</div>`}

      <!-- Cliente -->
      ${evSections.cliente.visible?`
      <div id="ev-sec-cliente" class="ev-native${evSelSection==='cliente'?' ev-selected':''}"
        onclick="event.stopPropagation();evSelectSection('cliente')"
        style="margin-bottom:1.5rem;position:relative${evSections.cliente.h?';min-height:'+evSections.cliente.h+'px':''}">
        <div class="ev-native-toolbar">
          <button onmousedown="event.stopPropagation()" onclick="event.stopPropagation();evSelectSection('cliente')">✏️ Editar</button>
          <span class="ev-sep"></span>
          <button onmousedown="event.stopPropagation()" onclick="event.stopPropagation();evToggleSection('cliente',false)">🙈 Ocultar</button>
        </div>
        <div class="ev-sec-resize-v" onmousedown="evStartSecResize(event,'cliente','h')"></div>
        ${m.cnom||m.ccnpj?`
          <div style="font-size:9px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.14em;margin-bottom:5px">Faturado para</div>
          <div style="font-size:${m._clienteSize||14}px;font-weight:600;color:#111827;margin-bottom:2px">${esc(m.cnom||'')}</div>
          ${m.ccnpj?`<div style="font-size:12px;color:#6b7280">CNPJ/CPF: ${esc(m.ccnpj)}</div>`:''}
          ${m.cend?`<div style="font-size:12px;color:#6b7280">${esc(m.cend)}</div>`:''}
          ${m.cemail?`<div style="font-size:12px;color:#6b7280">${esc(m.cemail)}</div>`:''}`
        :`<div style="font-size:12px;color:#9ca3af;padding:4px 0">+ Clique para editar dados do cliente</div>`}
      </div>`
      :`<div onclick="evToggleSection('cliente',true)" style="border:1.5px dashed rgba(0,0,0,.1);border-radius:6px;padding:8px;text-align:center;color:#9ca3af;font-size:12px;cursor:pointer;margin-bottom:1rem">+ Mostrar cliente</div>`}

      <!-- Itens -->
      ${evSections.itens.visible?`
      <div id="ev-sec-itens" class="ev-native${evSelSection==='itens'?' ev-selected':''}"
        onclick="event.stopPropagation();evSelectSection('itens')"
        style="margin-bottom:1.25rem;position:relative${evSections.itens.h?';min-height:'+evSections.itens.h+'px':''}">
        <div class="ev-native-toolbar">
          <button onmousedown="event.stopPropagation()" onclick="event.stopPropagation();evSelectSection('itens')">✏️ Editar</button>
          <span class="ev-sep"></span>
          <button onmousedown="event.stopPropagation()" onclick="event.stopPropagation();evToggleSection('itens',false)">🙈 Ocultar</button>
        </div>
        <div class="ev-sec-resize-v" onmousedown="evStartSecResize(event,'itens','h')"></div>
        <table style="width:100%;border-collapse:collapse">
          <thead style="background:#f9fafb"><tr>
            <th style="font-size:${m._headerSize||10}px;font-weight:700;color:#6b7280;text-transform:uppercase;padding:9px 12px;text-align:left;border-bottom:1.5px solid #e5e7eb">Descrição</th>
            <th style="font-size:${m._headerSize||10}px;font-weight:700;color:#6b7280;text-transform:uppercase;padding:9px 12px;text-align:center;border-bottom:1.5px solid #e5e7eb;width:55px">Qtd</th>
            <th style="font-size:${m._headerSize||10}px;font-weight:700;color:#6b7280;text-transform:uppercase;padding:9px 12px;text-align:center;border-bottom:1.5px solid #e5e7eb;width:55px">Un.</th>
            <th style="font-size:${m._headerSize||10}px;font-weight:700;color:#6b7280;text-transform:uppercase;padding:9px 12px;text-align:right;border-bottom:1.5px solid #e5e7eb;width:100px">Unit.</th>
            <th style="font-size:${m._headerSize||10}px;font-weight:700;color:#6b7280;text-transform:uppercase;padding:9px 12px;text-align:right;border-bottom:1.5px solid #e5e7eb;width:100px">Total</th>
          </tr></thead>
          <tbody>${iRows}</tbody>
        </table>
      </div>`
      :`<div onclick="evToggleSection('itens',true)" style="border:1.5px dashed rgba(0,0,0,.1);border-radius:6px;padding:8px;text-align:center;color:#9ca3af;font-size:12px;cursor:pointer;margin-bottom:1rem">+ Mostrar itens</div>`}

      <!-- Totais -->
      ${evSections.totais.visible?`
      <div id="ev-sec-totais" class="ev-native${evSelSection==='totais'?' ev-selected':''}"
        onclick="event.stopPropagation();evSelectSection('totais')"
        style="display:flex;justify-content:flex-end;margin-bottom:1.25rem;position:relative">
        <div class="ev-native-toolbar">
          <button onmousedown="event.stopPropagation()" onclick="event.stopPropagation();evSelectSection('totais')">✏️ Editar</button>
          <span class="ev-sep"></span>
          <button onmousedown="event.stopPropagation()" onclick="event.stopPropagation();evToggleSection('totais',false)">🙈 Ocultar</button>
        </div>
        <div style="width:${evSections.totais.w||220}px;background:#f9fafb;border-radius:8px;padding:1rem 1.25rem;position:relative">
          <!-- Handle para redimensionar largura dos totais -->
          <div class="ev-sec-resize-h" style="left:0;right:auto;border-radius:4px 0 0 4px" onmousedown="evStartSecResize(event,'totais','w-rev')" title="Arrastar para redimensionar"></div>
          <div style="display:flex;justify-content:space-between;font-size:${m._totaisSize||13}px;color:#6b7280;padding:3px 0">
            <span>Subtotal</span>
            <span style="font-weight:500;color:#374151">${fmtM(sub)}</span>
          </div>
          ${descVal>0?`<div style="display:flex;justify-content:space-between;font-size:${m._totaisSize||13}px;color:#6b7280;padding:3px 0"><span>Desconto</span><span style="font-weight:500">− ${fmtM(descVal)}</span></div>`:''}
          ${taxVal>0?`<div style="display:flex;justify-content:space-between;font-size:${m._totaisSize||13}px;color:#6b7280;padding:3px 0"><span>Impostos/Taxas</span><span style="font-weight:500">${fmtM(taxVal)}</span></div>`:''}
          <div style="display:flex;justify-content:space-between;font-size:${m._totalFinalSize||16}px;font-weight:700;color:#111827;border-top:1.5px solid #e5e7eb;padding-top:10px;margin-top:6px"><span>Total</span><span>${fmtM(total)}</span></div>
        </div>
      </div>`
      :`<div onclick="evToggleSection('totais',true)" style="border:1.5px dashed rgba(0,0,0,.1);border-radius:6px;padding:8px;text-align:center;color:#9ca3af;font-size:12px;cursor:pointer;margin-bottom:1rem">+ Mostrar totais</div>`}

      <!-- Observações -->
      ${evSections.obs.visible?`
      <div id="ev-sec-obs" class="ev-native${evSelSection==='obs'?' ev-selected':''}"
        onclick="event.stopPropagation();evSelectSection('obs')"
        style="background:#f9fafb;border-radius:8px;padding:1rem 1.25rem;margin-bottom:1rem;position:relative${evSections.obs.h?';min-height:'+evSections.obs.h+'px':''}">
        <div class="ev-native-toolbar">
          <button onmousedown="event.stopPropagation()" onclick="event.stopPropagation();evSelectSection('obs')">✏️ Editar</button>
          <span class="ev-sep"></span>
          <button onmousedown="event.stopPropagation()" onclick="event.stopPropagation();evToggleSection('obs',false)">🙈 Ocultar</button>
        </div>
        <div class="ev-sec-resize-v" onmousedown="evStartSecResize(event,'obs','h')"></div>
        ${m.obs?`<div style="font-size:9px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.14em;margin-bottom:5px">Observações</div>
        <div style="font-size:${m._obsSize||12}px;color:#6b7280;line-height:1.75">${esc(m.obs)}</div>`
        :`<div style="font-size:12px;color:#9ca3af;padding:4px 0">+ Clique para adicionar observações</div>`}
      </div>`
      :`<div onclick="evToggleSection('obs',true)" style="border:1.5px dashed rgba(0,0,0,.1);border-radius:6px;padding:8px;text-align:center;color:#9ca3af;font-size:12px;cursor:pointer;margin-bottom:1rem">+ Mostrar observações</div>`}

      <!-- Fotos -->
      ${evSections.fotos.visible&&nfImages.length>0?`
      <div id="ev-sec-fotos" class="ev-native${evSelSection==='fotos'?' ev-selected':''}"
        onclick="event.stopPropagation();evSelectSection('fotos')"
        style="position:relative${evSections.fotos.h?';min-height:'+evSections.fotos.h+'px':''}">
        <div class="ev-native-toolbar">
          <button onmousedown="event.stopPropagation()" onclick="event.stopPropagation();evToggleSection('fotos',false)">🙈 Ocultar</button>
        </div>
        <div class="ev-sec-resize-v" onmousedown="evStartSecResize(event,'fotos','h')"></div>
        <div style="font-size:9px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.14em;margin-bottom:8px">Fotos do serviço</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(${evSections.fotos.fotoSize||120}px,1fr));gap:8px">
          ${nfImages.map((u,i)=>`
            <div style="position:relative;border-radius:6px;overflow:hidden;aspect-ratio:4/3">
              <img src="${esc(u)}" style="width:100%;height:100%;object-fit:cover"/>
              <button onclick="event.stopPropagation();nfImages.splice(${i},1);evRenderCanvas()" style="position:absolute;top:4px;right:4px;background:rgba(0,0,0,.7);border:none;border-radius:50%;width:20px;height:20px;cursor:pointer;color:#fff;font-size:11px">×</button>
            </div>`).join('')}
        </div>
      </div>`:``}

      <!-- Elementos extras -->
      ${evElements.map(e=>evRenderEl(e)).join('')}
    </div>
  </div>`;

  evInitMouseEvents();
  evUpdatePropsIfNeeded();
}

/* ══ RESIZE DE SEÇÕES NATIVAS ══ */
window.evStartSecResize = (e, secId, dir) => {
  e.preventDefault(); e.stopPropagation();
  const startX = e.clientX, startY = e.clientY;
  const sec = evSections[secId];
  const startW = sec.w || 200;
  const startH = sec.h || 80;

  const onMove = ev => {
    if(dir==='w') {
      const newW = Math.max(sec.minW||80, Math.min(sec.maxW||400, startW + (ev.clientX-startX)));
      evSections[secId].w = newW;
    } else if(dir==='w-rev') {
      // Totais: arrasta da esquerda para aumentar para a direita
      const newW = Math.max(sec.minW||80, Math.min(sec.maxW||400, startW - (ev.clientX-startX)));
      evSections[secId].w = newW;
    } else if(dir==='h') {
      const newH = Math.max(40, startH + (ev.clientY-startY));
      evSections[secId].h = newH;
    }
    evRenderCanvas();
  };

  const onUp = () => {
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
  };

  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
};

/* ══ RENDER DE ELEMENTO LIVRE ══ */
function evRenderEl(e) {
  const sel = evSelected===e.id ? 'ev-selected' : '';
  const baseStyle = `left:${e.x}px;top:${e.y}px;width:${e.w||200}px;${e.h?'height:'+e.h+'px;':''}z-index:50`;

  if(e.type==='texto') return `<div id="ev-el-${e.id}" class="ev-el ${sel}" style="${baseStyle}"
    onmousedown="evStartDrag(event,'${e.id}')" onclick="event.stopPropagation();evSelectEl('${e.id}')">
    <div class="ev-toolbar">
      <button onmousedown="event.stopPropagation()" onclick="event.stopPropagation();evDeleteEl('${e.id}')">🗑</button>
      <span class="ev-sep"></span>
      <input type="color" value="${e.color||'#111827'}" onmousedown="event.stopPropagation()" onchange="evColorEl('${e.id}',this.value)" style="width:24px"/>
      <select onmousedown="event.stopPropagation()" onchange="evFontSizeEl('${e.id}',this.value)">
        ${[8,10,11,12,13,14,16,18,20,24,28,32,36,40,48,56].map(s=>`<option value="${s}" ${(e.size||14)===s?'selected':''}>${s}px</option>`).join('')}
      </select>
      <button onmousedown="event.stopPropagation()" onclick="event.stopPropagation();evBoldEl('${e.id}')" style="${e.bold?'color:#c9a84c':''}">B</button>
      <button onmousedown="event.stopPropagation()" onclick="event.stopPropagation();evItalicEl('${e.id}')" style="${e.italic?'color:#c9a84c':'font-style:italic'}">I</button>
    </div>
    <div contenteditable="true"
      style="font-size:${e.size||14}px;color:${e.color||'#111827'};font-weight:${e.bold?700:400};font-style:${e.italic?'italic':'normal'};font-family:'Outfit',sans-serif;outline:none;padding:2px;line-height:1.5;word-break:break-word;min-width:40px"
      onmousedown="event.stopPropagation()" onclick="event.stopPropagation()"
      onblur="evSaveText('${e.id}',this.innerText)">${esc(e.text||'Texto livre')}</div>
    <div class="ev-resize" onmousedown="event.stopPropagation();evStartResize(event,'${e.id}')"></div>
  </div>`;

  if(e.type==='imagem') return `<div id="ev-el-${e.id}" class="ev-el ${sel}" style="${baseStyle}"
    onmousedown="evStartDrag(event,'${e.id}')" onclick="event.stopPropagation();evSelectEl('${e.id}')">
    <div class="ev-toolbar">
      <button onmousedown="event.stopPropagation()" onclick="event.stopPropagation();evDeleteEl('${e.id}')">🗑</button>
      <span class="ev-sep"></span>
      <button onmousedown="event.stopPropagation()" onclick="event.stopPropagation();evTrocarImg('${e.id}')">🔄 Trocar</button>
    </div>
    <img src="${esc(e.src||'')}" style="width:100%;display:block;pointer-events:none;border-radius:${e.radius||0}px"/>
    <div class="ev-resize" onmousedown="event.stopPropagation();evStartResize(event,'${e.id}')"></div>
  </div>`;

  if(e.type==='linha') return `<div id="ev-el-${e.id}" class="ev-el ${sel}" style="${baseStyle};padding:10px 0"
    onmousedown="evStartDrag(event,'${e.id}')" onclick="event.stopPropagation();evSelectEl('${e.id}')">
    <div class="ev-toolbar">
      <button onmousedown="event.stopPropagation()" onclick="event.stopPropagation();evDeleteEl('${e.id}')">🗑</button>
      <span class="ev-sep"></span>
      <input type="color" value="${e.color||'#e5e7eb'}" onmousedown="event.stopPropagation()" onchange="evColorEl('${e.id}',this.value)" style="width:24px"/>
      <select onmousedown="event.stopPropagation()" onchange="evLineHeight('${e.id}',this.value)">
        <option value="1">1px</option><option value="2" ${(e.lh||1)===2?'selected':''}>2px</option><option value="3" ${(e.lh||1)===3?'selected':''}>3px</option>
      </select>
    </div>
    <hr style="border:none;border-top:${e.lh||1}px solid ${e.color||'#e5e7eb'};margin:0;pointer-events:none"/>
    <div class="ev-resize" onmousedown="event.stopPropagation();evStartResize(event,'${e.id}')"></div>
  </div>`;

  if(e.type==='retangulo') return `<div id="ev-el-${e.id}" class="ev-el ${sel}" style="${baseStyle};height:${e.h||60}px"
    onmousedown="evStartDrag(event,'${e.id}')" onclick="event.stopPropagation();evSelectEl('${e.id}')">
    <div class="ev-toolbar">
      <button onmousedown="event.stopPropagation()" onclick="event.stopPropagation();evDeleteEl('${e.id}')">🗑</button>
      <span class="ev-sep"></span>
      <span style="font-size:10px;color:#94a3b8">Fundo:</span>
      <input type="color" value="${e.fill||'#f3f4f6'}" onmousedown="event.stopPropagation()" onchange="evFillEl('${e.id}',this.value)" style="width:24px"/>
      <span style="font-size:10px;color:#94a3b8">Borda:</span>
      <input type="color" value="${e.stroke||'#e5e7eb'}" onmousedown="event.stopPropagation()" onchange="evStrokeEl('${e.id}',this.value)" style="width:24px"/>
    </div>
    <div style="width:100%;height:100%;background:${e.fill||'#f3f4f6'};border:${e.sw||1}px solid ${e.stroke||'#e5e7eb'};border-radius:${e.radius||6}px;pointer-events:none"></div>
    <div class="ev-resize" onmousedown="event.stopPropagation();evStartResize(event,'${e.id}')"></div>
  </div>`;
  return '';
}

/* ══ SELEÇÃO ══ */
window.evSelectEl      = id => { evSelected=id; evSelSection=null; evRenderCanvas(); evUpdateProps(); };
window.evSelectSection = id => { evSelSection=id; evSelected=null; evRenderCanvas(); evUpdatePropsSection(id); };
window.evToggleSection = (id,vis) => {
  evSections[id].visible = vis!==undefined ? vis : !evSections[id].visible;
  const chk=document.getElementById('chk-sec-'+id); if(chk)chk.checked=evSections[id].visible;
  if(evSelSection===id&&!evSections[id].visible) evSelSection=null;
  evRenderCanvas();
};

function evUpdatePropsIfNeeded() { if(evSelSection) evUpdatePropsSection(evSelSection); else evUpdateProps(); }

/* ══ PAINEL DE PROPRIEDADES ══ */
function evUpdateProps() {
  const props=document.getElementById('ev-props'); if(!props)return;
  if(evSelected) {
    const e=evElements.find(x=>x.id===evSelected); if(!e)return;
    props.innerHTML=`<div style="font-size:10px;font-weight:700;color:var(--text3);letter-spacing:.12em;text-transform:uppercase;margin-bottom:.75rem">Elemento selecionado</div>
      <p style="font-size:12px;color:var(--text3);margin-bottom:1rem">Use a barra de ferramentas <strong style="color:var(--gold)">acima do elemento</strong> para cor, tamanho e outras opções.<br/><br/>Arraste para mover. Quadrado dourado no canto para redimensionar.</p>
      <button class="btn btn-danger btn-sm" style="width:100%;justify-content:center" onclick="evDeleteEl('${e.id}')">🗑 Deletar elemento</button>`;
    return;
  }
  props.innerHTML=`<div style="font-size:10px;font-weight:700;color:var(--text3);letter-spacing:.12em;text-transform:uppercase;margin-bottom:.75rem">Propriedades</div>
    <p style="font-size:12px;color:var(--text3)">Clique em qualquer seção da nota para editar suas propriedades.</p>`;
}

function evUpdatePropsSection(id) {
  const props=document.getElementById('ev-props'); if(!props)return;
  const m=nfModel||{}, moeda=m.moeda||'BRL';
  const sub = evSubtotalManual!==null ? evSubtotalManual :
    nfItems.reduce((a,it)=>a+(parseFloat(it.total)||0),0);

  const slider = (label, key, min, max, def, unit='px') =>
    `<div class="field"><label>${label} <span id="v-${key}">${m['_'+key]||def}${unit}</span></label>
      <input type="range" min="${min}" max="${max}" step="1" value="${m['_'+key]||def}" style="width:100%"
        oninput="nfModel['_${key}']=parseInt(this.value);document.getElementById('v-${key}').textContent=this.value+'${unit}';evRenderCanvas()"/></div>`;

  const ocultarBtn = (sec) =>
    `<button class="btn btn-danger btn-sm" style="width:100%;justify-content:center;margin-top:6px" onclick="evToggleSection('${sec}',false)">🙈 Ocultar seção</button>`;

  const panels = {
    logo: `
      <div style="font-size:13px;font-weight:600;margin-bottom:.75rem">Barra lateral</div>
      <div class="field"><label>Largura <span id="v-sw">${evSections.logo.w||200}px</span></label>
        <input type="range" min="120" max="320" step="5" value="${evSections.logo.w||200}" style="width:100%"
          oninput="evSections.logo.w=parseInt(this.value);document.getElementById('v-sw').textContent=this.value+'px';evRenderCanvas()"/></div>
      <div class="field"><label>Logo</label>
        <div class="upload-area" onclick="document.getElementById('ev-logo-up').click()" style="padding:8px;text-align:center">
          <input type="file" id="ev-logo-up" accept="image/*" style="display:none" onchange="evUpLogo(this)"/>
          ${nfLogo?`<img src="${esc(nfLogo)}" style="max-height:36px;margin:0 auto;display:block"/><br/>`:''}
          <span style="font-size:11px;color:var(--text2)">${nfLogo?'Trocar logo':'Upload do logo'}</span>
        </div>
        ${nfLogo?`<button class="btn btn-danger btn-sm" style="width:100%;justify-content:center;margin-top:4px" onclick="nfLogo=null;evRenderCanvas()">Remover logo</button>`:''}
      </div>
      ${slider('Nome (tamanho)','nomeSize',10,28,16)}
      ${slider('Número (tamanho)','numSize',10,24,14)}
      ${slider('Total (tamanho)','totalSize',11,26,15)}
      ${slider('Contato (tamanho)','contatoSize',9,16,11)}
      <div class="field"><label>Número da nota</label><input value="${esc(m.numero||'')}" oninput="nfModel.numero=this.value;evRenderCanvas()"/></div>
      <div class="field"><label>Emissão</label><input type="date" value="${esc(m.data||nowDate())}" oninput="nfModel.data=this.value;evRenderCanvas()"/></div>
      <div class="field"><label>Vencimento</label><input type="date" value="${esc(m.venc||'')}" oninput="nfModel.venc=this.value;evRenderCanvas()"/></div>
      ${ocultarBtn('logo')}`,

    emitente: `
      <div style="font-size:13px;font-weight:600;margin-bottom:.75rem">Emitente</div>
      <div class="field"><label>Nome / Razão Social</label><input value="${esc(m.nome||'')}" oninput="nfModel.nome=this.value;evRenderCanvas()"/></div>
      <div class="field"><label>Endereço</label><input value="${esc(m.end||'')}" oninput="nfModel.end=this.value;evRenderCanvas()"/></div>
      <div class="field"><label>CNPJ / CPF</label><input value="${esc(m.cnpj||'')}" oninput="nfModel.cnpj=this.value;evRenderCanvas()"/></div>
      <div class="field"><label>E-mail</label><input value="${esc(m.email||'')}" oninput="nfModel.email=this.value;evRenderCanvas()"/></div>
      <div class="field"><label>Telefone</label><input value="${esc(m.tel||'')}" oninput="nfModel.tel=this.value;evRenderCanvas()"/></div>
      ${slider('Tamanho do nome','nomeMainSize',14,40,22)}
      <div class="field"><label>Altura mínima <span id="v-eh">${evSections.emitente.h||'auto'}</span></label>
        <input type="range" min="0" max="300" step="10" value="${evSections.emitente.h||0}" style="width:100%"
          oninput="evSections.emitente.h=parseInt(this.value)||null;document.getElementById('v-eh').textContent=(parseInt(this.value)||0)+'px';evRenderCanvas()"/></div>
      ${ocultarBtn('emitente')}`,

    cliente: `
      <div style="font-size:13px;font-weight:600;margin-bottom:.75rem">Cliente</div>
      <div class="field"><label>Nome / Razão Social</label><input value="${esc(m.cnom||'')}" oninput="nfModel.cnom=this.value;evRenderCanvas()"/></div>
      <div class="field"><label>CNPJ / CPF</label><input value="${esc(m.ccnpj||'')}" oninput="nfModel.ccnpj=this.value;evRenderCanvas()"/></div>
      <div class="field"><label>Endereço</label><input value="${esc(m.cend||'')}" oninput="nfModel.cend=this.value;evRenderCanvas()"/></div>
      <div class="field"><label>E-mail</label><input value="${esc(m.cemail||'')}" oninput="nfModel.cemail=this.value;evRenderCanvas()"/></div>
      ${slider('Tamanho do nome','clienteSize',11,24,14)}
      <div class="field"><label>Altura mínima <span id="v-ch">${evSections.cliente.h||'auto'}</span></label>
        <input type="range" min="0" max="200" step="10" value="${evSections.cliente.h||0}" style="width:100%"
          oninput="evSections.cliente.h=parseInt(this.value)||null;document.getElementById('v-ch').textContent=(parseInt(this.value)||0)+'px';evRenderCanvas()"/></div>
      ${ocultarBtn('cliente')}`,

    itens: `
      <div style="font-size:13px;font-weight:600;margin-bottom:.75rem">Itens / serviços</div>
      ${slider('Tamanho do cabeçalho','headerSize',8,16,10)}
      ${nfItems.map((it,i)=>`
        <div style="background:var(--bg3);border-radius:var(--rs);padding:10px;margin-bottom:8px">
          <div style="font-size:11px;font-weight:600;color:var(--text3);margin-bottom:6px">Item ${i+1}</div>
          <div class="field" style="margin-bottom:5px"><label>Descrição</label>
            <input value="${esc(it.desc||'')}" style="font-size:12px" oninput="nfItems[${i}].desc=this.value;evRenderCanvas()"/></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-bottom:5px">
            <div class="field" style="margin:0"><label>Qtd</label>
              <input type="number" value="${it.qty||1}" min="0.01" step="any" style="font-size:12px"
                oninput="nfItems[${i}].qty=parseFloat(this.value)||1;nfItems[${i}].total=+(nfItems[${i}].qty*(parseFloat(nfItems[${i}].price)||0)).toFixed(2);evSubtotalManual=null;evRenderCanvas()"/></div>
            <div class="field" style="margin:0"><label>Unidade</label>
              <input value="${esc(it.unit||'un')}" style="font-size:12px" oninput="nfItems[${i}].unit=this.value;evRenderCanvas()"/></div>
          </div>
          <div class="field" style="margin-bottom:5px"><label>Valor unit.</label>
            <input type="number" value="${it.price||0}" min="0" step="0.01" style="font-size:12px"
              oninput="nfItems[${i}].price=parseFloat(this.value)||0;nfItems[${i}].total=+(nfItems[${i}].qty*(parseFloat(nfItems[${i}].price)||0)).toFixed(2);evSubtotalManual=null;evRenderCanvas()"/></div>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="font-size:12px;color:var(--gold);font-weight:600">= ${fmt(it.total||0,moeda)}</span>
            ${nfItems.length>1?`<button class="btn btn-danger btn-sm" style="font-size:11px;padding:3px 8px" onclick="nfItems.splice(${i},1);evSubtotalManual=null;evSelectSection('itens')">Remover</button>`:''}
          </div>
        </div>`).join('')}
      <button class="btn btn-ghost btn-sm" style="width:100%;justify-content:center;margin-bottom:8px"
        onclick="nfItems.push({desc:'',qty:1,unit:'un',price:0,total:0});evSelectSection('itens')">+ Adicionar item</button>
      ${ocultarBtn('itens')}`,

    totais: `
      <div style="font-size:13px;font-weight:600;margin-bottom:.75rem">Totais</div>
      <div class="field"><label>Largura do bloco <span id="v-tw">${evSections.totais.w||220}px</span></label>
        <input type="range" min="160" max="380" step="10" value="${evSections.totais.w||220}" style="width:100%"
          oninput="evSections.totais.w=parseInt(this.value);document.getElementById('v-tw').textContent=this.value+'px';evRenderCanvas()"/></div>
      <div class="field"><label>Subtotal manual</label>
        <div style="display:flex;gap:6px;align-items:center">
          <input type="number" id="inp-sub" value="${evSubtotalManual!==null?evSubtotalManual:''}" placeholder="Automático" min="0" step="0.01"
            style="flex:1;font-size:13px" oninput="evSubtotalManual=this.value!==''?parseFloat(this.value):null;evRenderCanvas()"/>
          <button class="btn btn-ghost btn-sm" onclick="evSubtotalManual=null;document.getElementById('inp-sub').value='';evRenderCanvas()">Auto</button>
        </div>
        <div class="field" style="margin:.5rem 0 0"><span style="font-size:11px;color:var(--text3)">Deixe em branco para calcular automaticamente dos itens</span></div>
      </div>
      <div class="field"><label>Desconto (${moeda})</label>
        <input type="number" value="${m.desconto||0}" min="0" step="0.01" oninput="nfModel.desconto=this.value;evRenderCanvas()"/></div>
      <div class="field"><label>Impostos / Taxas (${moeda})</label>
        <input type="number" value="${m.impostos||0}" min="0" step="0.01" oninput="nfModel.impostos=this.value;evRenderCanvas()"/></div>
      ${slider('Tamanho das linhas','totaisSize',11,18,13)}
      ${slider('Tamanho do total final','totalFinalSize',13,28,16)}
      ${ocultarBtn('totais')}`,

    obs: `
      <div style="font-size:13px;font-weight:600;margin-bottom:.75rem">Observações</div>
      <div class="field"><label>Texto</label>
        <textarea style="min-height:90px" oninput="nfModel.obs=this.value;evRenderCanvas()">${esc(m.obs||'')}</textarea></div>
      ${slider('Tamanho do texto','obsSize',10,18,12)}
      <div class="field"><label>Altura mínima <span id="v-oh">${evSections.obs.h||'auto'}</span></label>
        <input type="range" min="0" max="300" step="10" value="${evSections.obs.h||0}" style="width:100%"
          oninput="evSections.obs.h=parseInt(this.value)||null;document.getElementById('v-oh').textContent=(parseInt(this.value)||0)+'px';evRenderCanvas()"/></div>
      ${ocultarBtn('obs')}`,

    fotos: `
      <div style="font-size:13px;font-weight:600;margin-bottom:.75rem">Fotos</div>
      <div class="upload-area" onclick="document.getElementById('ev-foto-up').click()" style="padding:8px;text-align:center;margin-bottom:8px">
        <input type="file" id="ev-foto-up" accept="image/*" multiple style="display:none" onchange="evUpFotos(this)"/>
        <span style="font-size:12px;color:var(--text2)">+ Adicionar fotos</span>
      </div>
      <div class="field"><label>Tamanho das fotos <span id="v-fs">${evSections.fotos.fotoSize||120}px</span></label>
        <input type="range" min="80" max="280" step="10" value="${evSections.fotos.fotoSize||120}" style="width:100%"
          oninput="evSections.fotos.fotoSize=parseInt(this.value);document.getElementById('v-fs').textContent=this.value+'px';evRenderCanvas()"/></div>
      ${ocultarBtn('fotos')}`,
  };

  const html = panels[id];
  if(html) props.innerHTML = html;
}

/* ══ MOUSE EVENTS ══ */
function evInitMouseEvents() {
  const center = document.getElementById('ev-center');
  if(center) center.onclick = e => {
    if(e.target===center||e.target.id==='ev-nota'||e.target.id==='ev-center') {
      evSelected=null; evSelSection=null; evRenderCanvas();
    }
  };
}

window.evStartDrag = (e,id) => {
  if(['INPUT','SELECT','BUTTON'].includes(e.target.tagName)||e.target.isContentEditable) return;
  evDragging=id;
  const el=evElements.find(x=>x.id===id); if(!el)return;
  const nota=document.getElementById('ev-nota'); if(!nota)return;
  const rect=nota.getBoundingClientRect();
  evDragOffset={x:e.clientX-rect.left-el.x, y:e.clientY-rect.top-el.y};
  e.preventDefault();
};

window.evStartResize = (e,id) => {
  const el=evElements.find(x=>x.id===id); if(!el)return;
  const sX=e.clientX, sW=el.w||100, sH=el.h||60, sY=e.clientY;
  const onMove=ev=>{
    el.w=Math.max(40,sW+(ev.clientX-sX));
    if(el.type==='retangulo')el.h=Math.max(20,sH+(ev.clientY-sY));
    const d=document.getElementById('ev-el-'+id);
    if(d){d.style.width=el.w+'px';if(el.h)d.style.height=el.h+'px';}
  };
  const onUp=()=>{evRenderCanvas();document.removeEventListener('mousemove',onMove);document.removeEventListener('mouseup',onUp);};
  document.addEventListener('mousemove',onMove); document.addEventListener('mouseup',onUp);
  e.preventDefault(); e.stopPropagation();
};

document.addEventListener('mousemove', e=>{
  if(!evDragging)return;
  const el=evElements.find(x=>x.id===evDragging); if(!el)return;
  const nota=document.getElementById('ev-nota'); if(!nota)return;
  const rect=nota.getBoundingClientRect();
  el.x=Math.max(0,e.clientX-rect.left-evDragOffset.x);
  el.y=Math.max(0,e.clientY-rect.top-evDragOffset.y);
  const d=document.getElementById('ev-el-'+evDragging);
  if(d){d.style.left=el.x+'px';d.style.top=el.y+'px';}
});

document.addEventListener('mouseup',()=>{evDragging=null;});

/* ══ FUNÇÕES DOS ELEMENTOS ══ */
window.evAddTexto     = ()=>{const id=newId();evElements.push({id,type:'texto',text:'Texto',x:220,y:60,w:180,size:14,color:'#111827',bold:false,italic:false});evSelected=id;evSelSection=null;evRenderCanvas();evUpdateProps();};
window.evAddImagem    = ()=>{const inp=document.createElement('input');inp.type='file';inp.accept='image/*';inp.onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{const id=newId();evElements.push({id,type:'imagem',src:ev.target.result,x:220,y:60,w:150});evSelected=id;evSelSection=null;evRenderCanvas();};r.readAsDataURL(f);};inp.click();};
window.evAddLinha     = ()=>{const id=newId();evElements.push({id,type:'linha',x:220,y:200,w:300,color:'#e5e7eb',lh:1});evSelected=id;evSelSection=null;evRenderCanvas();};
window.evAddRetangulo = ()=>{const id=newId();evElements.push({id,type:'retangulo',x:220,y:80,w:160,h:80,fill:'#f3f4f6',stroke:'#e5e7eb',sw:1,radius:6});evSelected=id;evSelSection=null;evRenderCanvas();};
window.evDeleteEl     = id=>{evElements=evElements.filter(e=>e.id!==id);if(evSelected===id){evSelected=null;}evRenderCanvas();evUpdateProps();};
window.evColorEl      = (id,v)=>{const e=evElements.find(x=>x.id===id);if(e){e.color=v;evRenderCanvas();}};
window.evFillEl       = (id,v)=>{const e=evElements.find(x=>x.id===id);if(e){e.fill=v;evRenderCanvas();}};
window.evStrokeEl     = (id,v)=>{const e=evElements.find(x=>x.id===id);if(e){e.stroke=v;evRenderCanvas();}};
window.evFontSizeEl   = (id,v)=>{const e=evElements.find(x=>x.id===id);if(e){e.size=parseInt(v);evRenderCanvas();}};
window.evLineHeight   = (id,v)=>{const e=evElements.find(x=>x.id===id);if(e){e.lh=parseInt(v);evRenderCanvas();}};
window.evBoldEl       = id=>{const e=evElements.find(x=>x.id===id);if(e){e.bold=!e.bold;evRenderCanvas();}};
window.evItalicEl     = id=>{const e=evElements.find(x=>x.id===id);if(e){e.italic=!e.italic;evRenderCanvas();}};
window.evSaveText     = (id,t)=>{const e=evElements.find(x=>x.id===id);if(e)e.text=t;};
window.evTrocarImg    = id=>{const inp=document.createElement('input');inp.type='file';inp.accept='image/*';inp.onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{const el=evElements.find(x=>x.id===id);if(el){el.src=ev.target.result;evRenderCanvas();}};r.readAsDataURL(f);};inp.click();};
window.evUpLogo       = inp=>{const f=inp.files[0];if(!f)return;const r=new FileReader();r.onload=e=>{nfLogo=e.target.result;evRenderCanvas();};r.readAsDataURL(f);};
window.evUpFotos      = inp=>{Array.from(inp.files).forEach(f=>{const r=new FileReader();r.onload=e=>{nfImages.push(e.target.result);evRenderCanvas();};r.readAsDataURL(f);});};
window.evSetBg        = (bg,b)=>{evBg=bg;evBgBorder=b;evRenderCanvas();};
window.evSetSidebar   = c=>{activeTheme.sidebar=c;evRenderCanvas();};
window.evSetAccent    = c=>{activeTheme.accent=c;activeTheme.accentL=c;evRenderCanvas();};

/* ══ SALVAR / PDF ══ */
window.salvarDoEditor = ()=>{
  nfModel._evElements=evElements; nfModel._evBg=evBg;
  nfModel._evSections=evSections; nfModel._evBorda=evBorda;
  nfModel._evSubManual=evSubtotalManual;
  salvar(false);
};
window.pdfDoEditor = ()=>{
  nfModel._evElements=evElements; nfModel._evBg=evBg;
  nfModel._evSections=evSections; nfModel._evBorda=evBorda;
  nfModel._evSubManual=evSubtotalManual;
  salvar(false); setTimeout(()=>abrirPDF(),300);
};

/* Utilitário */
function deepMerge(target, source) {
  const out = {...target};
  for(const k in source) {
    if(source[k]&&typeof source[k]==='object'&&!Array.isArray(source[k]))
      out[k]={...target[k],...source[k]};
    else out[k]=source[k];
  }
  return out;
}
