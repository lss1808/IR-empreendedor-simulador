/* ══════════════════════════════════════════
   MÓDULO: CLIENTES, MODELOS, RECORRENTES,
   RELATÓRIO, ALERTAS
══════════════════════════════════════════ */

/* ── STORAGE KEYS ── */
const SK2 = {
  CLIENTES:    'ire_clientes_v1',
  MODELOS:     'ire_modelos_v1',
  RECORRENTES: 'ire_recorr_v1',
};
const loadClientes   = () => dbGet(SK2.CLIENTES, []);
const saveClientes   = arr => dbSet(SK2.CLIENTES, arr);
const loadModelos    = () => dbGet(SK2.MODELOS, []);
const saveModelos    = arr => dbSet(SK2.MODELOS, arr);
const loadRecorr     = () => dbGet(SK2.RECORRENTES, []);
const saveRecorr     = arr => dbSet(SK2.RECORRENTES, arr);

/* ══════════════════════════════════════════
   1. AGENDA DE CLIENTES
══════════════════════════════════════════ */
function rClientes(el, acts) {
  acts.innerHTML = `<button class="btn btn-gold btn-sm" onclick="abrirNovoCliente()">+ Novo cliente</button>`;
  const clientes = loadClientes();
  const notas    = loadNotas();

  // Calcula totais por cliente
  const totaisPorCliente = {};
  notas.forEach(n => {
    const nome = (n.cnom||'').trim().toLowerCase();
    if (!nome) return;
    if (!totaisPorCliente[nome]) totaisPorCliente[nome] = { total: 0, count: 0 };
    totaisPorCliente[nome].total += n.total || 0;
    totaisPorCliente[nome].count++;
  });

  el.innerHTML = `
  <div class="card">
    <div class="card-header">
      <span class="card-title">Clientes cadastrados (${clientes.length})</span>
    </div>
    <input id="busca-cli" placeholder="Buscar por nome ou CNPJ…"
      style="width:100%;padding:9px 13px;font-size:14px;background:var(--bg3);border:.5px solid var(--border2);border-radius:var(--rs);color:var(--text);outline:none;margin-bottom:1rem"
      oninput="filtrarClientes(this.value)"/>
    <div id="cli-list">
      ${clientes.length === 0
        ? `<div style="text-align:center;padding:2rem;color:var(--text3);font-size:13px">
            Nenhum cliente cadastrado ainda.<br/>
            <a href="#" onclick="abrirNovoCliente()" style="color:var(--gold)">Cadastrar o primeiro</a>
           </div>`
        : `<table class="data-tbl">
            <thead><tr><th>Cliente</th><th>CNPJ/CPF</th><th>E-mail</th><th>Notas emitidas</th><th>Total faturado</th><th></th></tr></thead>
            <tbody id="cli-tbody">${clientes.map(c => clienteRow(c, totaisPorCliente)).join('')}</tbody>
          </table>`}
    </div>
  </div>`;
}

function clienteRow(c, totais) {
  const key = (c.nome||'').trim().toLowerCase();
  const stat = totais[key] || { total: 0, count: 0 };
  const ini  = (c.nome||'?').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
  return `<tr>
    <td>
      <div style="display:flex;align-items:center;gap:10px">
        <div style="width:32px;height:32px;border-radius:50%;background:var(--gold-dim2);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;color:var(--gold);flex-shrink:0">${ini}</div>
        <div><div style="font-weight:500">${esc(c.nome||'—')}</div><div style="font-size:11px;color:var(--text3)">${esc(c.end||'')}</div></div>
      </div>
    </td>
    <td style="color:var(--text2)">${esc(c.cnpj||'—')}</td>
    <td style="color:var(--text2)">${esc(c.email||'—')}</td>
    <td style="color:var(--text2)">${stat.count} nota${stat.count!==1?'s':''}</td>
    <td style="font-weight:600;color:var(--gold)">${fmt(stat.total)}</td>
    <td>
      <div style="display:flex;gap:4px">
        <button class="btn btn-gold btn-sm" onclick="usarCliente('${c.id}')">Usar</button>
        <button class="btn btn-ghost btn-sm" onclick="editarCliente('${c.id}')">✏️</button>
        <button class="btn btn-danger btn-sm" onclick="excluirCliente('${c.id}')">🗑</button>
      </div>
    </td>
  </tr>`;
}

window.filtrarClientes = q => {
  const tbody = document.getElementById('cli-tbody'); if(!tbody)return;
  const notas = loadNotas();
  const totais = {};
  notas.forEach(n=>{const k=(n.cnom||'').trim().toLowerCase();if(!k)return;if(!totais[k])totais[k]={total:0,count:0};totais[k].total+=n.total||0;totais[k].count++;});
  const cl = loadClientes().filter(c =>
    !q || (c.nome||'').toLowerCase().includes(q.toLowerCase()) || (c.cnpj||'').includes(q)
  );
  tbody.innerHTML = cl.map(c => clienteRow(c, totais)).join('');
};

window.abrirNovoCliente = (id) => {
  const c = id ? (loadClientes().find(x=>x.id===id)||{}) : {};
  openModal(`
    <div class="modal-header">
      <span class="modal-title">${id?'Editar':'Novo'} cliente</span>
      <button class="modal-x" onclick="closeModal()">×</button>
    </div>
    <div class="field"><label>Nome / Razão Social</label><input id="c-nome" value="${esc(c.nome||'')}"/></div>
    <div class="g2">
      <div class="field"><label>CNPJ / CPF</label><input id="c-cnpj" value="${esc(c.cnpj||'')}"/></div>
      <div class="field"><label>Telefone</label><input id="c-tel" value="${esc(c.tel||'')}"/></div>
    </div>
    <div class="field"><label>Endereço</label><input id="c-end" value="${esc(c.end||'')}"/></div>
    <div class="field"><label>E-mail</label><input id="c-email" value="${esc(c.email||'')}"/></div>
    <div class="field"><label>Observações</label><textarea id="c-obs" style="min-height:60px">${esc(c.obs||'')}</textarea></div>
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:1rem">
      <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-gold" onclick="salvarCliente('${id||''}')">Salvar cliente</button>
    </div>`);
  setTimeout(()=>document.getElementById('c-nome')?.focus(),50);
};
window.editarCliente = id => abrirNovoCliente(id);

window.salvarCliente = id => {
  const nome = document.getElementById('c-nome')?.value?.trim();
  if(!nome){toast('Informe o nome do cliente.','warn');return;}
  const arr = loadClientes();
  const dados = {
    id: id || newId(),
    nome, cnpj: document.getElementById('c-cnpj')?.value||'',
    tel: document.getElementById('c-tel')?.value||'',
    end: document.getElementById('c-end')?.value||'',
    email: document.getElementById('c-email')?.value||'',
    obs: document.getElementById('c-obs')?.value||'',
    criadoEm: new Date().toISOString()
  };
  const idx = arr.findIndex(x=>x.id===dados.id);
  if(idx>=0) arr[idx]=dados; else arr.unshift(dados);
  saveClientes(arr);
  closeModal();
  toast('Cliente salvo!','ok');
  go('clientes');
};

window.excluirCliente = id => {
  if(!confirm('Excluir este cliente?'))return;
  saveClientes(loadClientes().filter(c=>c.id!==id));
  toast('Cliente excluído.','ok');
  go('clientes');
};

window.usarCliente = id => {
  const c = loadClientes().find(x=>x.id===id); if(!c)return;
  nfModel.cnom   = c.nome;
  nfModel.ccnpj  = c.cnpj;
  nfModel.cend   = c.end;
  nfModel.cemail = c.email;
  nfModel.ctel   = c.tel;
  toast(`Cliente "${c.nome}" carregado na nota.`,'ok');
  go('nf-form',{edit:!!nfId});
};

// Seletor de cliente dentro do formulário
window.abrirSeletorCliente = () => {
  const clientes = loadClientes();
  if(!clientes.length){
    openModal(`<div class="modal-header"><span class="modal-title">Selecionar cliente</span><button class="modal-x" onclick="closeModal()">×</button></div>
      <p style="font-size:13px;color:var(--text2);margin-bottom:1rem">Nenhum cliente cadastrado.</p>
      <button class="btn btn-gold" style="width:100%;justify-content:center" onclick="closeModal();go('clientes')">Ir para agenda de clientes</button>`);
    return;
  }
  openModal(`
    <div class="modal-header"><span class="modal-title">Selecionar cliente</span><button class="modal-x" onclick="closeModal()">×</button></div>
    <input placeholder="Buscar…" oninput="filtrarModalCli(this.value)" id="modal-cli-busca"
      style="width:100%;padding:9px 13px;font-size:13px;background:var(--bg3);border:.5px solid var(--border2);border-radius:var(--rs);color:var(--text);outline:none;margin-bottom:1rem"/>
    <div id="modal-cli-list" style="max-height:320px;overflow-y:auto">
      ${clientes.map(c=>`
        <div onclick="selecionarClienteModal('${c.id}')" style="display:flex;align-items:center;gap:10px;padding:10px;border-radius:var(--rs);cursor:pointer;transition:background .12s" onmouseover="this.style.background='var(--bg3)'" onmouseout="this.style.background=''">
          <div style="width:32px;height:32px;border-radius:50%;background:var(--gold-dim2);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;color:var(--gold);flex-shrink:0">${(c.nome||'?').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase()}</div>
          <div><div style="font-size:13px;font-weight:500">${esc(c.nome)}</div><div style="font-size:11px;color:var(--text3)">${esc(c.cnpj||'')} ${c.email?'· '+esc(c.email):''}</div></div>
        </div>`).join('')}
    </div>`);
};

window.filtrarModalCli = q => {
  const list = document.getElementById('modal-cli-list'); if(!list)return;
  const cl = loadClientes().filter(c=>!q||(c.nome||'').toLowerCase().includes(q.toLowerCase())||(c.cnpj||'').includes(q));
  list.innerHTML = cl.map(c=>`
    <div onclick="selecionarClienteModal('${c.id}')" style="display:flex;align-items:center;gap:10px;padding:10px;border-radius:var(--rs);cursor:pointer" onmouseover="this.style.background='var(--bg3)'" onmouseout="this.style.background=''">
      <div style="width:32px;height:32px;border-radius:50%;background:var(--gold-dim2);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;color:var(--gold)">${(c.nome||'?').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase()}</div>
      <div><div style="font-size:13px;font-weight:500">${esc(c.nome)}</div><div style="font-size:11px;color:var(--text3)">${esc(c.cnpj||'')}</div></div>
    </div>`).join('');
};

window.selecionarClienteModal = id => {
  usarCliente(id);
  closeModal();
};

/* ══════════════════════════════════════════
   2. MODELOS DE NOTA
══════════════════════════════════════════ */
function rModelos(el, acts) {
  acts.innerHTML = `<button class="btn btn-gold btn-sm" onclick="salvarModeloAtual()">💾 Salvar nota atual como modelo</button>`;
  const modelos = loadModelos();

  el.innerHTML = `
  <div class="card">
    <div class="card-header"><span class="card-title">Modelos salvos (${modelos.length})</span></div>
    ${modelos.length === 0
      ? `<div style="text-align:center;padding:2rem;color:var(--text3);font-size:13px">
          Nenhum modelo salvo ainda.<br/>
          Crie uma nota e clique em <strong style="color:var(--gold)">"Salvar como modelo"</strong> para reutilizá-la depois.
         </div>`
      : `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px">
          ${modelos.map(m => `
            <div class="card" style="margin:0;cursor:default">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
                <div>
                  <div style="font-size:14px;font-weight:600">${esc(m.nome)}</div>
                  <div style="display:flex;gap:5px;margin-top:4px">
                    <span class="badge bg" style="font-size:10px">${esc(m.tipo||'nfse')}</span>
                    <span class="badge bg" style="font-size:10px">${(m.itens||[]).length} item(s)</span>
                  </div>
                </div>
                <button class="btn btn-danger btn-sm" onclick="excluirModelo('${m.id}')">🗑</button>
              </div>
              <div style="font-size:13px;color:var(--gold);font-weight:600;margin-bottom:10px">${fmt(m.total||0,m.moeda||'BRL')}</div>
              <div style="font-size:11px;color:var(--text3);margin-bottom:10px">
                ${(m.itens||[]).slice(0,3).map(it=>`• ${esc(it.desc||'Item')} — ${fmt(it.total||0,m.moeda)}`).join('<br/>')}
                ${(m.itens||[]).length>3?`<br/>• e mais ${(m.itens||[]).length-3} item(s)...`:''}
              </div>
              <button class="btn btn-gold" style="width:100%;justify-content:center" onclick="usarModelo('${m.id}')">Usar este modelo</button>
            </div>`).join('')}
        </div>`}
  </div>`;
}

window.salvarModeloAtual = () => {
  if(!nfItems.length || !nfItems[0].desc){toast('Adicione pelo menos um item à nota antes de salvar como modelo.','warn');return;}
  openModal(`
    <div class="modal-header"><span class="modal-title">Salvar como modelo</span><button class="modal-x" onclick="closeModal()">×</button></div>
    <div class="field"><label>Nome do modelo</label><input id="mod-nome" placeholder="Ex: Consultoria mensal, Dev de site…" value="${esc(nfModel.nome?nfModel.nome+' - modelo':'')}"/></div>
    <div style="font-size:13px;color:var(--text2);margin-bottom:1rem">Este modelo vai salvar: tipo de nota, itens, valores e dados do emitente.</div>
    <div style="display:flex;gap:8px;justify-content:flex-end">
      <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-gold" onclick="confirmarSalvarModelo()">Salvar modelo</button>
    </div>`);
  setTimeout(()=>document.getElementById('mod-nome')?.focus(),50);
};

window.confirmarSalvarModelo = () => {
  const nome = document.getElementById('mod-nome')?.value?.trim();
  if(!nome){toast('Informe um nome para o modelo.','warn');return;}
  const {total} = nfTotals();
  const arr = loadModelos();
  arr.unshift({
    id: newId(),
    nome,
    tipo: nfModel.tipo||'nfse',
    moeda: nfModel.moeda||'BRL',
    dados: {...nfModel},
    itens: JSON.parse(JSON.stringify(nfItems)),
    total,
    usosCount: 0,
    criadoEm: new Date().toISOString()
  });
  saveModelos(arr);
  closeModal();
  toast('Modelo salvo!','ok');
};

window.usarModelo = id => {
  const m = loadModelos().find(x=>x.id===id); if(!m)return;
  nfId    = null;
  nfModel = {...m.dados, tipo:m.tipo, moeda:m.moeda};
  nfItems = JSON.parse(JSON.stringify(m.itens||[]));
  nfLogo  = m.dados?.logo||null;
  nfImages= [];
  // Incrementa contador de uso
  const arr = loadModelos();
  const idx = arr.findIndex(x=>x.id===id);
  if(idx>=0){arr[idx].usosCount=(arr[idx].usosCount||0)+1;saveModelos(arr);}
  toast(`Modelo "${m.nome}" carregado!`,'ok');
  go('nf-form',{edit:false});
};

window.excluirModelo = id => {
  if(!confirm('Excluir este modelo?'))return;
  saveModelos(loadModelos().filter(m=>m.id!==id));
  toast('Modelo excluído.','ok');
  go('modelos');
};

/* ══════════════════════════════════════════
   3. NOTAS RECORRENTES
══════════════════════════════════════════ */
function rRecorrentes(el, acts) {
  acts.innerHTML = `<button class="btn btn-gold btn-sm" onclick="abrirNovaRecorrente()">+ Nova recorrência</button>`;
  const lista = loadRecorr();

  // Verifica quais têm emissão pendente hoje
  const hoje = nowDate();
  const pendentes = lista.filter(r => r.ativa && r.proxEmissao <= hoje);
  if(pendentes.length) {
    el.innerHTML += `<div class="al warn" style="margin-bottom:1rem">
      ${pendentes.length} nota(s) recorrente(s) pendente(s) de emissão.
      <button class="btn btn-sm" style="margin-left:8px" onclick="emitirTodasPendentes()">Emitir todas agora</button>
    </div>`;
  }

  el.innerHTML = `
  ${pendentes.length?`<div class="al warn" style="margin-bottom:1rem">${pendentes.length} nota(s) pendente(s) de emissão hoje. <button class="btn btn-sm" style="margin-left:8px" onclick="emitirTodasPendentes()">Emitir todas agora</button></div>`:''}
  <div class="card">
    <div class="card-header"><span class="card-title">Cobranças recorrentes (${lista.length})</span></div>
    ${lista.length===0
      ? `<div style="text-align:center;padding:2rem;color:var(--text3);font-size:13px">
          Nenhuma recorrência cadastrada.<br/>Configure notas que se repetem mensalmente para seus clientes fixos.
         </div>`
      : lista.map(r => `
        <div class="card" style="margin:0 0 10px">
          <div style="display:flex;align-items:flex-start;gap:12px">
            <div style="flex:1">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
                <span style="font-size:14px;font-weight:600">${esc(r.nome)}</span>
                <span class="badge ${r.ativa?'bgreen':'bg'}">${r.ativa?'ativa':'pausada'}</span>
                ${r.proxEmissao<=hoje&&r.ativa?`<span class="badge bred">emissão pendente</span>`:''}
              </div>
              <div style="font-size:12px;color:var(--text2)">${esc(r.cliente||'Sem cliente')} · ${esc(r.freq||'mensal')}</div>
              <div style="font-size:11px;color:var(--text3);margin-top:3px">Próxima emissão: ${fmtDate(r.proxEmissao)}</div>
            </div>
            <div style="text-align:right;flex-shrink:0">
              <div style="font-size:15px;font-weight:600;color:var(--gold)">${fmt(r.valor||0)}</div>
              <div style="display:flex;gap:4px;margin-top:8px;justify-content:flex-end">
                ${r.proxEmissao<=hoje&&r.ativa?`<button class="btn btn-gold btn-sm" onclick="emitirRecorrente('${r.id}')">Emitir</button>`:''}
                <button class="btn btn-ghost btn-sm" onclick="toggleRecorrente('${r.id}')">${r.ativa?'Pausar':'Ativar'}</button>
                <button class="btn btn-ghost btn-sm" onclick="editarRecorrente('${r.id}')">✏️</button>
                <button class="btn btn-danger btn-sm" onclick="excluirRecorrente('${r.id}')">🗑</button>
              </div>
            </div>
          </div>
        </div>`).join('')}
  </div>`;
}

window.abrirNovaRecorrente = (id) => {
  const r = id ? (loadRecorr().find(x=>x.id===id)||{}) : {};
  const modelos = loadModelos();
  const clientes = loadClientes();
  openModal(`
    <div class="modal-header"><span class="modal-title">${id?'Editar':'Nova'} recorrência</span><button class="modal-x" onclick="closeModal()">×</button></div>
    <div class="field"><label>Nome da recorrência</label><input id="r-nome" value="${esc(r.nome||'')}" placeholder="Ex: Consultoria mensal Acme"/></div>
    <div class="g2">
      <div class="field"><label>Cliente</label>
        <select id="r-cli">
          <option value="">— Selecionar —</option>
          ${clientes.map(c=>`<option value="${esc(c.nome)}" ${(r.cliente||'')==c.nome?'selected':''}>${esc(c.nome)}</option>`).join('')}
        </select></div>
      <div class="field"><label>Frequência</label>
        <select id="r-freq">
          <option value="semanal" ${(r.freq||'mensal')==='semanal'?'selected':''}>Semanal</option>
          <option value="quinzenal" ${(r.freq||'')==='quinzenal'?'selected':''}>Quinzenal</option>
          <option value="mensal" ${(r.freq||'mensal')==='mensal'?'selected':''}>Mensal</option>
          <option value="trimestral" ${(r.freq||'')==='trimestral'?'selected':''}>Trimestral</option>
        </select></div>
    </div>
    <div class="g2">
      <div class="field"><label>Valor (R$)</label><input type="number" id="r-val" value="${r.valor||''}" placeholder="0,00" min="0" step="0.01"/></div>
      <div class="field"><label>Próxima emissão</label><input type="date" id="r-prox" value="${r.proxEmissao||nowDate()}"/></div>
    </div>
    ${modelos.length?`<div class="field"><label>Modelo de nota (opcional)</label>
      <select id="r-mod">
        <option value="">— Nenhum —</option>
        ${modelos.map(m=>`<option value="${m.id}" ${(r.modeloId||'')==m.id?'selected':''}>${esc(m.nome)}</option>`).join('')}
      </select></div>`:''}
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:1rem">
      <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-gold" onclick="salvarRecorrente('${id||''}')">Salvar</button>
    </div>`);
};
window.editarRecorrente = id => abrirNovaRecorrente(id);

window.salvarRecorrente = id => {
  const nome = document.getElementById('r-nome')?.value?.trim();
  const val  = parseFloat(document.getElementById('r-val')?.value)||0;
  const prox = document.getElementById('r-prox')?.value;
  if(!nome){toast('Informe um nome.','warn');return;}
  if(!val){toast('Informe o valor.','warn');return;}
  const arr = loadRecorr();
  const dados = {
    id: id||newId(),
    nome, valor: val,
    cliente: document.getElementById('r-cli')?.value||'',
    freq: document.getElementById('r-freq')?.value||'mensal',
    proxEmissao: prox||nowDate(),
    modeloId: document.getElementById('r-mod')?.value||'',
    ativa: true,
    criadoEm: new Date().toISOString()
  };
  const idx = arr.findIndex(x=>x.id===dados.id);
  if(idx>=0) arr[idx]=dados; else arr.unshift(dados);
  saveRecorr(arr);
  closeModal();
  toast('Recorrência salva!','ok');
  go('recorrentes');
};

window.toggleRecorrente = id => {
  const arr = loadRecorr();
  const r = arr.find(x=>x.id===id); if(!r)return;
  r.ativa = !r.ativa;
  saveRecorr(arr);
  toast(r.ativa?'Recorrência ativada.':'Recorrência pausada.','ok');
  go('recorrentes');
};
window.excluirRecorrente = id => { if(!confirm('Excluir esta recorrência?'))return; saveRecorr(loadRecorr().filter(r=>r.id!==id)); toast('Excluída.','ok'); go('recorrentes'); };

window.emitirRecorrente = id => {
  const arr = loadRecorr();
  const r = arr.find(x=>x.id===id); if(!r)return;
  // Carrega modelo se houver, senão cria nota básica
  if(r.modeloId){ const m = loadModelos().find(x=>x.id===r.modeloId); if(m){ nfId=null; nfModel={...m.dados,tipo:m.tipo,moeda:m.moeda,cnom:r.cliente}; nfItems=JSON.parse(JSON.stringify(m.itens||[])); nfLogo=m.dados?.logo||null; nfImages=[]; } }
  else { nfReset(); nfModel.cnom=r.cliente; }
  // Avança próxima emissão
  const freq = r.freq||'mensal';
  const d = new Date(r.proxEmissao);
  if(freq==='semanal')    d.setDate(d.getDate()+7);
  else if(freq==='quinzenal') d.setDate(d.getDate()+15);
  else if(freq==='mensal') d.setMonth(d.getMonth()+1);
  else if(freq==='trimestral') d.setMonth(d.getMonth()+3);
  r.proxEmissao = d.toISOString().slice(0,10);
  saveRecorr(arr);
  toast(`Nota carregada para ${r.cliente||r.nome}. Revise e salve.`,'ok');
  go('nf-form');
};

window.emitirTodasPendentes = () => {
  const hoje = nowDate();
  const pendentes = loadRecorr().filter(r=>r.ativa&&r.proxEmissao<=hoje);
  pendentes.forEach(r => emitirRecorrente(r.id));
  toast(`${pendentes.length} nota(s) carregada(s)!`,'ok');
};

/* ══════════════════════════════════════════
   4. RELATÓRIO FISCAL
══════════════════════════════════════════ */
function rRelatorio(el, acts) {
  acts.innerHTML = '';
  const notas = loadNotas();
  const hoje = new Date();
  const anoAtual = hoje.getFullYear();

  el.innerHTML = `
  <div class="card">
    <div class="card-header"><span class="card-title">Gerar relatório fiscal</span></div>
    <div class="g3">
      <div class="field"><label>Período</label>
        <select id="rel-per" onchange="relAtualizar()">
          <option value="mes">Mês atual</option>
          <option value="trim">1º trimestre ${anoAtual}</option>
          <option value="sem1">1º semestre ${anoAtual}</option>
          <option value="sem2">2º semestre ${anoAtual-1}</option>
          <option value="ano" selected>Ano completo ${anoAtual}</option>
          <option value="todos">Todos os registros</option>
        </select></div>
      <div class="field"><label>Status das notas</label>
        <select id="rel-status" onchange="relAtualizar()">
          <option value="">Todos</option>
          <option value="emitida">Emitidas</option>
          <option value="paga">Pagas</option>
          <option value="pendente">Pendentes</option>
          <option value="cancelada">Canceladas</option>
        </select></div>
      <div class="field"><label>Incluir no relatório</label>
        <div style="display:flex;flex-direction:column;gap:6px;margin-top:4px">
          ${['Lista de notas','Totais por cliente','Resumo de impostos','Notas em aberto'].map((opt,i)=>`
            <label style="display:flex;align-items:center;gap:6px;font-size:13px;color:var(--text2);cursor:pointer">
              <input type="checkbox" id="rel-opt${i}" checked style="cursor:pointer"/> ${opt}
            </label>`).join('')}
        </div></div>
    </div>
    <div id="rel-preview"></div>
    <div style="display:flex;gap:10px;margin-top:1.25rem;flex-wrap:wrap">
      <button class="btn btn-gold" onclick="exportarRelatorioPDF()">⬇ Exportar PDF</button>
      <button class="btn btn-ghost" onclick="exportarRelatorioCSV()">📊 Exportar Excel/CSV</button>
    </div>
  </div>`;
  relAtualizar();
}

function relFiltrar() {
  const per = document.getElementById('rel-per')?.value||'ano';
  const status = document.getElementById('rel-status')?.value||'';
  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  let notas = loadNotas();
  if(status) notas = notas.filter(n=>n.status===status);
  const desde = d => { const dt=new Date(d||''); return !isNaN(dt)?dt:new Date(0); };
  if(per==='mes') notas=notas.filter(n=>{ const d=new Date(n.emitidaEm||n.em); return d.getMonth()===hoje.getMonth()&&d.getFullYear()===anoAtual; });
  else if(per==='trim') notas=notas.filter(n=>{ const d=new Date(n.emitidaEm||n.em); return d.getFullYear()===anoAtual&&d.getMonth()<3; });
  else if(per==='sem1') notas=notas.filter(n=>{ const d=new Date(n.emitidaEm||n.em); return d.getFullYear()===anoAtual&&d.getMonth()<6; });
  else if(per==='sem2') notas=notas.filter(n=>{ const d=new Date(n.emitidaEm||n.em); return d.getFullYear()===anoAtual-1&&d.getMonth()>=6; });
  else if(per==='ano') notas=notas.filter(n=>{ const d=new Date(n.emitidaEm||n.em); return d.getFullYear()===anoAtual; });
  return notas;
}

window.relAtualizar = () => {
  const notas = relFiltrar();
  const total = notas.reduce((a,n)=>a+(n.total||0),0);
  const pagas = notas.filter(n=>n.status==='paga').reduce((a,n)=>a+(n.total||0),0);
  const aberto = notas.filter(n=>n.status!=='paga'&&n.status!=='cancelada').reduce((a,n)=>a+(n.total||0),0);
  // Totais por cliente
  const porCliente = {};
  notas.forEach(n=>{ const k=n.cnom||'Sem cliente'; if(!porCliente[k])porCliente[k]={total:0,count:0}; porCliente[k].total+=n.total||0; porCliente[k].count++; });
  const prev = document.getElementById('rel-preview');
  if(!prev)return;
  prev.innerHTML = `
  <div style="background:var(--bg3);border-radius:var(--rs);padding:1.25rem;margin-top:1.25rem">
    <div class="sec-lbl" style="margin-bottom:1rem">Prévia do relatório — ${notas.length} nota(s)</div>
    <div class="g4" style="margin-bottom:1.25rem">
      <div class="stat-card"><div class="stat-label">Total emitido</div><div class="stat-value gold" style="font-size:18px">${fmt(total)}</div></div>
      <div class="stat-card"><div class="stat-label">Recebido</div><div class="stat-value green" style="font-size:18px">${fmt(pagas)}</div></div>
      <div class="stat-card"><div class="stat-label">Em aberto</div><div class="stat-value red" style="font-size:18px">${fmt(aberto)}</div></div>
      <div class="stat-card"><div class="stat-label">Ticket médio</div><div class="stat-value" style="font-size:18px">${notas.length?fmt(total/notas.length):fmt(0)}</div></div>
    </div>
    <div class="sec-lbl" style="margin-bottom:.75rem">Por cliente</div>
    ${Object.entries(porCliente).sort((a,b)=>b[1].total-a[1].total).slice(0,8).map(([k,v])=>`
      <div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:.5px solid var(--border);font-size:13px">
        <span style="color:var(--text2)">${esc(k)}</span>
        <div style="text-align:right">
          <span style="font-weight:600;color:var(--gold)">${fmt(v.total)}</span>
          <span style="color:var(--text3);font-size:11px;margin-left:6px">${v.count} nota${v.count!==1?'s':''}</span>
        </div>
      </div>`).join('')}
  </div>`;
};

window.exportarRelatorioPDF = () => {
  const notas = relFiltrar();
  const total = notas.reduce((a,n)=>a+(n.total||0),0);
  const pagas = notas.filter(n=>n.status==='paga').reduce((a,n)=>a+(n.total||0),0);
  const aberto = notas.filter(n=>n.status!=='paga'&&n.status!=='cancelada').reduce((a,n)=>a+(n.total||0),0);
  const porCliente = {};
  notas.forEach(n=>{ const k=n.cnom||'Sem cliente'; if(!porCliente[k])porCliente[k]={total:0,count:0}; porCliente[k].total+=n.total||0; porCliente[k].count++; });
  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"/>
<title>Relatório Fiscal</title>
<style>body{font-family:Arial,sans-serif;color:#111;padding:2rem;max-width:900px;margin:0 auto}h1{font-size:22px;margin-bottom:.5rem}h2{font-size:15px;color:#555;margin:1.5rem 0 .75rem;border-bottom:1px solid #eee;padding-bottom:6px}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:1.5rem}.card{background:#f9fafb;border-radius:8px;padding:12px}.card .l{font-size:10px;color:#9ca3af;text-transform:uppercase;font-weight:700;margin-bottom:4px}.card .v{font-size:20px;font-weight:700}table{width:100%;border-collapse:collapse;font-size:13px}th{background:#f9fafb;padding:8px 12px;text-align:left;border-bottom:1.5px solid #e5e7eb;font-size:11px;text-transform:uppercase;color:#6b7280}td{padding:9px 12px;border-bottom:1px solid #f3f4f6}.total-row{font-weight:700}@media print{.no-print{display:none}}</style>
</head><body>
<div class="no-print" style="margin-bottom:1.5rem;display:flex;gap:10px">
  <button onclick="window.print()" style="padding:9px 20px;background:#c9a84c;color:#fff;border:none;border-radius:8px;font-weight:700;font-size:13px;cursor:pointer">⬇ Imprimir / Salvar PDF</button>
  <button onclick="window.close()" style="padding:9px 14px;background:#f3f4f6;border:none;border-radius:8px;font-size:13px;cursor:pointer">Fechar</button>
</div>
<h1>Relatório Fiscal — ${new Date().getFullYear()}</h1>
<p style="color:#6b7280;font-size:12px">Gerado em ${new Date().toLocaleDateString('pt-BR')} · ${notas.length} notas</p>
<div class="grid">
  <div class="card"><div class="l">Total emitido</div><div class="v" style="color:#c9a84c">${fmt(total)}</div></div>
  <div class="card"><div class="l">Recebido</div><div class="v" style="color:#22c55e">${fmt(pagas)}</div></div>
  <div class="card"><div class="l">Em aberto</div><div class="v" style="color:#ef4444">${fmt(aberto)}</div></div>
  <div class="card"><div class="l">Ticket médio</div><div class="v">${notas.length?fmt(total/notas.length):fmt(0)}</div></div>
</div>
<h2>Resumo por cliente</h2>
<table><thead><tr><th>Cliente</th><th>Notas</th><th>Total</th></tr></thead>
<tbody>${Object.entries(porCliente).sort((a,b)=>b[1].total-a[1].total).map(([k,v])=>`<tr><td>${esc(k)}</td><td>${v.count}</td><td style="font-weight:600">${fmt(v.total)}</td></tr>`).join('')}</tbody>
</table>
<h2>Lista de notas</h2>
<table><thead><tr><th>Nº</th><th>Cliente</th><th>Tipo</th><th>Data</th><th>Total</th><th>Status</th></tr></thead>
<tbody>${notas.map(n=>`<tr><td>#${esc(n.numero||'—')}</td><td>${esc(n.cnom||'—')}</td><td>${esc(n.tipo||'')}</td><td>${fmtDate(n.emitidaEm||n.em)}</td><td style="font-weight:600">${fmt(n.total||0,n.moeda)}</td><td>${n.status||'emitida'}</td></tr>`).join('')}</tbody>
</table>
</body></html>`;
  const pw = window.open('','_blank','width=900,height=750');
  if(!pw){toast('Permita pop-ups.','warn');return;}
  pw.document.write(html); pw.document.close();
};

window.exportarRelatorioCSV = () => {
  const notas = relFiltrar();
  let csv = 'Numero,Cliente,CNPJ_Cliente,Tipo,Data_Emissao,Vencimento,Total,Moeda,Status\n';
  notas.forEach(n=>{
    csv += [
      n.numero||'', n.cnom||'', n.dados?.ccnpj||'',
      n.tipo||'', n.emitidaEm||'', n.dados?.venc||'',
      (n.total||0).toFixed(2), n.moeda||'BRL', n.status||'emitida'
    ].map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')+'\n';
  });
  const blob = new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'});
  const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`relatorio_${new Date().toISOString().slice(0,10)}.csv`; a.click();
  toast('CSV exportado!','ok');
};

/* ══════════════════════════════════════════
   5. ALERTAS E LEMBRETES
══════════════════════════════════════════ */
function rAlertas(el, acts) {
  acts.innerHTML = '';
  const notas   = loadNotas();
  const hoje    = new Date(); hoje.setHours(0,0,0,0);
  const recorr  = loadRecorr();

  const alertas = [];
  notas.forEach(n => {
    if(!n.dados?.venc || n.status==='paga'||n.status==='cancelada') return;
    const venc = new Date(n.dados.venc); venc.setHours(0,0,0,0);
    const diff = Math.round((venc-hoje)/(1000*60*60*24));
    if(diff<0) alertas.push({tipo:'danger',emoji:'🚨',titulo:`Vencida há ${Math.abs(diff)} dia(s)`,nota:n,diff});
    else if(diff<=3) alertas.push({tipo:'danger',emoji:'⚠️',titulo:`Vence em ${diff} dia(s)`,nota:n,diff});
    else if(diff<=7) alertas.push({tipo:'warning',emoji:'⏰',titulo:`Vence em ${diff} dias`,nota:n,diff});
  });
  alertas.sort((a,b)=>a.diff-b.diff);

  // Recorrentes pendentes
  const recPend = recorr.filter(r=>r.ativa&&r.proxEmissao<=nowDate());

  el.innerHTML = `
  <div class="card">
    <div class="card-header"><span class="card-title">Central de alertas</span><span class="badge ${alertas.length?'bred':'bgreen'}">${alertas.length} alerta(s)</span></div>
    ${alertas.length===0&&recPend.length===0
      ? `<div style="text-align:center;padding:2rem;color:var(--text3);font-size:13px">✅ Nenhuma pendência. Todas as notas estão em dia!</div>`
      : `
        ${recPend.map(r=>`
          <div style="display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:var(--rs);border-left:3px solid var(--gold);background:var(--gold-dim);margin-bottom:8px">
            <span style="font-size:18px">🔄</span>
            <div style="flex:1">
              <div style="font-size:13px;font-weight:500;color:var(--gold)">Nota recorrente pendente</div>
              <div style="font-size:12px;color:var(--text2)">${esc(r.nome)} — ${esc(r.cliente||'')} — ${fmt(r.valor||0)}</div>
            </div>
            <button class="btn btn-gold btn-sm" onclick="emitirRecorrente('${r.id}')">Emitir</button>
          </div>`).join('')}
        ${alertas.map(a=>`
          <div style="display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:var(--rs);border-left:3px solid ${a.tipo==='danger'?'var(--red)':'#fbbf24'};background:${a.tipo==='danger'?'var(--red-dim)':'rgba(251,191,36,.08)'};margin-bottom:8px">
            <span style="font-size:18px">${a.emoji}</span>
            <div style="flex:1">
              <div style="font-size:13px;font-weight:500;color:${a.tipo==='danger'?'var(--red)':'#fbbf24'}">${a.titulo}</div>
              <div style="font-size:12px;color:var(--text2)">Nota #${esc(a.nota.numero||'—')} · ${esc(a.nota.cnom||'—')} · ${fmt(a.nota.total||0,a.nota.moeda)}</div>
            </div>
            <div style="display:flex;gap:6px;flex-shrink:0">
              <button class="btn btn-ghost btn-sm" onclick="editarNota('${a.nota.id}')">Ver nota</button>
              <button class="btn btn-gold btn-sm" onclick="abrirCobrar('${a.nota.id}')">Cobrar</button>
            </div>
          </div>`).join('')}`}
  </div>

  <div class="card">
    <div class="card-header"><span class="card-title">Enviar lembrete de cobrança</span></div>
    <div class="field"><label>Mensagem personalizada</label>
      <textarea id="lembrete-msg" style="min-height:100px">${gerarMsgCobranca()}</textarea></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn btn-ghost" onclick="copiarMsgCobranca()">📋 Copiar mensagem</button>
      <button class="btn btn-ghost" onclick="abrirWhatsapp()">📱 Abrir WhatsApp</button>
      <button class="btn btn-ghost" onclick="abrirEmail()">📧 Abrir e-mail</button>
    </div>
  </div>`;
}

function gerarMsgCobranca() {
  return `Olá! Passando para lembrá-lo(a) sobre a nota fiscal em aberto no valor de [VALOR], com vencimento em [DATA]. Qualquer dúvida, estou à disposição. Obrigado(a)!`;
}
window.abrirCobrar = id => {
  const n = getNota(id); if(!n)return;
  openModal(`
    <div class="modal-header"><span class="modal-title">Cobrar cliente</span><button class="modal-x" onclick="closeModal()">×</button></div>
    <p style="font-size:13px;color:var(--text2);margin-bottom:1rem">Nota #${esc(n.numero||'—')} · ${esc(n.cnom||'—')} · <strong style="color:var(--gold)">${fmt(n.total||0,n.moeda)}</strong></p>
    <div class="field"><label>Mensagem</label>
      <textarea id="cobr-msg" style="min-height:100px">Olá, ${esc(n.cnom||'')}! Passando para lembrá-lo(a) sobre a nota #${esc(n.numero||'—')} no valor de ${fmt(n.total||0,n.moeda)}, com vencimento em ${fmtDate(n.dados?.venc||'')}. Qualquer dúvida, estou à disposição!</textarea></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:1rem">
      <button class="btn btn-ghost" onclick="navigator.clipboard.writeText(document.getElementById('cobr-msg').value).then(()=>toast('Copiado!','ok'))">📋 Copiar</button>
      <button class="btn btn-ghost" onclick="window.open('https://wa.me/?text='+encodeURIComponent(document.getElementById('cobr-msg').value),'_blank')">📱 WhatsApp</button>
      <button class="btn btn-ghost" onclick="window.open('mailto:${esc(n.dados?.cemail||'')}?subject=Lembrete de cobrança&body='+encodeURIComponent(document.getElementById('cobr-msg').value),'_blank')">📧 E-mail</button>
    </div>`);
};
window.copiarMsgCobranca = () => { const msg=document.getElementById('lembrete-msg')?.value; if(msg) navigator.clipboard.writeText(msg).then(()=>toast('Mensagem copiada!','ok')); };
window.abrirWhatsapp = () => { const msg=document.getElementById('lembrete-msg')?.value||''; window.open('https://wa.me/?text='+encodeURIComponent(msg),'_blank'); };
window.abrirEmail = () => { const msg=document.getElementById('lembrete-msg')?.value||''; window.open('mailto:?subject=Lembrete de cobrança&body='+encodeURIComponent(msg),'_blank'); };

/* ══════════════════════════════════════════
   BADGE DE ALERTAS NA SIDEBAR
══════════════════════════════════════════ */
function contarAlertas() {
  const notas = loadNotas();
  const hoje = new Date(); hoje.setHours(0,0,0,0);
  let count = 0;
  notas.forEach(n=>{
    if(!n.dados?.venc||n.status==='paga'||n.status==='cancelada')return;
    const venc=new Date(n.dados.venc); venc.setHours(0,0,0,0);
    if((venc-hoje)/(1000*60*60*24)<=7) count++;
  });
  count += loadRecorr().filter(r=>r.ativa&&r.proxEmissao<=nowDate()).length;
  return count;
}
