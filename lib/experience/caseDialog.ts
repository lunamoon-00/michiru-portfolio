// 作品カードを押したときに開く、詳しい説明（課題 → つくったもの → 工夫 → 成果）
import { works, type WorkDetail } from '@/lib/content';
import { byId, pad2, textOf } from './dom';
import { playTransition } from './transition';
import { sfx } from './sound';
import { glitch } from './state';

export const isCaseOpen = () => document.getElementById('case')?.classList.contains('open') ?? false;

/** 文字の中の < > & " を、HTMLとして読まれない形にする */
const esc = (t: string) =>
  t.replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch] ?? ch);

/** 詳しい説明のHTMLを作る。本文は lib/content.ts の固定の文章（<strong> を使うため、そのまま入れる） */
function render(card: HTMLElement, d: WorkDetail) {
  const no = card.querySelector('.big')?.textContent ?? '';
  const meta = card.querySelector('.meta')?.textContent ?? '';
  const title = textOf(card.querySelector('h3') ?? card);
  const gradient = card.style.getPropertyValue('--g');
  const visual = d.img ? `<img src="${d.img}" alt="">` : d.dev ? '' : (card.querySelector('.thumb')?.innerHTML ?? '');
  const blocks = d.blocks.map(([en, ja, body], k) => {
    const content = Array.isArray(body) ? `<ul>${body.map((li) => `<li>${li}</li>`).join('')}</ul>` : `<p>${body}</p>`;
    return `<div class="blk"><h4>${pad2(k + 1)} / ${en}<small>${ja}</small></h4><div>${content}</div></div>`;
  }).join('');
  const links = d.links
    ? `<div class="links">${d.links.map(([href, en, ja]) =>
        `<a class="btn" href="${href}" target="_blank" rel="noopener"><small>${en} ↗</small>${ja}</a>`).join('')}</div>`
    : '';
  return `
    <p class="meta">CASE ${no} — ${esc(meta)}</p>
    <h2>${esc(title)}</h2>
    <div class="visual${d.dev ? ' dev' : ''}" style="${gradient ? `--g:${gradient}` : ''}">${visual}</div>
    <div class="stat"><b>${d.stat[0]}</b><span>${d.stat[1]}</span></div>
    ${blocks}
    <div class="tags">${d.tags.map((t) => `<span>${esc(t)}</span>`).join('')}</div>
    ${links}
    ${d.note ? `<p class="note">${d.note}</p>` : ''}`;
}

/** @param cards 作品カード（lib/content.ts の works と同じ順番） */
export function setupCaseDialog(cards: HTMLAnchorElement[]) {
  const dialog = byId('case'), body = byId('caseBody'), closeBtn = byId<HTMLButtonElement>('caseClose');
  let openedFrom: HTMLElement | null = null;   // 閉じたあと、押したカードに戻るため
  let busy = false;

  function open(card: HTMLAnchorElement) {
    const work = works[cards.indexOf(card)];
    if (!work) return;
    body.innerHTML = render(card, work.detail);
    dialog.scrollTop = 0;
    dialog.classList.add('open');
    document.body.classList.add('locked');   // 後ろのページがスクロールしないように
    openedFrom = card;
    closeBtn.focus({ preventScroll: true });
  }

  function close() {
    if (!isCaseOpen()) return;
    dialog.classList.remove('open');
    document.body.classList.remove('locked');
    glitch.bump(0.8);
    sfx.click();
    openedFrom?.focus({ preventScroll: true });
  }

  closeBtn.addEventListener('click', close);
  addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  cards.forEach((card) => card.addEventListener('click', async (e) => {
    e.preventDefault();
    if (busy) return;
    busy = true;
    await playTransition({
      sub: `CASE STUDY — W/${card.querySelector('.big')?.textContent ?? ''}`,
      title: textOf(card.querySelector('h3') ?? card),
      foot: 'LOADING',
      kick: 1.6, hold: 800, settle: 650,
      onReveal: () => open(card),
    });
    busy = false;
  }));
}
