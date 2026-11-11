import { useId, type ReactNode } from "react";

const ARCH =
  "M36 16H204A22 22 0 0 1 226 38V294A22 22 0 0 1 204 316H36A22 22 0 0 1 14 294V38A22 22 0 0 1 36 16Z";
const FRAME =
  "M46 28H194A16 16 0 0 1 210 44V282A16 16 0 0 1 194 298H46A16 16 0 0 1 30 282V44A16 16 0 0 1 46 28Z";

export function CardArt({
  face,
  shine = false,
  children,
}: {
  face: "back" | "front";
  shine?: boolean;
  children?: ReactNode;
}) {
  const id = useId().replace(/:/g, "");
  const moving =
    shine &&
    typeof window !== "undefined" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <div className="card-art">
      <svg className="card-art-svg" viewBox="0 0 240 332" aria-hidden="true">
        <defs>
          <linearGradient id={`fill${id}`} x1="120" y1="14" x2="120" y2="318" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset={face === "back" ? "0.52" : "0.74"} stopColor={face === "back" ? "#ffe4ee" : "#ffffff"} />
            <stop offset="1" stopColor={face === "back" ? "#ffb7ce" : "#ffe4ee"} />
          </linearGradient>
          <clipPath id={`clip${id}`}>
            <path d={ARCH} />
          </clipPath>
        </defs>
        <path d={ARCH} fill="#f3b4c8" opacity="0.55" transform="translate(0 8)" />
        <path d={ARCH} fill={`url(#fill${id})`} />
        <path d={FRAME} fill="none" stroke="#c43b66" strokeOpacity="0.4" strokeWidth="1.4" />
        {face === "back" ? (
          <>
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              transform="translate(75.6 116) scale(3.7)"
              fill="#fff"
              stroke="#e48aaa"
              strokeWidth="0.5"
            />
            <ellipse cx="99" cy="166" rx="9" ry="5" fill="#ffb0c8" />
            <ellipse cx="141" cy="166" rx="9" ry="5" fill="#ffb0c8" />
            <circle cx="108" cy="150" r="6.4" fill="#a12d55" />
            <circle cx="132" cy="150" r="6.4" fill="#a12d55" />
            <circle cx="106" cy="147.4" r="2.3" fill="#fff" />
            <circle cx="130" cy="147.4" r="2.3" fill="#fff" />
            <circle cx="110.6" cy="151.8" r="1.05" fill="#fff" />
            <circle cx="134.6" cy="151.8" r="1.05" fill="#fff" />
            <path d="M110 167q10 9 20 0" fill="none" stroke="#c43b66" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M120 114C109 101 94 106 103 120C95 127 110 133 120 122Z" fill="#e45b86" />
            <path d="M120 114C131 101 146 106 137 120C145 127 130 133 120 122Z" fill="#f278a0" />
            <circle cx="120" cy="118" r="3.8" fill="#c43b66" />
            <circle cx="118.8" cy="116.6" r="1.15" fill="#fff" opacity="0.8" />
            <path d="M52 108l2.4 6 6 2.4-6 2.4-2.4 6-2.4-6-6-2.4 6-2.4z" fill="#fff" />
            <path d="M188 136l1.7 4.4 4.4 1.7-4.4 1.7-1.7 4.4-1.7-4.4-4.4-1.7 4.4-1.7z" fill="#fff" opacity="0.9" />
          </>
        ) : null}
        {moving ? (
          <g clipPath={`url(#clip${id})`}>
            <rect x="-70" y="0" width="36" height="332" fill="white" opacity="0.45">
              <animate attributeName="x" values="-70;260" dur="6.5s" repeatCount="indefinite" />
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
