// js/supabase.js
// ── Inicialização do cliente Supabase ──────────────────────

// ⚠️  SUBSTITUA pelos seus valores do projeto Supabase
// Painel Supabase → Settings → API
export const SUPABASE_URL = 'https://SEU_PROJETO.supabase.co';
export const SUPABASE_ANON_KEY = 'SUA_ANON_KEY_AQUI';

// Importa o cliente Supabase via CDN (ES Module)
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,   // captura o redirect do Google OAuth
  }
});

// ── Estado global de sessão ─────────────────────────────────
export let currentUser = null;

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  currentUser = session?.user ?? null;
  return session;
}

// ── Autenticação ────────────────────────────────────────────

// Login com e-mail + senha (com proteção básica contra brute-force no lado cliente)
let loginAttempts = 0;
let loginLockUntil = 0;

export async function loginEmail(email, senha) {
  // Rate-limit client-side
  if (Date.now() < loginLockUntil) {
    const seg = Math.ceil((loginLockUntil - Date.now()) / 1000);
    throw new Error(`Muitas tentativas. Aguarde ${seg}s.`);
  }

  // Sanitiza — Supabase usa prepared statements então SQL injection não passa,
  // mas validamos formato aqui também
  if (!isValidEmail(email)) throw new Error('E-mail inválido.');
  if (!senha || senha.length < 6) throw new Error('Senha muito curta.');

  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password: senha });

  if (error) {
    loginAttempts++;
    if (loginAttempts >= 5) {
      loginLockUntil = Date.now() + 60_000; // bloqueia 60s
      loginAttempts = 0;
      throw new Error('Muitas tentativas falhas. Aguarde 60 segundos.');
    }
    throw new Error('E-mail ou senha incorretos.');
  }

  loginAttempts = 0;
  currentUser = data.user;
  return data;
}

// Cadastro com e-mail + senha
export async function signupEmail(email, senha, nome) {
  if (!isValidEmail(email)) throw new Error('E-mail inválido.');
  if (!senha || senha.length < 8) throw new Error('A senha deve ter pelo menos 8 caracteres.');
  if (!nome || nome.trim().length < 2) throw new Error('Informe seu nome completo.');

  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password: senha,
    options: { data: { full_name: nome.trim() } }
  });

  if (error) throw new Error(error.message);
  return data;
}

// Login com Google OAuth
export async function loginGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/index.html',
      queryParams: { access_type: 'offline', prompt: 'consent' }
    }
  });
  if (error) throw new Error(error.message);
}

// Logout
export async function logout() {
  await supabase.auth.signOut();
  currentUser = null;
}

// ── Notas fiscais ────────────────────────────────────────────

export async function listNotas({ page = 0, limit = 20, status = null } = {}) {
  let q = supabase
    .from('notas_fiscais')
    .select('id,tipo,numero,cliente_nome,total,moeda,status,emitida_em,vence_em,created_at')
    .order('created_at', { ascending: false })
    .range(page * limit, (page + 1) * limit - 1);

  if (status) q = q.eq('status', status);

  const { data, error } = await q;
  if (error) throw error;
  return data;
}

export async function getNota(id) {
  const { data, error } = await supabase
    .from('notas_fiscais')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function saveNota(nota) {
  const payload = sanitizeNota(nota);
  if (nota.id) {
    const { data, error } = await supabase.from('notas_fiscais').update(payload).eq('id', nota.id).select().single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase.from('notas_fiscais').insert({ ...payload, user_id: currentUser.id }).select().single();
    if (error) throw error;
    return data;
  }
}

export async function deleteNota(id) {
  const { error } = await supabase.from('notas_fiscais').delete().eq('id', id);
  if (error) throw error;
}

export async function updateStatusNota(id, status) {
  const allowed = ['emitida','paga','cancelada','pendente'];
  if (!allowed.includes(status)) throw new Error('Status inválido.');
  const { error } = await supabase.from('notas_fiscais').update({ status }).eq('id', id);
  if (error) throw error;
}

// ── Templates ────────────────────────────────────────────────

export async function listTemplates() {
  const { data, error } = await supabase.from('templates').select('*').order('is_default', { ascending: false });
  if (error) throw error;
  return data;
}

export async function saveTemplate(tpl) {
  const payload = { nome: sanitizeText(tpl.nome), layout: tpl.layout, is_default: !!tpl.is_default };
  if (tpl.id) {
    const { data, error } = await supabase.from('templates').update(payload).eq('id', tpl.id).select().single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase.from('templates').insert({ ...payload, user_id: currentUser.id }).select().single();
    if (error) throw error;
    return data;
  }
}

export async function deleteTemplate(id) {
  const { error } = await supabase.from('templates').delete().eq('id', id);
  if (error) throw error;
}

// ── Simulações IR ────────────────────────────────────────────

export async function listIrSimulacoes() {
  const { data, error } = await supabase
    .from('ir_simulacoes')
    .select('id,ano_base,resultado,created_at')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return data;
}

export async function saveIrSimulacao(dadosInput, resultado, anoBase = 2024) {
  const { data, error } = await supabase.from('ir_simulacoes').insert({
    user_id: currentUser.id,
    ano_base: anoBase,
    dados_input: dadosInput,
    resultado
  }).select().single();
  if (error) throw error;
  return data;
}

// ── Upload de imagens ────────────────────────────────────────

export async function uploadImagem(file, notaId) {
  const ext = file.name.split('.').pop().toLowerCase();
  const allowed = ['jpg','jpeg','png','webp','gif'];
  if (!allowed.includes(ext)) throw new Error('Formato não permitido. Use JPG, PNG ou WEBP.');
  if (file.size > 5 * 1024 * 1024) throw new Error('Imagem muito grande. Máximo: 5MB.');

  const path = `${currentUser.id}/${notaId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('nota-imagens').upload(path, file, { upsert: false });
  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage.from('nota-imagens').getPublicUrl(path);
  return publicUrl;
}

export async function deleteImagem(path) {
  const { error } = await supabase.storage.from('nota-imagens').remove([path]);
  if (error) throw error;
}

// ── Utilitários de segurança ─────────────────────────────────

function isValidEmail(email) {
  // RFC 5322 simplificado
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email));
}

function sanitizeText(str, max = 200) {
  if (typeof str !== 'string') return '';
  // Remove tags HTML e limita tamanho
  return str.replace(/<[^>]*>/g, '').trim().slice(0, max);
}

function sanitizeNota(nota) {
  // Valida e limpa campos antes de enviar ao banco
  // O Supabase usa prepared statements (sem SQL injection),
  // mas sanitizamos para integridade dos dados
  return {
    tipo:         ['nfse','nfe','fatura','recibo','orcamento'].includes(nota.tipo) ? nota.tipo : 'nfse',
    numero:       sanitizeText(nota.numero, 50),
    cliente_nome: sanitizeText(nota.cliente_nome, 200),
    total:        Math.max(0, parseFloat(nota.total) || 0),
    moeda:        ['BRL','USD','EUR'].includes(nota.moeda) ? nota.moeda : 'BRL',
    dados:        nota.dados || {},
    itens:        Array.isArray(nota.itens) ? nota.itens : [],
    imagens:      Array.isArray(nota.imagens) ? nota.imagens : [],
    status:       ['emitida','paga','cancelada','pendente'].includes(nota.status) ? nota.status : 'emitida',
    emitida_em:   nota.emitida_em || null,
    vence_em:     nota.vence_em || null,
  };
}
