import { useId, type ReactNode } from "react";

const OUTER = "M26 6H214A20 20 0 0 1 234 26V306A20 20 0 0 1 214 326H26A20 20 0 0 1 6 306V26A20 20 0 0 1 26 6Z";
const INNER = "M28 13H212A15 15 0 0 1 227 28V304A15 15 0 0 1 212 319H28A15 15 0 0 1 13 304V28A15 15 0 0 1 28 13Z";
const SPARK = "M0 -6l1.6 4.4 4.4 1.6-4.4 1.6-1.6 4.4-1.6-4.4-4.4-1.6 4.4-1.6z";
const DISPLAY = "'Baloo 2', 'Be Vietnam Pro', sans-serif";

const RAYS = Array.from({ length: 18 }, (_, k) => {
  const a = (k * 20 * Math.PI) / 180;
  const b = ((k * 20 + 9) * Math.PI) / 180;
  const p = (t: number) => `${(120 + 320 * Math.cos(t)).toFixed(1)} ${(166 + 320 * Math.sin(t)).toFixed(1)}`;
  return `M120 166L${p(a)}L${p(b)}Z`;
}).join("");

const THEME = {
  truth: {
    edge: "#2b64cc",
    ink: "#1c3477",
    top: "#dcedff",
    bottom: "#8cc0fb",
    cloud: "#6aa4f2",
    haze: "#bfdcff",
    panel: "#fffaf2",
    icon: "#3f8cff",
  },
  dare: {
    edge: "#e04d78",
    ink: "#a3173f",
    top: "#ffe3ea",
    bottom: "#ffa2bc",
    cloud: "#ff83a6",
    haze: "#ffc7d6",
    panel: "#fffaf2",
    icon: "#ffc83d",
  },
} as const;

type Face = "back" | keyof typeof THEME;

function Spark({ x, y, s = 1, fill = "#fff", opacity = 1 }: { x: number; y: number; s?: number; fill?: string; opacity?: number }) {
  return <path d={SPARK} transform={`translate(${x} ${y}) scale(${s})`} fill={fill} opacity={opacity} />;
}

function Back({ id }: { id: string }) {
  return (
    <>
      <defs>
        <radialGradient id={`bg${id}`} cx="120" cy="166" r="190" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#9c6cf6" />
          <stop offset="1" stopColor="#5a2cc0" />
        </radialGradient>
        <linearGradient id={`truth${id}`} x1="0" y1="118" x2="0" y2="156" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#a9e1ff" />
          <stop offset="1" stopColor="#3f86ff" />
        </linearGradient>
        <linearGradient id={`dare${id}`} x1="0" y1="174" x2="0" y2="216" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffb3c8" />
          <stop offset="1" stopColor="#ff3f78" />
        </linearGradient>
      </defs>
      <path d={OUTER} fill="#2e1566" opacity="0.28" transform="translate(0 5)" />
      <path d={OUTER} fill="#3b1c86" />
      <path d={INNER} fill={`url(#bg${id})`} />
      <g clipPath={`url(#clip${id})`}>
        <path d={RAYS} fill="#fff" opacity="0.07" />
      </g>
      <path d={INNER} fill="none" stroke="#c7aaff" strokeOpacity="0.7" strokeWidth="1.5" />

      <g fill="#ffd23f" stroke="#7a4a00" strokeWidth="2" strokeLinejoin="round">
        <path d="M98 108L94 84L108 96L120 78L132 96L146 84L142 108Z" />
        <rect x="97" y="106" width="46" height="8" rx="3" />
      </g>
      <circle cx="120" cy="76" r="3.4" fill="#ff6b98" stroke="#7a4a00" strokeWidth="1.5" />
      <circle cx="93" cy="82" r="2.6" fill="#7cc8ff" stroke="#7a4a00" strokeWidth="1.3" />
      <circle cx="147" cy="82" r="2.6" fill="#7cc8ff" stroke="#7a4a00" strokeWidth="1.3" />

      <g fontFamily={DISPLAY} fontWeight="800" textAnchor="middle" paintOrder="stroke" strokeLinejoin="round">
        <text x="120" y="153" fontSize="44" fill={`url(#truth${id})`} stroke="#1a2668" strokeWidth="7">
          TRUTH
        </text>
        <rect x="104" y="158" width="32" height="18" rx="9" fill="#fff" stroke="#3b1c86" strokeWidth="2.5" />
        <text x="120" y="172" fontSize="14" fill="#3b1c86">
          OR
        </text>
        <text x="120" y="214" fontSize="48" fill={`url(#dare${id})`} stroke="#5a0f30" strokeWidth="7">
          DARE
        </text>
      </g>
      <path d="M84 232Q120 220 158 230" fill="none" stroke="#ffd23f" strokeWidth="4" strokeLinecap="round" />
      <path d="M166 224l8-5M170 232l9-1" stroke="#ffd23f" strokeWidth="3" strokeLinecap="round" />
      <path d="M72 96l-8-6M68 108l-10-1" stroke="#ffd23f" strokeWidth="3" strokeLinecap="round" />

      <Spark x={58} y={66} s={1.1} fill="#ffb3d0" />
      <Spark x={188} y={78} s={1.5} fill="#ffd23f" />
      <Spark x={200} y={128} s={0.9} fill="#fff" opacity={0.85} />
      <Spark x={46} y={180} s={1.4} fill="#ffd23f" />
      <Spark x={194} y={246} s={1.1} fill="#ffb3d0" />
      <Spark x={64} y={262} s={1} fill="#fff" opacity={0.8} />
      <Spark x={150} y={286} s={0.8} fill="#ffb3d0" />
    </>
  );
}

function Megaphone({ x, y, flip, ink, body }: { x: number; y: number; flip: boolean; ink: string; body: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${flip ? 24 : -24}) scale(${flip ? -1 : 1} 1)`}>
      <g stroke={ink} strokeWidth="2.2" strokeLinejoin="round">
        <rect x="-14" y="-6" width="10" height="13" rx="3" fill="#fff" />
        <path d="M-10 6L-7 17H-2L-4 6Z" fill="#fff" />
        <path d="M-5 -7L18 -18V19L-5 8Z" fill={body} />
        <ellipse cx="18" cy="0.5" rx="4" ry="18.5" fill="#fff" />
      </g>
      <g stroke="#ffc83d" strokeWidth="2.6" strokeLinecap="round">
        <path d="M28 -14l7-5M30 1h9M28 15l7 5" />
      </g>
    </g>
  );
}

function Front({ id, side }: { id: string; side: keyof typeof THEME }) {
  const c = THEME[side];
  const truth = side === "truth";
  return (
    <>
      <defs>
        <linearGradient id={`bg${id}`} x1="0" y1="13" x2="0" y2="319" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={c.top} />
          <stop offset="1" stopColor={c.bottom} />
        </linearGradient>
      </defs>
      <path d={OUTER} fill={c.ink} opacity="0.22" transform="translate(0 5)" />
      <path d={OUTER} fill={c.edge} />
      <path d={INNER} fill={`url(#bg${id})`} />
      <g clipPath={`url(#clip${id})`}>
        <g fill="#fff" opacity="0.4">
          <circle cx="30" cy="40" r="30" />
          <circle cx="66" cy="22" r="22" />
          <circle cx="206" cy="30" r="28" />
          <circle cx="176" cy="18" r="18" />
          <circle cx="22" cy="150" r="20" />
          <circle cx="222" cy="170" r="24" />
        </g>
        <g fill={c.haze}>
          <circle cx="20" cy="292" r="26" />
          <circle cx="70" cy="300" r="24" />
          <circle cx="124" cy="306" r="26" />
          <circle cx="178" cy="298" r="24" />
          <circle cx="226" cy="290" r="26" />
        </g>
        <g fill={c.cloud}>
          <circle cx="8" cy="318" r="24" />
          <circle cx="52" cy="326" r="24" />
          <circle cx="100" cy="330" r="22" />
          <circle cx="150" cy="328" r="24" />
          <circle cx="198" cy="322" r="22" />
          <circle cx="236" cy="314" r="22" />
        </g>
      </g>
      <path d={INNER} fill="none" stroke="#fff" strokeOpacity="0.75" strokeWidth="1.5" />

      <path d="M28 120H212A12 12 0 0 1 224 132V272A12 12 0 0 1 212 284H28A12 12 0 0 1 16 272V132A12 12 0 0 1 28 120Z" fill={c.ink} opacity="0.12" transform="translate(0 3)" />
      <path d="M30 118H210A12 12 0 0 1 222 130V270A12 12 0 0 1 210 282H30A12 12 0 0 1 18 270V130A12 12 0 0 1 30 118Z" fill={c.panel} />

      <path
        d="M58 58H182A24 24 0 0 1 182 106H86L70 116L72 105A24 24 0 0 1 58 58Z"
        fill={c.ink}
        opacity="0.18"
        transform="translate(0 4)"
      />
      <path
        d="M58 58H182A24 24 0 0 1 182 106H86L70 116L72 105A24 24 0 0 1 58 58Z"
        fill="#fff"
        stroke={c.ink}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <text
        x="120"
        y="96"
        textAnchor="middle"
        fontFamily={DISPLAY}
        fontWeight="800"
        fontSize="36"
        letterSpacing="1"
        fill={c.ink}
      >
        {truth ? "TRUTH" : "DARE"}
      </text>

      {truth ? (
        <text
          x="122"
          y="58"
          textAnchor="middle"
          fontFamily={DISPLAY}
          fontWeight="800"
          fontSize="50"
          fill={c.icon}
          stroke={c.ink}
          strokeWidth="3.2"
          paintOrder="stroke"
          strokeLinejoin="round"
        >
          ?
        </text>
      ) : (
        <path
          d="M128 16L104 44H118L111 64L138 34H124L132 16Z"
          fill={c.icon}
          stroke={c.ink}
          strokeWidth="2.6"
          strokeLinejoin="round"
        />
      )}
      <g stroke={truth ? "#ffb02e" : "#e04d78"} strokeWidth="3" strokeLinecap="round">
        <path d="M54 42l6 8M66 34l3 9M44 54l8 4" />
      </g>

      <Spark x={34} y={30} s={0.9} />
      <Spark x={196} y={44} s={1.3} fill="#ffd23f" />
      <Spark x={210} y={86} s={0.8} />
      <Spark x={30} y={98} s={0.8} fill={truth ? "#fff" : "#ffd23f"} />
      {truth ? <Spark x={206} y={302} s={1.4} /> : <Spark x={40} y={300} s={1.3} fill="#ffd23f" />}
      <Megaphone x={truth ? 38 : 202} y={300} flip={!truth} ink={c.ink} body={truth ? c.icon : "#ffc83d"} />
    </>
  );
}

export function CardArt({
  face,
  shine = false,
  children,
}: {
  face: Face;
  shine?: boolean;
  children?: ReactNode;
}) {
  const id = useId().replace(/:/g, "");
  const moving =
    shine &&
    typeof window !== "undefined" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <div className="card-art" data-face={face}>
      <svg className="card-art-svg" viewBox="0 0 240 332" aria-hidden="true">
        <defs>
          <clipPath id={`clip${id}`}>
            <path d={INNER} />
          </clipPath>
        </defs>
        {face === "back" ? <Back id={id} /> : <Front id={id} side={face} />}
        {moving ? (
          <g clipPath={`url(#clip${id})`}>
            <rect x="-70" y="0" width="36" height="332" fill="white" opacity="0.3" transform="skewX(-12)">
              <animate attributeName="x" values="-70;320" dur="6.5s" repeatCount="indefinite" />
            </rect>
          </g>
        ) : null}
      </svg>
      {children ? <div className={face === "back" ? "card-art-seal" : "card-art-copy"}>{children}</div> : null}
    </div>
  );
}

export function CategoryMark({ id }: { id: string }) {
  return (
    <svg className="mark" viewBox="0 0 32 32" aria-hidden="true">
      {id === "funny" ? (
        <>
          <circle cx="16" cy="16" r="11" fill="#fff" stroke="#e48aaa" strokeWidth="1.4" />
          <ellipse cx="10.2" cy="17.2" rx="2.3" ry="1.3" fill="#ff8fb3" />
          <ellipse cx="21.8" cy="17.2" rx="2.3" ry="1.3" fill="#ff8fb3" />
          <circle cx="12.2" cy="14.4" r="1.35" fill="#a12d55" />
          <circle cx="19.8" cy="14.4" r="1.35" fill="#a12d55" />
          <path d="M12.4 18.4q3.6 3.4 7.2 0" fill="none" stroke="#c43b66" strokeWidth="1.4" strokeLinecap="round" />
        </>
      ) : id === "deep" ? (
        <>
          <path
            d="M7 6H24Q28 6 28 10V18Q28 22 24 22H15L10 27V22H7Q3 22 3 18V10Q3 6 7 6Z"
            fill="#fff"
            stroke="#e48aaa"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path
            d="M15.6 17.4C15.6 17.4 12 15 12 13.3C12 12.1 13.1 11.3 14.2 12.1C14.8 11.3 16.4 11.3 17 12.1C18.1 11.3 19.2 12.1 19.2 13.3C19.2 15 15.6 17.4 15.6 17.4Z"
            fill="#e45b86"
          />
        </>
      ) : (
        <>
          <path
            d="M16 27C16 27 5.5 18.6 5.5 12.4C5.5 8.4 8.5 6.2 11.6 8.2C13.2 5.4 18.8 5.4 20.4 8.2C23.5 6.2 26.5 8.4 26.5 12.4C26.5 18.6 16 27 16 27Z"
            fill="#fff"
            stroke="#e48aaa"
            strokeWidth="1.3"
          />
          <path d="M16 10.2C13.2 6.2 8.4 7.2 10.2 11C8.6 12.8 12.6 14.6 16 11.8Z" fill="#e45b86" />
          <path d="M16 10.2C18.8 6.2 23.6 7.2 21.8 11C23.4 12.8 19.4 14.6 16 11.8Z" fill="#e45b86" />
          <circle cx="16" cy="10.8" r="1.5" fill="#c43b66" />
        </>
      )}
    </svg>
  );
}

export function SeatMark({ emoji }: { emoji: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <span className="seat-mark">
      <svg viewBox="0 0 64 72" aria-hidden="true">
        <defs>
          <linearGradient id={`s${id}`} x1="32" y1="6" x2="32" y2="66" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#ffc2d6" />
          </linearGradient>
        </defs>
        <path
          d="M14 62Q8 62 8 56L8 30A24 24 0 0 1 56 30L56 56Q56 62 50 62Z"
          fill={`url(#s${id})`}
          stroke="#c43b66"
          strokeOpacity="0.35"
        />
      </svg>
      <span className="seat-emoji">{emoji}</span>
    </span>
  );
}
