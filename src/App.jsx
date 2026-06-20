import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  BedDouble,
  Brain,
  CircleDot,
  Lightbulb,
  MessageCircle,
  Minus,
  Moon,
  Plus,
  Radar,
  Send,
  Shield,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Sunrise,
  Volume2,
  Waves,
  Wind,
} from "lucide-react";

const featureModes = [
  {
    id: "sense",
    label: "感知",
    icon: Radar,
    title: "呼吸一慢，空间就知道",
    metric: "6.8 bpm",
    metricLabel: "入睡呼吸节律",
    copy:
      "The Pebble 安静地留意你的呼吸和翻身。你不用戴任何东西，也不用睡前打卡；它只判断你需要哪一种睡眠氛围。",
    details: ["不用佩戴设备", "呼吸变慢会被留意到", "夜里翻身也不打扰"],
  },
  {
    id: "handoff",
    label: "接管",
    icon: Lightbulb,
    title: "把睡前动作一次收起",
    metric: "0 taps",
    metricLabel: "睡前手动操作",
    copy:
      "当你慢慢要睡着时，灯光会往下暗，声景轻轻接上。关灯、找音乐、选声音这些事，就不用临睡前再想一遍。",
    details: ["灯光慢慢退下", "睡前状态自然接上", "不用喊它"],
  },
  {
    id: "field",
    label: "声场",
    icon: Shield,
    title: "用低频把世界推远一点",
    metric: "-23 dB",
    metricLabel: "半夜少被吵醒",
    copy:
      "声音从底部很轻地出来，像远处的风或海面。睡深以后，它会把声景铺厚一点，让楼上脚步和路边车流不那么突然。",
    details: ["睡深后轻轻加厚", "没有刺耳提示音", "突然的声音变远一点"],
  },
];

const scenes = [
  {
    id: "day",
    label: "日常",
    icon: CircleDot,
    title: "白天，它只是一枚安静的摆件",
    subtitle: "放在床头，不催你看屏幕，也不提醒你还有什么要设置。",
    roomLight: 82,
    halo: 18,
    mask: 8,
    status: "安静摆着",
  },
  {
    id: "sleep",
    label: "入睡",
    icon: Moon,
    title: "呼吸变慢后，灯光跟着退场",
    subtitle: "灯光慢慢暗下去，底部只留一点呼吸般的暖光和很轻的风声。",
    roomLight: 32,
    halo: 54,
    mask: 32,
    status: "准备入睡",
  },
  {
    id: "deep",
    label: "深睡",
    icon: Waves,
    title: "夜越深，边界越厚",
    subtitle: "夜里声景在低处铺开，把楼上脚步和窗外车流放远一点。",
    roomLight: 8,
    halo: 84,
    mask: 58,
    status: "夜里守着",
  },
];

const materials = [
  {
    name: "薰衣草灰白",
    value: "Lavender Grey-White",
    note: "带一点灰紫的冷静白，适合浅色床品和安静的北欧卧室。",
    swatch: "lavender",
  },
  {
    name: "温暖燕麦色",
    value: "Warm Oat",
    note: "像晒过的麦色，放在胡桃木床头会更暖。",
    swatch: "oat",
  },
  {
    name: "哑光素陶",
    value: "Matte ceramic",
    note: "接近手作陶土的雾白，表面留一点细细的颗粒感。",
    swatch: "ceramic",
  },
];

const specs = [
  { label: "零开孔", value: "声音从底部轻轻出来" },
  { label: "零屏幕", value: "床头少一点亮光" },
  { label: "零唤醒词", value: "用呼吸来开始" },
];

const companionPrompts = [
  {
    id: "upstairs",
    label: "楼上杂音",
    icon: Volume2,
    draft: "楼上有脚步声和拖椅子声，入睡前很容易烦。",
    reply:
      "好，今晚先把声音放低一点，像从床头柜下面慢慢铺开的风。等你睡沉些，我再把边界加厚，让楼上的脚步声听起来远一点、钝一点。",
    plan: "深谷微风",
    soundId: "breeze",
    shield: "Lv. 7",
    shieldLevel: 7,
    sensitivity: "72%",
    breathSensitivity: 72,
    light: "18 min",
  },
  {
    id: "traffic",
    label: "路边车流",
    icon: Waves,
    draft: "窗外车流不断，偶尔有急刹和鸣笛。",
    reply:
      "那今晚更适合一点海潮感。底声会厚一些，平时像远处的浪；遇到急刹或鸣笛时，我会短短托住一下，别让声音一下子把你拽醒。",
    plan: "潮汐之墙",
    soundId: "tidal",
    shield: "Lv. 8",
    shieldLevel: 8,
    sensitivity: "64%",
    breathSensitivity: 64,
    light: "12 min",
  },
  {
    id: "mind",
    label: "焦虑失眠",
    icon: Brain,
    draft: "脑子停不下来，一闭眼就想白天没处理完的事。",
    reply:
      "那今晚先不要把声音做得太厚。我们从很轻的雨声开始，让注意力有个地方落下。等呼吸稳下来，灯再慢慢暗下去。",
    plan: "幽林雨帘",
    soundId: "canopy",
    shield: "Lv. 5",
    shieldLevel: 5,
    sensitivity: "82%",
    breathSensitivity: 82,
    light: "24 min",
  },
  {
    id: "wabi",
    label: "宅寂风卧室",
    icon: BedDouble,
    draft: "卧室很安静，我只想要一点不打扰的夜间氛围。",
    reply:
      "那就只留一点点底声。你几乎不会注意到它，底部的光也只跟着呼吸轻轻亮一下。今晚让房间稳稳的就好。",
    plan: "低感守夜",
    soundId: "breeze",
    shield: "Lv. 3",
    shieldLevel: 3,
    sensitivity: "58%",
    breathSensitivity: 58,
    light: "8 min",
  },
];

const soundModes = [
  {
    id: "breeze",
    label: "深谷微风",
    sublabel: "Valley Breeze",
    icon: Wind,
    copy: "像窗外很远的风，轻、低、平稳，适合楼上偶尔的碎响。",
    hz: "65 Hz",
  },
  {
    id: "tidal",
    label: "潮汐之墙",
    sublabel: "Tidal Shield",
    icon: Waves,
    copy: "比微风厚一些，适合车流、鸣笛和窗外忽远忽近的声音。",
    hz: "74 Hz",
  },
  {
    id: "canopy",
    label: "幽林雨帘",
    sublabel: "Hidden Canopy",
    icon: Sunrise,
    copy: "细细的雨声，有一点自然颗粒感，适合心里还没放松的时候。",
    hz: "58 Hz",
  },
];

const soundModeById = Object.fromEntries(soundModes.map((mode) => [mode.id, mode]));

function createNoiseBuffer(context) {
  const length = context.sampleRate * 2;
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  let previous = 0;

  for (let index = 0; index < length; index += 1) {
    const white = Math.random() * 2 - 1;
    previous = previous * 0.82 + white * 0.18;
    data[index] = previous;
  }

  return buffer;
}

function createPebbleAudioEngine() {
  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextCtor) return null;

  const context = new AudioContextCtor();
  const master = context.createGain();
  const noise = context.createBufferSource();
  const noiseFilter = context.createBiquadFilter();
  const noiseGain = context.createGain();
  const subOscillator = context.createOscillator();
  const subGain = context.createGain();
  const ampLfo = context.createOscillator();
  const ampLfoGain = context.createGain();
  const filterLfo = context.createOscillator();
  const filterLfoGain = context.createGain();

  let targetVolume = 0.46;
  let stopped = false;

  noise.buffer = createNoiseBuffer(context);
  noise.loop = true;
  noiseFilter.type = "bandpass";
  noiseFilter.frequency.value = 560;
  noiseFilter.Q.value = 0.8;
  noiseGain.gain.value = 0.07;

  subOscillator.type = "sine";
  subOscillator.frequency.value = 65;
  subGain.gain.value = 0.02;

  ampLfo.type = "sine";
  ampLfo.frequency.value = 0.09;
  ampLfoGain.gain.value = 0.012;

  filterLfo.type = "sine";
  filterLfo.frequency.value = 0.05;
  filterLfoGain.gain.value = 120;

  master.gain.value = 0;

  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(master);
  subOscillator.connect(subGain);
  subGain.connect(master);
  ampLfo.connect(ampLfoGain);
  ampLfoGain.connect(noiseGain.gain);
  filterLfo.connect(filterLfoGain);
  filterLfoGain.connect(noiseFilter.frequency);
  master.connect(context.destination);

  noise.start();
  subOscillator.start();
  ampLfo.start();
  filterLfo.start();

  const setParam = (param, value, time = 0.06) => {
    param.setTargetAtTime(value, context.currentTime, time);
  };

  const update = (modeId, level) => {
    const strength = Math.max(1, Math.min(10, level)) / 10;
    const presets = {
      breeze: {
        ampDepth: 0.011,
        ampRate: 0.08,
        filterDepth: 115,
        filterFreq: 520,
        filterType: "bandpass",
        noiseLevel: 0.065 + strength * 0.014,
        q: 0.72,
        subFreq: 62,
        subLevel: 0.014 + strength * 0.006,
        volume: 0.42 + strength * 0.06,
      },
      tidal: {
        ampDepth: 0.02,
        ampRate: 0.052,
        filterDepth: 170,
        filterFreq: 340,
        filterType: "lowpass",
        noiseLevel: 0.085 + strength * 0.02,
        q: 0.95,
        subFreq: 74,
        subLevel: 0.02 + strength * 0.009,
        volume: 0.47 + strength * 0.07,
      },
      canopy: {
        ampDepth: 0.008,
        ampRate: 0.18,
        filterDepth: 240,
        filterFreq: 1280,
        filterType: "bandpass",
        noiseLevel: 0.052 + strength * 0.014,
        q: 0.58,
        subFreq: 58,
        subLevel: 0.01 + strength * 0.004,
        volume: 0.36 + strength * 0.06,
      },
    };
    const preset = presets[modeId] ?? presets.breeze;

    noiseFilter.type = preset.filterType;
    setParam(noiseFilter.frequency, preset.filterFreq);
    setParam(noiseFilter.Q, preset.q);
    setParam(noiseGain.gain, preset.noiseLevel);
    setParam(subOscillator.frequency, preset.subFreq);
    setParam(subGain.gain, preset.subLevel);
    setParam(ampLfo.frequency, preset.ampRate);
    setParam(ampLfoGain.gain, preset.ampDepth);
    setParam(filterLfoGain.gain, preset.filterDepth);
    targetVolume = preset.volume;
    setParam(master.gain, targetVolume, 0.12);
  };

  return {
    async start() {
      if (context.state === "suspended") {
        await context.resume();
      }
      setParam(master.gain, targetVolume, 0.1);
    },
    stop() {
      if (stopped) return;
      stopped = true;
      master.gain.cancelScheduledValues(context.currentTime);
      master.gain.setTargetAtTime(0, context.currentTime, 0.05);
      window.setTimeout(() => {
        try {
          noise.stop();
          subOscillator.stop();
          ampLfo.stop();
          filterLfo.stop();
          context.close();
        } catch {
          // The context may already be closed when the page hot-reloads.
        }
      }, 420);
    },
    update,
  };
}

function buildCompanionSolution(input) {
  const text = input.trim();
  const hasTraffic = /车|马路|路边|窗外|鸣笛|急刹|车流|高速|街道/.test(text);
  const hasUpstairs = /楼上|脚步|拖椅|地板|邻居|撞击|敲|装修|电梯/.test(text);
  const hasMind = /焦虑|失眠|睡不着|脑子|想事|压力|紧张|心事|烦/.test(text);
  const hasQuiet = /安静|氛围|轻一点|低音量|陪伴|放松|不吵|轻柔/.test(text);

  if (hasTraffic) {
    return {
      id: "custom-traffic",
      label: "你的描述",
      draft: text,
      reply:
        "听起来窗外今晚不太安静。那就用厚一点的海潮声，把车流放到更远的位置；如果突然有鸣笛或急刹，我会短短托住那一下，别让它把你惊醒。",
      plan: "潮汐之墙",
      soundId: "tidal",
      shield: "Lv. 8",
      shieldLevel: 8,
      sensitivity: hasMind ? "78%" : "66%",
      breathSensitivity: hasMind ? 78 : 66,
      light: "12 min",
    };
  }

  if (hasUpstairs) {
    return {
      id: "custom-upstairs",
      label: "你的描述",
      draft: text,
      reply:
        "楼上的动静最烦人，因为它总是从头顶落下来。今晚我会把风声放在更低的位置，先稳住房间；等你睡意上来，再把声音铺厚一点，让那些脚步和拖椅声没那么扎耳。",
      plan: "深谷微风",
      soundId: "breeze",
      shield: "Lv. 7",
      shieldLevel: 7,
      sensitivity: hasMind ? "80%" : "72%",
      breathSensitivity: hasMind ? 80 : 72,
      light: "18 min",
    };
  }

  if (hasMind) {
    return {
      id: "custom-mind",
      label: "你的描述",
      draft: text,
      reply:
        "如果脑子还停不下来，声音就别太用力。今晚先用细一点的雨声，把注意力慢慢带回来；等呼吸平下来，灯再暗，声音也再稍微稳一点。",
      plan: "幽林雨帘",
      soundId: "canopy",
      shield: "Lv. 5",
      shieldLevel: 5,
      sensitivity: "84%",
      breathSensitivity: 84,
      light: "24 min",
    };
  }

  if (hasQuiet) {
    return {
      id: "custom-quiet",
      label: "你的描述",
      draft: text,
      reply:
        "那就不多打扰你。今晚只留很轻的底声和一点点暖光，让房间更稳。如果半夜真的有声音闯进来，我再悄悄把边界加厚。",
      plan: "低感守夜",
      soundId: "breeze",
      shield: "Lv. 3",
      shieldLevel: 3,
      sensitivity: "60%",
      breathSensitivity: 60,
      light: "10 min",
    };
  }

  return {
    id: "custom-balanced",
    label: "你的描述",
    draft: text,
    reply:
      "我先给你一个稳妥的夜间设置：轻一点的风声，中等的安静边界，呼吸也会看得细一些。等你睡着后，如果外面突然吵起来，我再把声音稍微铺厚。",
    plan: "深谷微风",
    soundId: "breeze",
    shield: "Lv. 6",
    shieldLevel: 6,
    sensitivity: "76%",
    breathSensitivity: 76,
    light: "16 min",
  };
}

function App() {
  const [activeFeature, setActiveFeature] = useState(featureModes[0]);
  const [activeScene, setActiveScene] = useState(scenes[1]);
  const [activePrompt, setActivePrompt] = useState(companionPrompts[0]);
  const [activeSound, setActiveSound] = useState(soundModes[0]);
  const [shieldLevel, setShieldLevel] = useState(companionPrompts[0].shieldLevel);
  const [breathSensitivity, setBreathSensitivity] = useState(
    companionPrompts[0].breathSensitivity,
  );
  const [companionInput, setCompanionInput] = useState("");
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [audioStatus, setAudioStatus] = useState("idle");
  const audioEngineRef = useRef(null);
  const audioElementRef = useRef(null);
  const [noise, setNoise] = useState(68);

  const maskedNoise = useMemo(
    () => Math.max(9, noise - activeScene.mask),
    [activeScene.mask, noise],
  );

  const companionScore = useMemo(
    () => Math.min(98, Math.round(shieldLevel * 8 + breathSensitivity * 0.42)),
    [breathSensitivity, shieldLevel],
  );

  const applyCompanionSolution = (solution) => {
    setActivePrompt(solution);
    setActiveSound(soundModeById[solution.soundId] ?? soundModes[0]);
    setShieldLevel(solution.shieldLevel);
    setBreathSensitivity(solution.breathSensitivity);
  };

  const handleCompanionSubmit = (event) => {
    event.preventDefault();
    if (!companionInput.trim()) return;

    applyCompanionSolution(buildCompanionSolution(companionInput));
    setCompanionInput("");
  };

  const handleToggleAudio = async () => {
    if (audioEnabled) {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
      audioEngineRef.current?.stop();
      audioEngineRef.current = null;
      setAudioEnabled(false);
      setAudioStatus("idle");
      return;
    }

    const audioElement = audioElementRef.current;
    if (audioElement) {
      audioElement.volume = Math.min(0.86, 0.34 + shieldLevel * 0.045);
      try {
        setAudioStatus("loading");
        const playPromise = audioElement.play();
        if (playPromise?.then) {
          await Promise.race([
            playPromise,
            new Promise((_, reject) => {
              window.setTimeout(() => reject(new Error("audio-play-timeout")), 900);
            }),
          ]);
        }
        if (audioElement.paused) {
          throw new Error("audio-still-paused");
        }
        setAudioEnabled(true);
        setAudioStatus("playing");
        return;
      } catch {
        audioElement.pause();
      }
    }

    const engine = createPebbleAudioEngine();
    if (!engine) {
      setAudioEnabled(false);
      setAudioStatus("blocked");
      return;
    }

    audioEngineRef.current = engine;
    engine.update(activeSound.id, shieldLevel);
    try {
      setAudioStatus("loading");
      await engine.start();
      setAudioEnabled(true);
      setAudioStatus("playing");
    } catch {
      engine.stop();
      audioEngineRef.current = null;
      setAudioEnabled(false);
      setAudioStatus("blocked");
    }
  };

  useEffect(() => {
    if (!audioEnabled || !audioEngineRef.current) return;
    audioEngineRef.current.update(activeSound.id, shieldLevel);
  }, [activeSound.id, audioEnabled]);

  useEffect(() => {
    const audioElement = audioElementRef.current;
    if (!audioElement) return;
    audioElement.volume = Math.min(0.86, 0.34 + shieldLevel * 0.045);
  }, [shieldLevel]);

  useEffect(() => {
    const audioElement = audioElementRef.current;
    if (!audioEnabled || !audioElement) return;

    audioElement.load();
    audioElement.volume = Math.min(0.86, 0.34 + shieldLevel * 0.045);
    audioElement.play().catch(() => {
      setAudioEnabled(false);
      setAudioStatus("blocked");
    });
  }, [activeSound.id, audioEnabled]);

  useEffect(
    () => () => {
      audioElementRef.current?.pause();
      audioEngineRef.current?.stop();
    },
    [],
  );

  return (
    <div className="site-shell">
      <audio
        ref={audioElementRef}
        aria-label="The Pebble 声景演示播放器"
        className="pebble-audio-player visible"
        controls
        loop
        preload="auto"
        src={`/audio/${activeSound.id}.wav?v=4`}
      />
      <Hero
        audioEnabled={audioEnabled}
        audioStatus={audioStatus}
        onToggleAudio={handleToggleAudio}
      />
      <main>
        <section className="why-section" id="why">
          <div className="why-layout">
            <div className="why-lede">
              <p className="eyebrow">Why / 为什么需要它</p>
              <h2>
                <span className="headline-line">睡前最后的时光</span>
                <span className="headline-line">不该用来操作设备</span>
              </h2>
            </div>
          </div>
          <div className="why-points" aria-label="The Pebble value">
            <div>
              <span>01</span>
              <strong>告别屏幕</strong>
              <p>免去繁琐的手机设置，躺下即可，无需再多看一眼屏幕。</p>
            </div>
            <div>
              <span>02</span>
              <strong>推远噪音</strong>
              <p>无论楼上走动还是路边车流，都会被低频声景悄然抹平。</p>
            </div>
            <div>
              <span>03</span>
              <strong>零存在感</strong>
              <p>依循你的呼吸自动运转。不设按键，不求管理，懂事且隐形。</p>
            </div>
          </div>
        </section>

        <section className="form-section" id="form">
          <div className="section-heading">
            <p className="eyebrow">Form / 安静的形态</p>
            <h2>
              <span className="headline-line">像一枚鹅卵石待在床头</span>
              <span className="headline-line">不抢你的注意力</span>
            </h2>
          </div>

          <div className="form-grid">
            <div className="object-study" aria-label="The Pebble product form">
              <div className="plinth">
                <div className="pebble-model">
                  <span className="grain" />
                  <span className="breath-halo" />
                </div>
              </div>
              <div className="annotation annotation-top">非对称有机曲面</div>
              <div className="annotation annotation-right">表面零按键零网孔</div>
              <div className="annotation annotation-bottom">底部极窄悬浮声缝</div>
            </div>

            <div className="material-column">
              <p className="body-lede">
                The Pebble 把感知、声景和灯光联动藏在一件小摆件里。你不用学会使用它，只要把床头留给睡眠。
              </p>
              <div className="spec-row">
                {specs.map((item) => (
                  <div className="spec-card" key={item.label}>
                    <strong>{item.label}</strong>
                    <span>{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="swatch-row" aria-label="materials and colors">
                {materials.map((item) => (
                  <div
                    className={`swatch-item colorway-${item.swatch}`}
                    key={item.name}
                  >
                    <div className="colorway-preview" aria-hidden="true">
                      <span className="colorway-shadow" />
                      <span className="colorway-object">
                        <span className="colorway-grain" />
                        <span className="colorway-glow" />
                      </span>
                    </div>
                    <div className="colorway-copy">
                      <span className={`swatch swatch-${item.swatch}`} />
                      <strong>{item.name}</strong>
                      <small>{item.value}</small>
                      <p>{item.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="function-section" id="function">
          <div className="section-heading inverse">
            <p className="eyebrow">Function / 睡意悄悄发生</p>
            <h2>
              <span className="headline-line">它在安静里读懂睡意</span>
              <span className="headline-line">只给你一点点回应</span>
            </h2>
          </div>

          <div className="function-tabs" role="tablist" aria-label="Pebble features">
            {featureModes.map((mode) => {
              const Icon = mode.icon;
              const selected = activeFeature.id === mode.id;
              return (
                <button
                  aria-selected={selected}
                  className={selected ? "tab-button active" : "tab-button"}
                  key={mode.id}
                  onClick={() => setActiveFeature(mode)}
                  role="tab"
                  type="button"
                >
                  <Icon size={18} aria-hidden="true" />
                  <span>{mode.label}</span>
                </button>
              );
            })}
          </div>

          <div className={`function-stage feature-${activeFeature.id}`}>
            <div className="feature-copy">
              <span>{activeFeature.metricLabel}</span>
              <strong>{activeFeature.metric}</strong>
              <h3>{activeFeature.title}</h3>
              <p>{activeFeature.copy}</p>
              <div className="detail-list">
                {activeFeature.details.map((detail) => (
                  <span key={detail}>{detail}</span>
                ))}
              </div>
            </div>

            <div className="sleep-visual" aria-label="sleep signal visualization">
              <div className="radar-field">
                <span className="ring ring-one" />
                <span className="ring ring-two" />
                <span className="ring ring-three" />
                <div className="mini-pebble">
                  <span />
                </div>
              </div>
              <div className="wave-bank" aria-hidden="true">
                {Array.from({ length: 18 }).map((_, index) => (
                  <span
                    key={index}
                    style={{ "--h": `${24 + (index % 7) * 9}px`, "--i": index }}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <CompanionSection
          activePrompt={activePrompt}
          activeSound={activeSound}
          audioEnabled={audioEnabled}
          audioStatus={audioStatus}
          breathSensitivity={breathSensitivity}
          companionInput={companionInput}
          companionScore={companionScore}
          onCompanionSubmit={handleCompanionSubmit}
          onSelectPrompt={applyCompanionSolution}
          onToggleAudio={handleToggleAudio}
          setActiveSound={setActiveSound}
          setCompanionInput={setCompanionInput}
          setBreathSensitivity={setBreathSensitivity}
          setShieldLevel={setShieldLevel}
          shieldLevel={shieldLevel}
        />

        <section className="scene-section" id="scene">
          <div className="section-heading">
            <p className="eyebrow">Scene / 放在床头的一晚</p>
            <h2>
              <span className="headline-line">白天是摆件</span>
              <span className="headline-line">夜里替你守住睡眠</span>
            </h2>
          </div>

          <div
            className={`bedroom-stage scene-${activeScene.id}`}
            style={{
              "--room-light": `${activeScene.roomLight}%`,
              "--halo": `${activeScene.halo}%`,
              "--noise": `${noise}%`,
              "--masked-noise": `${maskedNoise}%`,
            }}
          >
            <div className="scene-controls">
              <div className="scene-mode-row" role="tablist" aria-label="sleep scenes">
                {scenes.map((scene) => {
                  const Icon = scene.icon;
                  const selected = activeScene.id === scene.id;
                  return (
                    <button
                      aria-selected={selected}
                      className={selected ? "scene-button active" : "scene-button"}
                      key={scene.id}
                      onClick={() => setActiveScene(scene)}
                      role="tab"
                      type="button"
                    >
                      <Icon size={18} aria-hidden="true" />
                      <span>{scene.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="noise-control">
                <label htmlFor="noiseRange">
                  <Volume2 size={18} aria-hidden="true" />
                  <span>外界噪声</span>
                  <strong>{noise} dB</strong>
                </label>
                <input
                  id="noiseRange"
                  max="88"
                  min="28"
                  onChange={(event) => setNoise(Number(event.target.value))}
                  type="range"
                  value={noise}
                />
              </div>
            </div>

            <div className="room-visual">
              <img
                alt="The Pebble on a walnut bedside table in a warm minimalist bedroom"
                src="/images/pebble-hero.png"
              />
              <span className="night-overlay" />
              <span className="floor-halo" />
              <span className="acoustic-dome" />
              <span className="noise-source noise-one" />
              <span className="noise-source noise-two" />
              <span className="noise-source noise-three" />
            </div>

            <div className="scene-readout">
              <span>{activeScene.status}</span>
              <h3>{activeScene.title}</h3>
              <p>{activeScene.subtitle}</p>
              <div className="meter-grid">
                <Meter label="房间亮度" value={activeScene.roomLight} />
                <Meter label="底部光晕" value={activeScene.halo} />
                <Meter label="听到的噪声" value={maskedNoise} />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="page-footer">
        <span>The Pebble</span>
        <p>愿你今晚睡得踏实。</p>
      </footer>
    </div>
  );
}

function Hero({ audioEnabled, audioStatus, onToggleAudio }) {
  return (
    <header className="hero">
      <img
        alt="The Pebble smart sleep art object glowing softly on a bedside table"
        className="hero-image"
        src="/images/pebble-hero.png"
      />
      <div className="hero-shade" />
      <nav className="top-nav" aria-label="Primary">
        <a href="#top" className="brand">
          <Moon size={18} aria-hidden="true" />
          <span>The Pebble</span>
        </a>
        <div>
          <a href="#why">为什么</a>
          <a href="#form">形态</a>
          <a href="#function">功能</a>
          <a href="#companion">伴侣</a>
          <a href="#scene">场景</a>
        </div>
      </nav>

      <div className="hero-content" id="top">
        <p className="eyebrow">智能睡眠艺术摆件</p>
        <h1>The Pebble</h1>
        <p>
          The Pebble 像一件温润的素陶摆件。它安静地留意你的呼吸，用柔和的声景把深夜的喧嚣隔在远处，给你留出一段干净、只属于自己的睡前时间。
        </p>
        <div className="hero-actions">
          <a className="primary-link" href="#why">
            <BedDouble size={18} aria-hidden="true" />
            <span>为什么需要它</span>
          </a>
          <a className="ghost-link" href="#function">
            <Wind size={18} aria-hidden="true" />
            <span>听听声景</span>
          </a>
          <button className="ghost-link hero-sound-button" onClick={onToggleAudio} type="button">
            <Volume2 size={18} aria-hidden="true" />
            <span>
              {audioEnabled
                ? "暂停声景"
                : audioStatus === "blocked"
                  ? "手动播放"
                  : "试听声景"}
            </span>
          </button>
        </div>
      </div>

      <div className="hero-meta" aria-label="product principles">
        <span>静默感知</span>
        <span>柔和声景</span>
        <span>守护一夜好眠</span>
      </div>
    </header>
  );
}

function CompanionSection({
  activePrompt,
  activeSound,
  audioEnabled,
  audioStatus,
  breathSensitivity,
  companionInput,
  companionScore,
  onCompanionSubmit,
  onSelectPrompt,
  onToggleAudio,
  setActiveSound,
  setCompanionInput,
  setBreathSensitivity,
  setShieldLevel,
  shieldLevel,
}) {
  return (
    <section className="companion-section" id="companion">
      <div className="section-heading inverse">
        <p className="eyebrow">Pebble Chat / 智能睡眠伴侣</p>
        <h2>
          <span className="headline-line">你说出今晚睡不好的原因</span>
          <span className="headline-line">它帮你把房间调柔一点</span>
        </h2>
      </div>

      <div
        className="companion-workspace"
        style={{
          "--shield-level": shieldLevel,
          "--shield-opacity": Math.min(0.92, 0.38 + shieldLevel * 0.052).toFixed(2),
          "--breath-sensitivity": breathSensitivity,
          "--scope-scale": (0.58 + breathSensitivity * 0.004).toFixed(2),
        }}
      >
        <div className="ai-console">
          <aside className="ai-sidebar">
            <div className="companion-badge">
              <Sparkles size={22} aria-hidden="true" />
            </div>
            <p className="panel-kicker">Night care / quietly tuned</p>
            <h3>The Pebble 睡眠伴侣</h3>
            <p>
              告诉它今晚吵在哪里，或者心里是不是还绷着。它会给你一套很具体的安排：听哪种声景、声音铺多厚、灯多久慢下来。
            </p>

            <div className="quick-prompts">
              <span>也可以先点一个常见情况</span>
              {companionPrompts.map((prompt) => {
                const Icon = prompt.icon;
                const selected = activePrompt.id === prompt.id;
                return (
                  <button
                    aria-label={prompt.label}
                    className={selected ? "prompt-chip active" : "prompt-chip"}
                    key={prompt.id}
                    onClick={() => onSelectPrompt(prompt)}
                    type="button"
                  >
                    <Icon size={18} aria-hidden="true" />
                    <span>{prompt.label}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="chat-panel">
            <div className="chat-orbit">
              <MessageCircle size={22} aria-hidden="true" />
            </div>
            <div className="chat-bubble user-bubble">
              <span>你今晚遇到的事</span>
              <p>{activePrompt.draft}</p>
            </div>
            <div className="chat-bubble pebble-bubble">
              <span>The Pebble</span>
              <p>{activePrompt.reply}</p>
            </div>
            <div className="ai-plan-grid">
              <div>
                <span>今晚声景</span>
                <strong>{activePrompt.plan}</strong>
              </div>
              <div>
                <span>安静厚度</span>
                <strong>{activePrompt.shield}</strong>
              </div>
              <div>
                <span>呼吸照看</span>
                <strong>{activePrompt.sensitivity}</strong>
              </div>
              <div>
                <span>灯光退场</span>
                <strong>{activePrompt.light}</strong>
              </div>
            </div>
            <form className="chat-input" onSubmit={onCompanionSubmit}>
              <input
                aria-label="输入睡眠环境描述"
                onChange={(event) => setCompanionInput(event.target.value)}
                placeholder="比如：楼上走来走去，我有点烦，想快点睡..."
                type="text"
                value={companionInput}
              />
              <button type="submit" aria-label="send sleep context">
                <Send size={18} aria-hidden="true" />
              </button>
            </form>
          </div>
        </div>

        <div className="app-mode-panel">
          <div className="phone-shell">
            <div className="phone-topbar">
              <div>
                <span>Pebble App</span>
                <strong>今晚怎么调</strong>
              </div>
              <Smartphone size={22} aria-hidden="true" />
            </div>

            <div className="mode-summary">
              <div>
                <small>适配度</small>
                <strong>{companionScore}%</strong>
              </div>
              <p>
                现在按「{activePrompt.label}」调到 {activeSound.label}，安静厚度 Lv. {shieldLevel}。
              </p>
            </div>

            <button
              className={audioEnabled ? "audio-demo-button active" : "audio-demo-button"}
              onClick={onToggleAudio}
              type="button"
            >
              <Volume2 size={19} aria-hidden="true" />
              <span>
                {audioEnabled
                  ? "暂停 The Pebble 声景"
                  : audioStatus === "blocked"
                    ? "右下角可以手动播放"
                    : "听听现在的声景"}
              </span>
            </button>

            <div className="phone-control-group">
              <span className="panel-kicker">Step 01 / 先选一种声音</span>
              <div className="sound-mode-list">
                {soundModes.map((mode) => {
                  const Icon = mode.icon;
                  const selected = activeSound.id === mode.id;
                  return (
                    <button
                      aria-label={mode.label}
                      className={selected ? "sound-mode active" : "sound-mode"}
                      key={mode.id}
                      onClick={() => setActiveSound(mode)}
                      type="button"
                    >
                      <Icon size={22} aria-hidden="true" />
                      <span>
                        <strong>{mode.label}</strong>
                        <small>{mode.sublabel}</small>
                        <em>{mode.copy}</em>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="app-slider-group">
              <div className="slider-label">
                <SlidersHorizontal size={18} aria-hidden="true" />
                <span>安静厚度</span>
                <strong>Lv. {shieldLevel}</strong>
              </div>
              <div className="slider-row">
                <button
                  aria-label="降低安静厚度"
                  onClick={() => setShieldLevel((level) => Math.max(1, level - 1))}
                  type="button"
                >
                  <Minus size={16} aria-hidden="true" />
                </button>
                <input
                  aria-label="安静厚度"
                  max="10"
                  min="1"
                  onChange={(event) => setShieldLevel(Number(event.target.value))}
                  type="range"
                  value={shieldLevel}
                />
                <button
                  aria-label="提高安静厚度"
                  onClick={() => setShieldLevel((level) => Math.min(10, level + 1))}
                  type="button"
                >
                  <Plus size={16} aria-hidden="true" />
                </button>
              </div>
              <div className="scale-labels">
                <span>薄</span>
                <span>厚</span>
              </div>
            </div>

            <div className="app-slider-group">
              <div className="slider-label">
                <Radar size={18} aria-hidden="true" />
                <span>呼吸照看细一点</span>
                <strong>{breathSensitivity}%</strong>
              </div>
              <div className="slider-row">
                <button
                  aria-label="降低呼吸敏感度"
                  onClick={() =>
                    setBreathSensitivity((value) => Math.max(35, value - 5))
                  }
                  type="button"
                >
                  <Minus size={16} aria-hidden="true" />
                </button>
                <input
                  aria-label="呼吸敏感度"
                  max="95"
                  min="35"
                  onChange={(event) => setBreathSensitivity(Number(event.target.value))}
                  type="range"
                  value={breathSensitivity}
                />
                <button
                  aria-label="提高呼吸敏感度"
                  onClick={() =>
                    setBreathSensitivity((value) => Math.min(95, value + 5))
                  }
                  type="button"
                >
                  <Plus size={16} aria-hidden="true" />
                </button>
              </div>
              <div className="scale-labels">
                <span>稳一点</span>
                <span>灵一点</span>
              </div>
            </div>

            <div className="live-scope">
              <div className="scope-header">
                <span>{activeSound.hz}</span>
                <strong>{activeSound.sublabel}</strong>
              </div>
              <div className="scope-wave" aria-hidden="true">
                {Array.from({ length: 26 }).map((_, index) => (
                  <span
                    key={index}
                    style={{ "--h": `${18 + (index % 8) * 5}px`, "--i": index }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Meter({ label, value }) {
  return (
    <div className="meter">
      <span>
        <small>{label}</small>
        <strong>{value}%</strong>
      </span>
      <i style={{ width: `${value}%` }} />
    </div>
  );
}

export default App;
