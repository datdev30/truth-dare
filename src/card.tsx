import { useId, type ReactNode } from "react";

const ART = {
  back: "/card-back.png",
  truth: "/card-truth.png",
  dare: "/card-dare.png",
} as const;

type Face = keyof typeof ART;

export function CardArt({ face, children }: { face: Face; children?: ReactNode }) {
  return (
    <div className="card-art" data-face={face}>
      <img className="card-art-img" src={ART[face]} alt="" draggable={false} />
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
