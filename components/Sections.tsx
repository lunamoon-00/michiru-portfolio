// トップページの各セクション。
// data-eng / data-cre は「このセクションに来たとき、3Dの粒をどの形にするか」の番号
// （0=球, 1=構成図, 2=1h→3min, 3=作品の枠, 4=光の輪, 5=105K）。
// data-m="eng" / "cre" が付いたものは、そのモードのときだけ表示される。
import type { CSSProperties } from 'react';
import { heroStats, numbers, works, type Mode } from '@/lib/content';
import { ModeButtons } from './Nav';

/** CSSの変数（--g など）を style に書くための型 */
type CSSVars = CSSProperties & Record<`--${string}`, string | number>;

// ------------------------------------------------------------------
// 01 HERO
// ------------------------------------------------------------------
function Stats({ mode }: { mode: Mode }) {
  return (
    <div className="grp" data-m={mode}>
      {heroStats[mode].map((s) => (
        <div key={s.value}><b>{s.value}</b><span>{s.label[0]}<br />{s.label[1]}</span></div>
      ))}
    </div>
  );
}

export function Hero() {
  return (
    <section className="sec hero" id="hero" data-cre="0" data-eng="1" data-name="HERO">
      <div className="copy">
        <p className="eyebrow reveal">
          <span className="swap">
            <span className="eng" data-scramble="">AI ENGINEERING — AUTOMATION · SYSTEMS</span>
            <span className="cre" data-scramble="">AI CREATIVE — MV · VIDEO · IP</span>
          </span>
        </p>
        <h1 className="reveal">AIで、<br /><span className="swap"><em className="eng">仕組みにする。</em><em className="cre">つくる。</em></span></h1>
        <p className="lead reveal">
          <span className="swap">
            <span className="cre">楽曲やキャラクターの世界観を、AI映像として形にします。企画・作詞・AI音楽・映像・編集から、SNSでの分析と改善まで一人で担当しています。</span>
            <span className="eng">福祉の現場で3年働いた経験をもとに、現場で使い続けられる業務システムを開発しています。ヒアリングから設計・実装・導入まで一人で担当しています。</span>
          </span>
        </p>
        <div className="stats reveal">
          <Stats mode="eng" />
          <Stats mode="cre" />
        </div>
        <div className="reveal">
          <div className="toggle" role="group" aria-label="表示モード">
            <span className="pill" />
            <ModeButtons />
          </div>
          <span className="hint">MOVE YOUR MOUSE · PRESS SPACE TO SWITCH</span>
        </div>
      </div>
      <div className="scroll-cue reveal">SCROLL</div>
    </section>
  );
}

// ------------------------------------------------------------------
// 02 IMPACT：いちばん伝えたい実績を1つだけ
// ------------------------------------------------------------------
export function Impact() {
  return (
    <section className="sec impact" id="impact" data-cre="5" data-eng="2" data-name="IMPACT">
      <div className="box" data-m="cre">
        <p className="eyebrow" data-scramble="">02 — IMPACT / ORIGINAL AI IDOL</p>
        <h2 className="rv">ゼロから、<br /><em>10.5万回</em>。</h2>
        <p className="lead rv">AIアイドル「I♥DOLL」を、企画・世界観・5人のキャラクター・作詞・AI音楽・MV・短編ドラマ・YouTube運用まで、一人で立ち上げました。直近1年で10.5万回の視聴、165人のチャンネル登録につながっています。</p>
        <div className="chips rv">{['企画・世界観', 'キャラクター設計', '作詞・AI音楽', 'MV・短編ドラマ', '分析・改善'].map((t) => <span key={t}>{t}</span>)}</div>
      </div>
      <div className="box" data-m="eng">
        <p className="eyebrow" data-scramble="">02 — IMPACT / WELFARE SYSTEMS</p>
        <h2 className="rv">現場の1時間を、<br /><em>3分</em>に。</h2>
        <p className="lead rv">清掃の現場で写真を撮り、事業所に戻ってExcelに入力し、Slackに投稿する。この流れを、現場でボタン1つで終わる仕組みに変えました。福祉の現場で3年働いたから分かる「本当に必要な情報」を設計に入れています。最初の1件から信頼をいただき、7件のシステム開発につながりました。</p>
        <div className="chips rv">{['ヒアリング', '現地訪問', '要件定義', '設計・実装', '導入・運用'].map((t) => <span key={t}>{t}</span>)}</div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------------
// 03 NUMBERS：大きな数字が画面を横切る（スクロールで進む）
// ------------------------------------------------------------------
export function Numbers() {
  return (
    <section className="sec pin numbers" id="numbers" data-cre="4" data-eng="4" data-name="NUMBERS" style={{ '--n': 4 } as CSSVars}>
      <div className="sticky">
        <p className="eyebrow pin-head" data-scramble="">03 — BY THE NUMBERS</p>
        {numbers.map((n) => (
          <div key={n.mode + n.unit} className="bignum" data-m={n.mode} data-value={n.value}
            data-prefix={n.prefix} data-suffix={n.suffix} data-unit={n.unit} data-text={n.text}>
            <span className="ghost" /><span className="val">0</span>
          </div>
        ))}
        <div className="numlabel">
          <div><span className="idx" id="numIdx">01 / 04</span><span className="unit" id="numUnit">SYSTEMS</span></div>
          <p id="numText" />
        </div>
        <div className="numbar"><i id="numBar" /></div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------------
// 04 WORKS：縦スクロールで、作品カードが横に流れる
// ------------------------------------------------------------------
export function Works() {
  return (
    <section className="sec pin works" id="works" data-cre="3" data-eng="3" data-name="WORKS" style={{ '--n': 4 } as CSSVars}>
      <div className="sticky">
        <p className="eyebrow pin-head" data-scramble="">04 — SELECTED WORKS</p>
        <div className="wnav">
          <button id="wPrev" aria-label="前の作品" data-cursor="PREV">←</button>
          <div className="wcount"><b id="wIdx">01</b> / <span id="wTotal">04</span></div>
          <button id="wNext" aria-label="次の作品" data-cursor="NEXT">→</button>
        </div>
        <div className="track" id="track">
          {works.map((w, i) => (
            <a key={w.title} href="#" className={w.dev ? 'wcard dev' : 'wcard'} data-m={w.mode}
              data-cursor={w.dev ? 'SOON' : 'VIEW'} style={w.gradient ? ({ '--g': w.gradient } as CSSVars) : undefined}>
              {w.svg
                ? <div className="thumb" dangerouslySetInnerHTML={{ __html: w.svg }} />
                : <div className="thumb">{/* eslint-disable-next-line @next/next/no-img-element -- YouTubeのサムネイルをそのまま表示する */}
                    {w.thumb && <img src={w.thumb} alt="" loading="lazy" />}</div>}
              <div className="big">{String(i + 1).padStart(2, '0')}</div>
              <div className="body">
                <div className="meta">{w.meta}</div>
                <h3 data-scramble="">{w.title}</h3>
                <div className="num">{w.num}{w.numNote && <small>{w.numNote}</small>}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------------
// 05 CONTACT
// ------------------------------------------------------------------
export function Contact() {
  return (
    <section className="sec contact" id="contact" data-cre="0" data-eng="1" data-name="CONTACT">
      <div className="inner">
        <p className="eyebrow" data-scramble="">05 — CONTACT</p>
        <h2 className="rv">LET&apos;S<br /><em>BUILD.</em></h2>
        <div className="ctas rv">
          <a href="#" className="btn primary" data-cursor="MAIL"><small>FOR RECRUITERS</small>採用・業務委託のご連絡</a>
          <a href="#" className="btn" data-cursor="MAIL"><small>FOR CLIENTS</small>MV・映像・仕組み化のご相談</a>
        </div>
      </div>
    </section>
  );
}
