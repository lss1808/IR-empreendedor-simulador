/* ══════════════════════════════════════════
   EDITOR VISUAL DE NOTA FISCAL — estilo Canva
   Clique para editar · arraste · redimensione
══════════════════════════════════════════ */

function rEditorVisual(el, acts) {
  acts.innerHTML = `
    <button class="btn btn-ghost btn-sm" onclick="go('notas')">← Voltar</button>
    <button class="btn btn-sm" onclick="salvarDoEditor()">💾 Salvar nota</button>
    <button class="btn btn-gold btn-sm" onclick="pdfDoEditor()">⬇ Exportar PDF</button>`;

  el.innerHTML = `
  <div style="display:flex;gap:0;height:calc(100vh - 120px);overflow:hidden">

    <!-- PAINEL ESQUERDO: propriedades -->
    <div id="ev-props" style="width:260px;flex-shrink:0;background:var(--bg2);border-right:.5px solid var(--border);overflow-y:auto;padding:1rem">
      <div style="font-size:10px;font-weight:700;color:var(--text3);letter-spacing:.12em;text-transform:uppercase;margin-bottom:1rem">Propriedades</div>
      <div id="ev-props-content">
        <p style="font-size:12px;color:var(--text3)">Clique em um elemento na nota para editar suas propriedades.</p>
      </div>
    </div>

    <!-- CENTRO: canvas da nota -->
    <div style="flex:1;background:#e5e7eb;overflow:auto;display:flex;justify-content:center;padding:2rem">
      <div id="ev-canvas" style="width:820px;min-height:600px;flex-shrink:0;position:relative">
        <!-- nota renderizada aqui -->
      </div>
    </div>

    <!-- PAINEL DIREITO: elementos -->
    <div style="width:200px;flex-shrink:0;background:var(--bg2);border-left:.5px solid var(--border);overflow-y:auto;padding:1rem">
      <div style="font-size:10px;font-weight:700;color:var(--text3);letter-spacing:.12em;text-transform:uppercase;margin-bottom:1rem">Adicionar</div>
      <button class="ev-add-btn" onclick="evAddTexto()">T Caixa de texto</button>
      <button class="ev-add-btn" onclick="evAddImagem()">🖼 Imagem</button>
      <button class="ev-add-btn" onclick="evAddLinha()">— Linha divisória</button>
      <button class="ev-add-btn" onclick="evAddRetangulo()">▭ Retângulo</button>

      <div style="font-size:10px;font-weight:700;color:var(--text3);letter-spacing:.12em;text-transform:uppercase;margin:1.5rem 0 .75rem">Fundo da nota</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px">
        ${[
          {label:'Branco',bg:'#ffffff',border:'#e5e7eb'},
          {label:'Creme',bg:'#fefce8',border:'#fde68a'},
          {label:'Azul',bg:'#f0f9ff',border:'#bae6fd'},
          {label:'Verde',bg:'#f0fdf4',border:'#bbf7d0'},
          {label:'Cinza',bg:'#f9fafb',border:'#e5e7eb'},
          {label:'Escuro',bg:'#1e293b',border:'#334155'},
        ].map(b=>`<div onclick="evSetBg('${b.bg}','${b.border}')" style="aspect-ratio:1;border-radius:6px;background:${b.bg};border:2px solid ${b.border};cursor:pointer;display:flex;align-items:flex-end;justify-content:center;padding-bottom:3px"><span style="font-size:9px;color:#666">${b.label}</span></div>`).join('')}
      </div>

      <div style="font-size:10px;font-weight:700;color:var(--text3);letter-spacing:.12em;text-transform:uppercase;margin:1.5rem 0 .75rem">Cor da barra lateral</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px">
        ${['#111827','#0c2340','#0d2b1a','#2d0a14','#1e293b','#18181b','#7c3aed','#b45309','#065f46'].map(c=>`<div onclick="evSetSidebar('${c}')" style="aspect-ratio:1;border-radius:6px;background:${c};border:2px solid rgba(255,255,255,.1);cursor:pointer"></div>`).join('')}
      </div>
      <div style="margin-top:8px">
        <label style="font-size:11px;color:var(--text3)">Cor personalizada</label>
        <input type="color" value="${activeTheme.sidebar}" oninput="evSetSidebar(this.value)" style="width:100%;height:32px;border-radius:6px;border:.5px solid var(--border2);cursor:pointer;margin-top:4px"/>
      </div>

      <div style="font-size:10px;font-weight:700;color:var(--text3);letter-spacing:.12em;text-transform:uppercase;margin:1.5rem 0 .75rem">Cor de destaque</div>
      <input type="color" value="${activeTheme.accent}" oninput="evSetAccent(this.value)" style="width:100%;height:32px;border-radius:6px;border:.5px solid var(--border2);cursor:pointer"/>
    </div>

  </div>

  <style>
  .ev-add-btn{display:flex;align-items:center;gap:8px;width:100%;padding:9px 12px;background:var(--bg3);border:.5px solid var(--border2);border-radius:var(--rs);color:var(--text2);font-family:'Outfit',sans-serif;font-size:13px;cursor:pointer;margin-bottom:6px;transition:all .15s;text-align:left}
  .ev-add-btn:hover{background:var(--gold-dim);color:var(--gold);border-color:var(--gold)}
  .ev-element{position:absolute;cursor:move;user-select:none}
  .ev-element:hover .ev-toolbar,.ev-element.selected .ev-toolbar{display:flex}
  .ev-toolbar{display:none;position:absolute;top:-36px;left:0;background:#1e293b;border:.5px solid rgba(255,255,255,.15);border-radius:8px;padding:4px;gap:2px;z-index:100;white-space:nowrap}
  .ev-toolbar button{background:none;border:none;color:#e2e8f0;font-size:12px;padding:3px 8px;cursor:pointer;border-radius:4px;font-family:inherit}
  .ev-toolbar button:hover{background:rgba(255,255,255,.1)}
  .ev-resize-handle{position:absolute;bottom:-4px;right:-4px;width:12px;height:12px;background:var(--gold);border-radius:2px;cursor:se-resize;z-index:10}
  .ev-selected-ring{outline:2px solid var(--gold);outline-offset:2px}
  </style>`;

  evRenderCanvas();
}

/* ── Estado do editor ── */
let evElements = [];   // elementos extras adicionados pelo usuário
let evSelected = null; // id do elemento selecionado
let evBg = '#ffffff';
let evBgBorder = '#e5e7eb';
let evDragging = null;
let evDragOffset = {x:0, y:0};
let evResizing = null;

function evRenderCanvas() {
  const canvas = document.getElementById('ev-canvas');
  if(!canvas) return;
  const m = nfModel||{}, moeda = m.moeda||'BRL';
  const {sub,desc,tax,total} = nfTotals();
  const th = activeTheme;
  const fd = d => { if(!d)return'—'; const s=(d.split('T')[0]).split('-'); return`${s[2]}/${s[1]}/${s[0]}`; };

  const iRows = nfItems.map(it=>`
    <tr>
      <td style="padding:10px 12px;font-size:13px;color:#374151;border-bottom:1px solid #f3f4f6">${esc(it.desc||'—')}</td>
      <td style="padding:10px 12px;font-size:13px;text-align:center;color:#374151;border-bottom:1px solid #f3f4f6">${it.qty||1}</td>
      <td style="padding:10px 12px;font-size:13px;text-align:center;color:#9ca3af;border-bottom:1px solid #f3f4f6">${esc(it.unit||'')}</td>
      <td style="padding:10px 12px;font-size:13px;text-align:right;color:#374151;border-bottom:1px solid #f3f4f6">${fmt(parseFloat(it.price)||0,moeda)}</td>
      <td style="padding:10px 12px;font-size:13px;text-align:right;font-weight:600;color:#111827;border-bottom:1px solid #f3f4f6">${fmt(it.total||0,moeda)}</td>
    </tr>`).join('');

  canvas.innerHTML = `
  <div id="ev-nota" style="background:${evBg};border-radius:14px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,.2);font-family:${th.font||'Outfit'},sans-serif;position:relative">
    <!-- barra de destaque no topo -->
    <div id="ev-accent-bar" style="height:4px;background:linear-gradient(90deg,${th.sidebar},${th.accent},${th.accentL||th.accent},${th.accent},${th.sidebar})"></div>
    <div style="display:flex;min-height:560px">

      <!-- SIDEBAR -->
      <div id="ev-sidebar" style="width:200px;flex-shrink:0;background:${th.sidebar};padding:1.75rem 1.5rem;display:flex;flex-direction:column;-webkit-print-color-adjust:exact;print-color-adjust:exact">
        <!-- Logo -->
        <div id="ev-logo-area" class="ev-clickable" onclick="evSelectSection('logo')" style="margin-bottom:1.5rem;cursor:pointer;border-radius:6px;padding:4px;transition:outline .15s">
          ${nfLogo
            ?`<img src="${esc(nfLogo)}" style="max-height:52px;max-width:160px;object-fit:contain;display:block"/>`
            :`<div id="ev-empresa-nome" style="font-family:'Playfair Display',serif;font-size:${m._nomeSize||16}px;color:${th.accentL||th.accent};line-height:1.3;font-weight:700">${esc(m.nome||'Nome da Empresa')}</div>`}
        </div>

        <div style="font-size:9px;font-weight:700;color:#4b5563;text-transform:uppercase;letter-spacing:.18em;margin-bottom:1.5rem;padding-bottom:1rem;border-bottom:.5px solid rgba(255,255,255,.07)">${tipoInfo(m.tipo||'nfse').l}</div>

        ${m.numero?`<div class="ev-clickable" onclick="evSelectSection('numero')" style="margin-bottom:.9rem;cursor:pointer;border-radius:4px;padding:2px 4px"><div style="font-size:9px;font-weight:700;color:#4b5563;text-transform:uppercase;letter-spacing:.12em;margin-bottom:3px">Número</div><div style="font-size:${m._numSize||14}px;color:${th.accent};font-weight:700">#${esc(m.numero)}</div></div>`:''}

        <div class="ev-clickable" onclick="evSelectSection('datas')" style="cursor:pointer;border-radius:4px;padding:2px 4px">
          <div style="margin-bottom:.9rem"><div style="font-size:9px;font-weight:700;color:#4b5563;text-transform:uppercase;letter-spacing:.12em;margin-bottom:3px">Emissão</div><div style="font-size:12px;color:#c9d0e0">${fd(m.data)}</div></div>
          ${m.venc?`<div style="margin-bottom:.9rem"><div style="font-size:9px;font-weight:700;color:#4b5563;text-transform:uppercase;letter-spacing:.12em;margin-bottom:3px">Vencimento</div><div style="font-size:12px;color:#c9d0e0">${fd(m.venc)}</div></div>`:''}
        </div>

        <div style="height:.5px;background:rgba(255,255,255,.07);margin:.9rem 0"></div>

        <div class="ev-clickable" onclick="evSelectSection('total-sidebar')" style="cursor:pointer;border-radius:4px;padding:2px 4px;margin-bottom:.9rem">
          <div style="font-size:9px;font-weight:700;color:#4b5563;text-transform:uppercase;letter-spacing:.12em;margin-bottom:3px">Total</div>
          <div style="font-size:${m._totalSize||15}px;color:${th.accent};font-weight:700">${fmt(total,moeda)}</div>
        </div>

        <div style="height:.5px;background:rgba(255,255,255,.07);margin:.9rem 0"></div>

        <div class="ev-clickable" onclick="evSelectSection('contato')" style="cursor:pointer;border-radius:4px;padding:2px 4px">
          ${m.cnpj?`<div style="margin-bottom:.7rem"><div style="font-size:9px;font-weight:700;color:#4b5563;text-transform:uppercase;letter-spacing:.12em;margin-bottom:2px">CNPJ/CPF</div><div style="font-size:${m._contatoSize||11}px;color:#c9d0e0">${esc(m.cnpj)}</div></div>`:''}
          ${m.email?`<div style="margin-bottom:.7rem"><div style="font-size:9px;font-weight:700;color:#4b5563;text-transform:uppercase;letter-spacing:.12em;margin-bottom:2px">E-mail</div><div style="font-size:${m._contatoSize||11}px;color:#c9d0e0">${esc(m.email)}</div></div>`:''}
          ${m.tel?`<div style="margin-bottom:.7rem"><div style="font-size:9px;font-weight:700;color:#4b5563;text-transform:uppercase;letter-spacing:.12em;margin-bottom:2px">Telefone</div><div style="font-size:${m._contatoSize||11}px;color:#c9d0e0">${esc(m.tel)}</div></div>`:''}
        </div>
      </div>

      <!-- MAIN -->
      <div id="ev-main" style="flex:1;padding:2rem 1.75rem;background:${evBg}">

        <!-- Emitente -->
        <div id="ev-emitente" class="ev-clickable" onclick="evSelectSection('emitente')" style="padding-bottom:1.5rem;border-bottom:1.5px solid ${evBgBorder};margin-bottom:1.5rem;cursor:pointer;border-radius:4px;padding:8px">
          <div style="font-size:${m._nomeMainSize||22}px;font-weight:700;color:${evBg==='#1e293b'?'#f1f5f9':'#111827'};letter-spacing:-.3px;margin-bottom:2px">${esc(m.nome||'Nome da Empresa')}</div>
          ${m.end?`<div style="font-size:12px;color:#6b7280">${esc(m.end)}</div>`:''}
          <div style="font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:.1em;font-weight:700;margin-top:5px">${tipoInfo(m.tipo||'nfse').full}</div>
        </div>

        <!-- Cliente -->
        ${(m.cnom||m.ccnpj)?`
        <div id="ev-cliente" class="ev-clickable" onclick="evSelectSection('cliente')" style="margin-bottom:1.5rem;cursor:pointer;border-radius:4px;padding:8px">
          <div style="font-size:9px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.14em;margin-bottom:5px">Faturado para</div>
          <div style="font-size:${m._clienteSize||14}px;font-weight:600;color:#111827;margin-bottom:2px">${esc(m.cnom||'')}</div>
          ${m.ccnpj?`<div style="font-size:12px;color:#6b7280">CNPJ/CPF: ${esc(m.ccnpj)}</div>`:''}
          ${m.cend?`<div style="font-size:12px;color:#6b7280">${esc(m.cend)}</div>`:''}
          ${m.cemail?`<div style="font-size:12px;color:#6b7280">${esc(m.cemail)}</div>`:''}
        </div>`:
        `<div class="ev-clickable" onclick="evSelectSection('cliente')" style="margin-bottom:1.5rem;cursor:pointer;border:1.5px dashed rgba(0,0,0,.1);border-radius:8px;padding:12px;text-align:center;color:#9ca3af;font-size:13px">+ Clique para adicionar dados do cliente</div>`}

        <!-- Itens -->
        <div id="ev-itens" class="ev-clickable" onclick="evSelectSection('itens')" style="cursor:pointer;border-radius:4px;padding:4px;margin-bottom:1.25rem">
          <table style="width:100%;border-collapse:collapse">
            <thead style="background:#f9fafb">
              <tr>
                <th style="font-size:${m._headerSize||10}px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.1em;padding:9px 12px;text-align:left;border-bottom:1.5px solid #e5e7eb">Descrição</th>
                <th style="font-size:${m._headerSize||10}px;font-weight:700;color:#6b7280;text-transform:uppercase;padding:9px 12px;text-align:center;border-bottom:1.5px solid #e5e7eb;width:55px">Qtd</th>
                <th style="font-size:${m._headerSize||10}px;font-weight:700;color:#6b7280;text-transform:uppercase;padding:9px 12px;text-align:center;border-bottom:1.5px solid #e5e7eb;width:55px">Un.</th>
                <th style="font-size:${m._headerSize||10}px;font-weight:700;color:#6b7280;text-transform:uppercase;padding:9px 12px;text-align:right;border-bottom:1.5px solid #e5e7eb;width:100px">Unit.</th>
                <th style="font-size:${m._headerSize||10}px;font-weight:700;color:#6b7280;text-transform:uppercase;padding:9px 12px;text-align:right;border-bottom:1.5px solid #e5e7eb;width:100px">Total</th>
              </tr>
            </thead>
            <tbody>${iRows}</tbody>
          </table>
        </div>

        <!-- Totais -->
        <div id="ev-totais" class="ev-clickable" onclick="evSelectSection('totais')" style="display:flex;justify-content:flex-end;margin-bottom:1.25rem;cursor:pointer;border-radius:4px;padding:4px">
          <div style="min-width:220px;background:#f9fafb;border-radius:8px;padding:1rem 1.25rem">
            <div style="display:flex;justify-content:space-between;font-size:${m._totaisSize||13}px;color:#6b7280;padding:3px 0"><span>Subtotal</span><span style="font-weight:500;color:#374151">${fmt(sub,moeda)}</span></div>
            ${desc>0?`<div style="display:flex;justify-content:space-between;font-size:${m._totaisSize||13}px;color:#6b7280;padding:3px 0"><span>Desconto</span><span style="font-weight:500">− ${fmt(desc,moeda)}</span></div>`:''}
            ${tax>0?`<div style="display:flex;justify-content:space-between;font-size:${m._totaisSize||13}px;color:#6b7280;padding:3px 0"><span>Impostos/Taxas</span><span style="font-weight:500">${fmt(tax,moeda)}</span></div>`:''}
            <div style="display:flex;justify-content:space-between;font-size:${m._totalFinalSize||16}px;font-weight:700;color:#111827;border-top:1.5px solid #e5e7eb;padding-top:10px;margin-top:6px"><span>Total</span><span>${fmt(total,moeda)}</span></div>
          </div>
        </div>

        <!-- Obs -->
        ${m.obs?`
        <div id="ev-obs" class="ev-clickable" onclick="evSelectSection('obs')" style="background:#f9fafb;border-radius:8px;padding:1rem 1.25rem;margin-bottom:1rem;cursor:pointer">
          <div style="font-size:9px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.14em;margin-bottom:5px">Observações</div>
          <div style="font-size:${m._obsSize||12}px;color:#6b7280;line-height:1.75">${esc(m.obs)}</div>
        </div>`:
        `<div class="ev-clickable" onclick="evSelectSection('obs')" style="cursor:pointer;border:1.5px dashed rgba(0,0,0,.1);border-radius:8px;padding:10px;text-align:center;color:#9ca3af;font-size:12px;margin-bottom:1rem">+ Clique para adicionar observações</div>`}

        <!-- Fotos -->
        ${nfImages.length>0?`
        <div id="ev-fotos" class="ev-clickable" onclick="evSelectSection('fotos')" style="cursor:pointer;border-radius:4px;padding:4px">
          <div style="font-size:9px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.14em;margin-bottom:8px">Fotos do serviço</div>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(${m._fotoSize||120}px,1fr));gap:8px">
            ${nfImages.map((u,i)=>`<div style="position:relative;border-radius:6px;overflow:hidden;aspect-ratio:4/3">
              <img src="${esc(u)}" style="width:100%;height:100%;object-fit:cover"/>
              <button onclick="event.stopPropagation();evRemoverFoto(${i})" style="position:absolute;top:4px;right:4px;background:rgba(0,0,0,.7);border:none;border-radius:50%;width:20px;height:20px;cursor:pointer;color:#fff;font-size:11px">×</button>
            </div>`).join('')}
          </div>
        </div>`:''}

        <!-- Elementos extras do usuário -->
        ${evElements.filter(e=>e.area==='main').map(e=>evRenderElement(e)).join('')}
      </div>
    </div>

    <!-- Elementos extras globais -->
    ${evElements.filter(e=>e.area==='global').map(e=>evRenderElement(e)).join('')}
  </div>`;

  // Adiciona hover visual nos clicáveis
  document.querySelectorAll('.ev-clickable').forEach(el=>{
    el.addEventListener('mouseenter', ()=>{ if(!el.querySelector('table')) el.style.outline='2px dashed rgba(201,168,76,.5)'; el.style.outlineOffset='2px'; });
    el.addEventListener('mouseleave', ()=>{ el.style.outline=''; el.style.outlineOffset=''; });
  });

  evInitDragElements();
}

function evRenderElement(e) {
  const sel = evSelected===e.id ? 'ev-selected-ring' : '';
  if(e.type==='texto') {
    return `<div id="ev-el-${e.id}" class="ev-element ${sel}" style="position:absolute;left:${e.x}px;top:${e.y}px;width:${e.w||200}px;z-index:50"
      onclick="evSelectEl('${e.id}')" onmousedown="evStartDrag(event,'${e.id}')">
      <div class="ev-toolbar">
        <button onclick="event.stopPropagation();evEditEl('${e.id}')">✏️</button>
        <button onclick="event.stopPropagation();evDeleteEl('${e.id}')">🗑</button>
        <button onclick="event.stopPropagation();evBoldEl('${e.id}')">B</button>
        <input type="color" value="${e.color||'#111827'}" onchange="evColorEl('${e.id}',this.value)" onclick="event.stopPropagation()" style="width:24px;height:20px;border:none;cursor:pointer;border-radius:3px"/>
        <select onchange="evFontSizeEl('${e.id}',this.value)" onclick="event.stopPropagation()" style="background:#1e293b;color:#e2e8f0;border:none;border-radius:3px;font-size:11px;cursor:pointer">
          ${[8,10,11,12,13,14,16,18,20,24,28,32,36,40,48,56,64].map(s=>`<option value="${s}" ${(e.size||14)===s?'selected':''}>${s}px</option>`).join('')}
        </select>
      </div>
      <div contenteditable="true" style="font-size:${e.size||14}px;color:${e.color||'#111827'};font-weight:${e.bold?'700':'400'};font-family:'${activeTheme.font||'Outfit'}',sans-serif;min-width:60px;outline:none;padding:2px" onblur="evSaveText('${e.id}',this.innerText)">${esc(e.text||'Texto livre')}</div>
      <div class="ev-resize-handle" onmousedown="event.stopPropagation();evStartResize(event,'${e.id}')"></div>
    </div>`;
  }
  if(e.type==='imagem') {
    return `<div id="ev-el-${e.id}" class="ev-element ${sel}" style="position:absolute;left:${e.x}px;top:${e.y}px;width:${e.w||150}px;z-index:50"
      onclick="evSelectEl('${e.id}')" onmousedown="evStartDrag(event,'${e.id}')">
      <div class="ev-toolbar">
        <button onclick="event.stopPropagation();evTrocarImg('${e.id}')">🔄 Trocar</button>
        <button onclick="event.stopPropagation();evDeleteEl('${e.id}')">🗑</button>
      </div>
      <img src="${esc(e.src||'')}" style="width:100%;border-radius:${e.radius||0}px;display:block"/>
      <div class="ev-resize-handle" onmousedown="event.stopPropagation();evStartResize(event,'${e.id}')"></div>
    </div>`;
  }
  if(e.type==='linha') {
    return `<div id="ev-el-${e.id}" class="ev-element ${sel}" style="position:absolute;left:${e.x}px;top:${e.y}px;width:${e.w||300}px;z-index:50;padding:8px 0"
      onclick="evSelectEl('${e.id}')" onmousedown="evStartDrag(event,'${e.id}')">
      <div class="ev-toolbar">
        <input type="color" value="${e.color||'#e5e7eb'}" onchange="evColorEl('${e.id}',this.value)" onclick="event.stopPropagation()" style="width:24px;height:20px;border:none;cursor:pointer;border-radius:3px"/>
        <select onchange="evLineHeight('${e.id}',this.value)" onclick="event.stopPropagation()" style="background:#1e293b;color:#e2e8f0;border:none;border-radius:3px;font-size:11px;cursor:pointer">
          <option value="1">1px</option><option value="2" ${(e.lh||1)===2?'selected':''}>2px</option><option value="3" ${(e.lh||1)===3?'selected':''}>3px</option>
        </select>
        <button onclick="event.stopPropagation();evDeleteEl('${e.id}')">🗑</button>
      </div>
      <hr style="border:none;border-top:${e.lh||1}px solid ${e.color||'#e5e7eb'};margin:0"/>
      <div class="ev-resize-handle" onmousedown="event.stopPropagation();evStartResize(event,'${e.id}')"></div>
    </div>`;
  }
  if(e.type==='retangulo') {
    return `<div id="ev-el-${e.id}" class="ev-element ${sel}" style="position:absolute;left:${e.x}px;top:${e.y}px;width:${e.w||120}px;height:${e.h||60}px;z-index:50"
      onclick="evSelectEl('${e.id}')" onmousedown="evStartDrag(event,'${e.id}')">
      <div class="ev-toolbar">
        <input type="color" value="${e.fill||'#f3f4f6'}" onchange="evFillEl('${e.id}',this.value)" onclick="event.stopPropagation()" title="Cor de fundo" style="width:24px;height:20px;border:none;cursor:pointer;border-radius:3px"/>
        <input type="color" value="${e.stroke||'#e5e7eb'}" onchange="evStrokeEl('${e.id}',this.value)" onclick="event.stopPropagation()" title="Cor da borda" style="width:24px;height:20px;border:none;cursor:pointer;border-radius:3px"/>
        <button onclick="event.stopPropagation();evDeleteEl('${e.id}')">🗑</button>
      </div>
      <div style="width:100%;height:100%;background:${e.fill||'#f3f4f6'};border:${e.sw||1}px solid ${e.stroke||'#e5e7eb'};border-radius:${e.radius||6}px"></div>
      <div class="ev-resize-handle" onmousedown="event.stopPropagation();evStartResize(event,'${e.id}')"></div>
    </div>`;
  }
  return '';
}

/* ── Painel de propriedades por seção ── */
function evSelectSection(section) {
  // Remove seleção anterior
  document.querySelectorAll('.ev-selected-ring').forEach(el=>el.classList.remove('ev-selected-ring'));
  const el = document.getElementById('ev-'+section) || document.getElementById('ev-'+section+'-area');
  if(el) el.classList.add('ev-selected-ring');

  const props = document.getElementById('ev-props-content');
  if(!props) return;
  const m = nfModel||{};
  const th = activeTheme;

  const panels = {
    logo: `
      <div style="font-size:13px;font-weight:600;margin-bottom:1rem">Logo & Nome</div>
      <div class="field"><label>Upload de logo</label>
        <div class="upload-area" onclick="document.getElementById('ev-logo-up').click()" style="padding:10px">
          <input type="file" id="ev-logo-up" accept="image/*" onchange="evUpLogo(this)"/>
          <p style="font-size:12px;color:var(--text2)">Clique para trocar</p>
        </div>
        ${nfLogo?`<button class="btn btn-danger btn-sm" style="width:100%;justify-content:center;margin-top:6px" onclick="nfLogo=null;evRenderCanvas()">Remover logo</button>`:''}
      </div>
      <div class="field"><label>Tamanho do nome (sidebar)</label>
        <input type="range" min="10" max="28" value="${m._nomeSize||16}" oninput="nfModel._nomeSize=parseInt(this.value);evRenderCanvas();document.getElementById('ev-nome-size-v').textContent=this.value+'px'" style="width:100%"/>
        <span id="ev-nome-size-v" style="font-size:11px;color:var(--text3)">${m._nomeSize||16}px</span>
      </div>`,

    emitente: `
      <div style="font-size:13px;font-weight:600;margin-bottom:1rem">Emitente</div>
      <div class="field"><label>Nome / Razão Social</label>
        <input value="${esc(m.nome||'')}" oninput="nfModel.nome=this.value;evRenderCanvas()"/></div>
      <div class="field"><label>Endereço</label>
        <input value="${esc(m.end||'')}" oninput="nfModel.end=this.value;evRenderCanvas()"/></div>
      <div class="field"><label>Tamanho do nome (área principal)</label>
        <input type="range" min="14" max="36" value="${m._nomeMainSize||22}" oninput="nfModel._nomeMainSize=parseInt(this.value);evRenderCanvas();document.getElementById('ev-nm-v').textContent=this.value+'px'" style="width:100%"/>
        <span id="ev-nm-v" style="font-size:11px;color:var(--text3)">${m._nomeMainSize||22}px</span>
      </div>`,

    cliente: `
      <div style="font-size:13px;font-weight:600;margin-bottom:1rem">Dados do cliente</div>
      <div class="field"><label>Nome / Razão Social</label>
        <input value="${esc(m.cnom||'')}" oninput="nfModel.cnom=this.value;evRenderCanvas()"/></div>
      <div class="field"><label>CNPJ / CPF</label>
        <input value="${esc(m.ccnpj||'')}" oninput="nfModel.ccnpj=this.value;evRenderCanvas()"/></div>
      <div class="field"><label>Endereço</label>
        <input value="${esc(m.cend||'')}" oninput="nfModel.cend=this.value;evRenderCanvas()"/></div>
      <div class="field"><label>E-mail</label>
        <input value="${esc(m.cemail||'')}" oninput="nfModel.cemail=this.value;evRenderCanvas()"/></div>
      <div class="field"><label>Tamanho do nome do cliente</label>
        <input type="range" min="11" max="24" value="${m._clienteSize||14}" oninput="nfModel._clienteSize=parseInt(this.value);evRenderCanvas()" style="width:100%"/>
      </div>`,

    numero: `
      <div style="font-size:13px;font-weight:600;margin-bottom:1rem">Número da nota</div>
      <div class="field"><label>Número</label>
        <input value="${esc(m.numero||'')}" oninput="nfModel.numero=this.value;evRenderCanvas()"/></div>
      <div class="field"><label>Tamanho do número</label>
        <input type="range" min="11" max="28" value="${m._numSize||14}" oninput="nfModel._numSize=parseInt(this.value);evRenderCanvas()" style="width:100%"/>
      </div>`,

    datas: `
      <div style="font-size:13px;font-weight:600;margin-bottom:1rem">Datas</div>
      <div class="field"><label>Data de emissão</label>
        <input type="date" value="${esc(m.data||nowDate())}" oninput="nfModel.data=this.value;evRenderCanvas()"/></div>
      <div class="field"><label>Vencimento</label>
        <input type="date" value="${esc(m.venc||'')}" oninput="nfModel.venc=this.value;evRenderCanvas()"/></div>`,

    'total-sidebar': `
      <div style="font-size:13px;font-weight:600;margin-bottom:1rem">Total (barra lateral)</div>
      <div class="field"><label>Tamanho do valor total</label>
        <input type="range" min="12" max="28" value="${m._totalSize||15}" oninput="nfModel._totalSize=parseInt(this.value);evRenderCanvas()" style="width:100%"/>
      </div>`,

    contato: `
      <div style="font-size:13px;font-weight:600;margin-bottom:1rem">Contato</div>
      <div class="field"><label>CNPJ / CPF</label>
        <input value="${esc(m.cnpj||'')}" oninput="nfModel.cnpj=this.value;evRenderCanvas()"/></div>
      <div class="field"><label>E-mail</label>
        <input value="${esc(m.email||'')}" oninput="nfModel.email=this.value;evRenderCanvas()"/></div>
      <div class="field"><label>Telefone</label>
        <input value="${esc(m.tel||'')}" oninput="nfModel.tel=this.value;evRenderCanvas()"/></div>
      <div class="field"><label>Tamanho dos textos de contato</label>
        <input type="range" min="9" max="16" value="${m._contatoSize||11}" oninput="nfModel._contatoSize=parseInt(this.value);evRenderCanvas()" style="width:100%"/>
      </div>`,

    itens: `
      <div style="font-size:13px;font-weight:600;margin-bottom:1rem">Itens / serviços</div>
      <div class="field"><label>Tamanho do cabeçalho</label>
        <input type="range" min="8" max="16" value="${m._headerSize||10}" step="1" oninput="nfModel._headerSize=parseInt(this.value);evRenderCanvas()" style="width:100%"/>
      </div>
      <div class="sec-lbl" style="margin:.75rem 0 .5rem">Editar itens inline</div>
      ${nfItems.map((it,i)=>`
        <div style="background:var(--bg3);border-radius:var(--rs);padding:10px;margin-bottom:6px">
          <div class="field" style="margin-bottom:6px"><label>Descrição</label>
            <input value="${esc(it.desc||'')}" style="font-size:12px" oninput="nfItems[${i}].desc=this.value;evRenderCanvas()"/></div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px">
            <div class="field" style="margin:0"><label>Qtd</label>
              <input type="number" value="${it.qty||1}" min="0.01" step="any" style="font-size:12px" oninput="nfItems[${i}].qty=parseFloat(this.value)||1;nfItems[${i}].total=+(nfItems[${i}].qty*(parseFloat(nfItems[${i}].price)||0)).toFixed(2);evRenderCanvas()"/></div>
            <div class="field" style="margin:0"><label>Unid.</label>
              <input value="${esc(it.unit||'un')}" style="font-size:12px" oninput="nfItems[${i}].unit=this.value;evRenderCanvas()"/></div>
            <div class="field" style="margin:0"><label>Valor unit.</label>
              <input type="number" value="${it.price||0}" min="0" step="0.01" style="font-size:12px" oninput="nfItems[${i}].price=parseFloat(this.value)||0;nfItems[${i}].total=+(nfItems[${i}].qty*(parseFloat(nfItems[${i}].price)||0)).toFixed(2);evRenderCanvas()"/></div>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px">
            <span style="font-size:12px;color:var(--gold);font-weight:600">Total: ${fmt(it.total||0,nfModel.moeda||'BRL')}</span>
            ${nfItems.length>1?`<button class="btn btn-danger btn-sm" style="padding:3px 8px;font-size:11px" onclick="nfItems.splice(${i},1);evRenderCanvas()">Remover</button>`:''}
          </div>
        </div>`).join('')}
      <button class="btn btn-ghost btn-sm" style="width:100%;justify-content:center;margin-top:6px" onclick="nfItems.push({desc:'',qty:1,unit:'un',price:0,total:0});evRenderCanvas()">+ Adicionar item</button>
      <div class="field" style="margin-top:.75rem"><label>Desconto (${nfModel.moeda||'BRL'})</label>
        <input type="number" value="${m.desconto||0}" min="0" step="0.01" oninput="nfModel.desconto=this.value;evRenderCanvas()"/></div>
      <div class="field"><label>Impostos / Taxas (${nfModel.moeda||'BRL'})</label>
        <input type="number" value="${m.impostos||0}" min="0" step="0.01" oninput="nfModel.impostos=this.value;evRenderCanvas()"/></div>`,

    totais: `
      <div style="font-size:13px;font-weight:600;margin-bottom:1rem">Totais</div>
      <div class="field"><label>Tamanho das linhas de totais</label>
        <input type="range" min="11" max="18" value="${m._totaisSize||13}" oninput="nfModel._totaisSize=parseInt(this.value);evRenderCanvas()" style="width:100%"/>
      </div>
      <div class="field"><label>Tamanho do total final</label>
        <input type="range" min="13" max="24" value="${m._totalFinalSize||16}" oninput="nfModel._totalFinalSize=parseInt(this.value);evRenderCanvas()" style="width:100%"/>
      </div>
      <div class="field"><label>Desconto</label>
        <input type="number" value="${m.desconto||0}" oninput="nfModel.desconto=this.value;evRenderCanvas()"/></div>
      <div class="field"><label>Impostos / Taxas</label>
        <input type="number" value="${m.impostos||0}" oninput="nfModel.impostos=this.value;evRenderCanvas()"/></div>`,

    obs: `
      <div style="font-size:13px;font-weight:600;margin-bottom:1rem">Observações</div>
      <div class="field"><label>Texto</label>
        <textarea oninput="nfModel.obs=this.value;evRenderCanvas()">${esc(m.obs||'')}</textarea></div>
      <div class="field"><label>Tamanho do texto</label>
        <input type="range" min="10" max="18" value="${m._obsSize||12}" oninput="nfModel._obsSize=parseInt(this.value);evRenderCanvas()" style="width:100%"/>
      </div>`,

    fotos: `
      <div style="font-size:13px;font-weight:600;margin-bottom:1rem">Fotos do serviço</div>
      <div class="field"><label>Adicionar fotos</label>
        <div class="upload-area" onclick="document.getElementById('ev-foto-up').click()" style="padding:10px">
          <input type="file" id="ev-foto-up" accept="image/*" multiple onchange="evUpFotos(this)"/>
          <p style="font-size:12px;color:var(--text2)">Clique para adicionar</p>
        </div>
      </div>
      <div class="field"><label>Tamanho das fotos</label>
        <input type="range" min="80" max="240" value="${m._fotoSize||120}" oninput="nfModel._fotoSize=parseInt(this.value);evRenderCanvas()" style="width:100%"/>
      </div>`,
  };

  props.innerHTML = panels[section] || `<p style="font-size:12px;color:var(--text3)">Clique em um elemento na nota para editar.</p>`;
}

/* ── Funções dos elementos livres ── */
window.evAddTexto=()=>{
  const id=newId();
  evElements.push({id,type:'texto',text:'Texto livre',x:220,y:80,w:200,size:14,color:'#111827',bold:false,area:'main'});
  evRenderCanvas();
  evSelectEl(id);
};
window.evAddImagem=()=>{
  const inp=document.createElement('input');
  inp.type='file'; inp.accept='image/*';
  inp.onchange=e=>{
    const f=e.target.files[0]; if(!f)return;
    const r=new FileReader();
    r.onload=ev=>{
      const id=newId();
      evElements.push({id,type:'imagem',src:ev.target.result,x:220,y:80,w:150,area:'main'});
      evRenderCanvas(); evSelectEl(id);
    };
    r.readAsDataURL(f);
  };
  inp.click();
};
window.evAddLinha=()=>{
  const id=newId();
  evElements.push({id,type:'linha',x:220,y:200,w:300,color:'#e5e7eb',lh:1,area:'main'});
  evRenderCanvas(); evSelectEl(id);
};
window.evAddRetangulo=()=>{
  const id=newId();
  evElements.push({id,type:'retangulo',x:220,y:80,w:160,h:80,fill:'#f3f4f6',stroke:'#e5e7eb',sw:1,radius:6,area:'main'});
  evRenderCanvas(); evSelectEl(id);
};

window.evSelectEl=(id)=>{ evSelected=id; evRenderCanvas(); };
window.evDeleteEl=(id)=>{ evElements=evElements.filter(e=>e.id!==id); evSelected=null; evRenderCanvas(); };
window.evEditEl=(id)=>{
  const el=evElements.find(e=>e.id===id); if(!el)return;
  const novo=prompt('Editar texto:',el.text||'');
  if(novo!==null){el.text=novo; evRenderCanvas();}
};
window.evBoldEl=(id)=>{ const el=evElements.find(e=>e.id===id); if(el){el.bold=!el.bold;evRenderCanvas();} };
window.evColorEl=(id,v)=>{ const el=evElements.find(e=>e.id===id); if(el){el.color=v;evRenderCanvas();} };
window.evFillEl=(id,v)=>{ const el=evElements.find(e=>e.id===id); if(el){el.fill=v;evRenderCanvas();} };
window.evStrokeEl=(id,v)=>{ const el=evElements.find(e=>e.id===id); if(el){el.stroke=v;evRenderCanvas();} };
window.evFontSizeEl=(id,v)=>{ const el=evElements.find(e=>e.id===id); if(el){el.size=parseInt(v);evRenderCanvas();} };
window.evLineHeight=(id,v)=>{ const el=evElements.find(e=>e.id===id); if(el){el.lh=parseInt(v);evRenderCanvas();} };
window.evSaveText=(id,t)=>{ const el=evElements.find(e=>e.id===id); if(el)el.text=t; };
window.evTrocarImg=(id)=>{
  const inp=document.createElement('input'); inp.type='file'; inp.accept='image/*';
  inp.onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{const el=evElements.find(x=>x.id===id);if(el){el.src=ev.target.result;evRenderCanvas();}};r.readAsDataURL(f);};
  inp.click();
};
window.evRemoverFoto=(i)=>{ nfImages.splice(i,1); evRenderCanvas(); };
window.evUpLogo=(inp)=>{ const f=inp.files[0];if(!f)return;const r=new FileReader();r.onload=e=>{nfLogo=e.target.result;evRenderCanvas();};r.readAsDataURL(f); };
window.evUpFotos=(inp)=>{ Array.from(inp.files).forEach(f=>{const r=new FileReader();r.onload=e=>{nfImages.push(e.target.result);evRenderCanvas();};r.readAsDataURL(f);}); };

window.evSetBg=(bg,border)=>{ evBg=bg; evBgBorder=border; evRenderCanvas(); };
window.evSetSidebar=(c)=>{ activeTheme.sidebar=c; evRenderCanvas(); };
window.evSetAccent=(c)=>{ activeTheme.accent=c; activeTheme.accentL=c; evRenderCanvas(); };

/* ── Drag & drop dos elementos livres ── */
function evInitDragElements(){
  // já gerenciado pelos eventos inline onmousedown
}

window.evStartDrag=(e,id)=>{
  if(e.target.tagName==='INPUT'||e.target.tagName==='SELECT'||e.target.tagName==='BUTTON') return;
  evDragging=id;
  const el=evElements.find(x=>x.id===id); if(!el)return;
  const canvas=document.getElementById('ev-canvas');
  const rect=canvas.getBoundingClientRect();
  evDragOffset={x:e.clientX-rect.left-el.x, y:e.clientY-rect.top-el.y};
  e.preventDefault();
};

window.evStartResize=(e,id)=>{
  evResizing=id;
  const el=evElements.find(x=>x.id===id); if(!el)return;
  const domEl=document.getElementById('ev-el-'+id);
  if(!domEl)return;
  const startX=e.clientX, startW=el.w||100, startH=el.h||60;
  const onMove=ev=>{
    el.w=Math.max(40,startW+(ev.clientX-startX));
    if(el.type==='retangulo') el.h=Math.max(20,startH+(ev.clientY-e.clientY));
    const d=document.getElementById('ev-el-'+id);
    if(d){d.style.width=el.w+'px'; if(el.h)d.style.height=el.h+'px';}
  };
  const onUp=()=>{ evResizing=null; document.removeEventListener('mousemove',onMove); document.removeEventListener('mouseup',onUp); evRenderCanvas(); };
  document.addEventListener('mousemove',onMove);
  document.addEventListener('mouseup',onUp);
  e.preventDefault();
};

document.addEventListener('mousemove',e=>{
  if(!evDragging)return;
  const el=evElements.find(x=>x.id===evDragging); if(!el)return;
  const canvas=document.getElementById('ev-canvas'); if(!canvas)return;
  const nota=document.getElementById('ev-nota'); if(!nota)return;
  const rect=nota.getBoundingClientRect();
  el.x=Math.max(0,e.clientX-rect.left-evDragOffset.x);
  el.y=Math.max(0,e.clientY-rect.top-evDragOffset.y);
  const domEl=document.getElementById('ev-el-'+evDragging);
  if(domEl){domEl.style.left=el.x+'px';domEl.style.top=el.y+'px';}
});

document.addEventListener('mouseup',()=>{ evDragging=null; });

/* ── Salvar e PDF do editor ── */
window.salvarDoEditor=()=>{
  nfModel._evElements=evElements;
  nfModel._evBg=evBg;
  salvar(false);
};

window.pdfDoEditor=()=>{
  nfModel._evElements=evElements;
  nfModel._evBg=evBg;
  salvar(false);
  setTimeout(()=>abrirPDF(),300);
};
