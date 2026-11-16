// GPU（画像処理用のチップ）で動く小さなプログラム（シェーダー）。GLSL という言語で書く。

/**
 * 粒の位置・大きさ・色を決める。
 * 6つの形（shapes.ts）の座標を持っておき、uFrom → uTo の形へ uMix（0〜1）の割合で変身させる。
 */
export const particleVertex = /* glsl */ `
  attribute vec3 aS1, aS2, aS3, aS4, aS5; attribute float aRand;
  uniform float uTime, uFrom, uTo, uMix, uIntro, uSize, uPixel, uCre; uniform vec3 uMouse;
  varying vec3 vColor; varying float vAlpha;

  vec3 sphereWave(vec3 q){
    // 球の表面が、音楽に合わせるように波打つ。輪はゆっくり回る
    if (length(q) < 1.4){
      float w = sin(q.x*3.1 + uTime*1.7) * sin(q.y*3.7 - uTime*1.3) * sin(q.z*2.9 + uTime*.9);
      return q * (1. + .14*w);
    }
    float a = uTime * .18;
    return vec3(cos(a)*q.x - sin(a)*q.z, q.y, sin(a)*q.x + cos(a)*q.z);
  }
  vec3 shapeOf(float i){ if(i<.5) return sphereWave(position); if(i<1.5) return aS1; if(i<2.5) return aS2; if(i<3.5) return aS3; if(i<4.5) return aS4; return aS5; }
  vec3 colorOf(float i, float r){
    if(i<.5) return mix(vec3(1.,.42,.82), vec3(.62,.45,1.), r);
    if(i<1.5) return mix(vec3(.3,1.,.7), vec3(.25,.75,1.), r);
    if(i<2.5) return mix(vec3(.35,.95,1.), vec3(1.,.4,.85), r);
    vec3 purple = mix(vec3(.72,.45,1.), vec3(1.,.45,.82), r);   // クリエイティブのときは、枠や輪も紫に
    if(i<3.5) return mix(mix(vec3(.55,.5,1.), vec3(.3,.9,.9), r), purple, uCre);
    if(i<4.5) return mix(mix(vec3(1.,.4,.85), vec3(.35,.95,1.), r), purple, uCre);
    return mix(vec3(.72,.45,1.), vec3(1.,.45,.82), r);   // 105K：紫〜ピンク
  }
  // 形ごとの明るさ（文字の形は、光りすぎて読めなくならないように暗めに）
  float brightOf(float i){ if(i<.5) return 1.; if(i<1.5) return .6; if(i<2.5) return .38; if(i<3.5) return .55; if(i<4.5) return .32; return .4; }
  vec3 dir(float r){ return normalize(vec3(sin(r*91.7), cos(r*57.3), sin(r*13.1+1.))); }
  float hash(float n){ return fract(sin(n)*43758.5453); }

  void main(){
    float d = clamp(uMix*1.5 - aRand*.5, 0., 1.);   // 粒ごとに少しずつ遅れて変身する
    float t = d*d*(3.-2.*d);
    float burst = sin(t*3.14159);                    // 変身の途中で、いったん外へはじける
    vec3 p = mix(shapeOf(uFrom), shapeOf(uTo), t);
    // 輪の形のときは、ゆっくり回す
    float spin = uTime*.15*(1.+aRand);
    vec3 ring = vec3(cos(spin)*p.x - sin(spin)*p.y, sin(spin)*p.x + cos(spin)*p.y, p.z);
    p = mix(p, ring, (uTo > 3.5 && uTo < 4.5 ? t : 0.) + (uFrom > 3.5 && uFrom < 4.5 ? 1.-t : 0.));
    p += dir(aRand) * burst * 1.1;
    p.x += step(.96, hash(aRand*999. + floor(uTime*24.))) * burst * .5;
    p += .025*vec3(sin(uTime*1.3+aRand*40.), cos(uTime+aRand*30.), sin(uTime*.7+aRand*20.));
    // オープニング：遠くに散らばった粒が集まってくる
    vec3 scatter = dir(aRand*3.7) * (6. + aRand*6.);
    float it = smoothstep(0., 1., clamp(uIntro*1.4 - aRand*.4, 0., 1.));
    p = mix(scatter, p, it);

    vec4 world = modelMatrix * vec4(p, 1.);
    vec2 away = world.xy - uMouse.xy;                // マウスの近くの粒は、よけるように押し出される
    world.xy += normalize(away + 1e-4) * smoothstep(.9, 0., length(away)) * .45;
    vec4 view = viewMatrix * world;
    gl_Position = projectionMatrix * view;
    gl_PointSize = uSize * uPixel * (.35 + aRand*.75) / -view.z;
    vColor = mix(colorOf(uFrom, aRand), colorOf(uTo, aRand), t);
    vAlpha = (.8 + .25*sin(uTime*2. + aRand*60.)) * mix(brightOf(uFrom), brightOf(uTo), t) * it;
  }`;

/** 粒1つを、ふちがぼやけた丸として塗る */
export const particleFragment = /* glsl */ `
  varying vec3 vColor; varying float vAlpha;
  void main(){
    float a = smoothstep(.5, .0, length(gl_PointCoord - .5));
    gl_FragColor = vec4(vColor, a*a*vAlpha);
  }`;

/** 画面全体の仕上げ：色のずれ（色収差）と、強いときだけ横じまの帯がずれるノイズ */
export const rgbShiftShader = {
  uniforms: { tDiffuse: { value: null }, uAmount: { value: 0.0015 }, uTime: { value: 0 } },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse; uniform float uAmount, uTime; varying vec2 vUv;
    float hash(float n){ return fract(sin(n)*43758.5453); }
    void main(){
      vec2 uv = vUv, c = uv - .5;
      float band = floor(uv.y*36.) + floor(uTime*28.);
      uv.x += step(1. - uAmount*9., hash(band)) * (hash(band+7.)-.5) * uAmount * 8.;
      float a = uAmount * (.4 + length(c)*1.6);
      vec4 col = texture2D(tDiffuse, uv);
      col.r = texture2D(tDiffuse, uv + c*a).r;
      col.b = texture2D(tDiffuse, uv - c*a).b;
      gl_FragColor = col;
    }`,
};
