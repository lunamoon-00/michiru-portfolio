// 画面全体に重ねる部品：3Dの粒を描くキャンバス、背景、HUD（計器ふうの飾り）、
// カーソル、作品の詳しい説明、切り替えの演出、オープニング。
// ここでは「入れ物」だけを作り、動かすのは lib/experience.js の役目。

export function Backdrop() {
  return (
    <>
      <canvas id="gl" aria-hidden="true" />
      <div className="gridlines" />
      <div className="nebula" />
      <div id="labels" />
      <div className="scanlines" />
      <div className="flash" />
    </>
  );
}

const MARQUEE = 'MICHIRU // AI CREATIVE × AI ENGINEERING // CREATE · SYSTEMIZE // ';

export function Hud() {
  return (
    <div className="hud">
      <i className="c tl" /><i className="c tr" /><i className="c bl" /><i className="c br" />
      <div className="progress"><i id="prog" /></div>
      <div className="marquee" aria-hidden="true"><span>{MARQUEE.repeat(2)}</span></div>
      <div className="row l" aria-hidden="true">
        <span id="hud-sec">01 / HERO</span>
        <span className="opt" id="hud-mode" style={{ color: 'var(--accent)' }}>MODE: ENGINEERING</span>
        <span className="opt" id="hud-xy">X:0000 Y:0000</span>
      </div>
      <div className="row r">
        <button className="snd" id="snd" data-cursor="SOUND">SOUND OFF</button>
        <span className="opt" id="hud-fps" aria-hidden="true">-- FPS</span>
        <span className="opt" id="hud-time" aria-hidden="true">00:00:00</span>
        <span className="live" aria-hidden="true">SYS ONLINE</span>
      </div>
    </div>
  );
}

export function Cursor() {
  return (
    <>
      <div className="cur cur-ring" id="curRing"><div className="cur-label" id="curLabel">OPEN</div></div>
      <div className="cur cur-dot" id="curDot" />
    </>
  );
}

/** 作品を押したときに開く、詳しい説明の入れ物（中身はスクリプトが差し込む） */
export function CaseDialog() {
  return (
    <div id="case" role="dialog" aria-modal="true" aria-label="作品の詳細">
      <button className="close" id="caseClose" data-cursor="CLOSE">× CLOSE</button>
      <div className="wrap" id="caseBody" />
    </div>
  );
}

/** モード切替・作品を開くときに、画面を横じまで覆う演出 */
export function Transition() {
  return (
    <div id="tx">
      <div className="msg"><span id="txSub">CASE STUDY</span><b id="txTitle">—</b><span id="txFoot">COMING SOON</span></div>
    </div>
  );
}

export function Intro() {
  return (
    <div id="intro" aria-hidden="true">
      <div className="half top" /><div className="half bottom" />
      <div className="scan" />
      <div className="center">
        <div id="count">LOADING <b>0</b>%</div>
        <div className="bar"><i id="barfill" /></div>
        <div className="glitch" data-text="MICHIRU">MICHIRU</div>
        <div className="tag">CREATE · SYSTEMIZE</div>
      </div>
      <div className="skip">CLICK TO SKIP</div>
    </div>
  );
}
