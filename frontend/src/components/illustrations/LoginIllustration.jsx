/* Premium SVG — enterprise operations / city + data flow scene for login */
export default function LoginIllustration({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 400 480" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* City skyline silhouette */}
      <path d="M0 380 L0 280 L30 280 L30 240 L50 240 L50 200 L70 200 L70 240 L90 240 L90 260
               L110 260 L110 180 L120 160 L130 180 L130 260 L150 260 L150 220 L170 220 L170 260
               L190 260 L190 240 L200 220 L210 240 L210 260 L230 260 L230 200 L250 200 L250 260
               L270 260 L270 240 L280 230 L290 240 L290 260 L310 260 L310 280 L330 280 L330 240
               L350 240 L350 280 L370 280 L370 260 L390 260 L390 200 L400 200 L400 380 Z"
        fill="url(#cityGrad)" opacity="0.15" />

      {/* Building windows */}
      {[
        [115,190],[115,210],[125,190],[125,210],
        [155,230],[155,248],[165,230],[165,248],
        [235,210],[245,210],[255,210],
        [375,210],[375,230],[385,210],[385,230],[395,210],[395,230],
      ].map(([x,y],i) => (
        <rect key={i} x={x} y={y} width="7" height="10" rx="1"
          fill={i%3===0 ? '#1a56db' : i%3===1 ? '#C8A96B' : '#7c3aed'}
          opacity={0.5 + (i%3)*0.15} />
      ))}

      {/* Main floating card — ticket */}
      <g filter="url(#ls1)">
        <rect x="60" y="60" width="280" height="160" rx="16" fill="#0c1526" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        {/* Header bar */}
        <rect x="60" y="60" width="280" height="44" rx="16" fill="#111f3a" />
        <rect x="60" y="88" width="280" height="16" fill="#111f3a" />
        {/* Dots */}
        <circle cx="84" cy="82" r="5" fill="#ff5f57" />
        <circle cx="100" cy="82" r="5" fill="#febc2e" />
        <circle cx="116" cy="82" r="5" fill="#28c840" />
        {/* URL bar */}
        <rect x="140" y="75" width="140" height="14" rx="7" fill="rgba(255,255,255,0.06)" />
        <rect x="148" y="79" width="80" height="6" rx="3" fill="rgba(255,255,255,0.2)" />

        {/* Card content */}
        <rect x="80" y="120" width="48" height="7" rx="3.5" fill="#1a56db" opacity="0.9" />
        <rect x="80" y="135" width="200" height="6" rx="3" fill="white" opacity="0.5" />
        <rect x="80" y="149" width="150" height="6" rx="3" fill="white" opacity="0.3" />

        {/* Status chips */}
        <rect x="80" y="165" width="60" height="20" rx="10" fill="#ef444422" stroke="#ef444444" strokeWidth="1" />
        <rect x="90" y="171" width="40" height="8" rx="4" fill="#ef4444" opacity="0.8" />
        <rect x="152" y="165" width="68" height="20" rx="10" fill="#7c3aed22" stroke="#7c3aed44" strokeWidth="1" />
        <rect x="162" y="171" width="48" height="8" rx="4" fill="#7c3aed" opacity="0.8" />

        {/* Progress bar */}
        <rect x="80" y="196" width="240" height="6" rx="3" fill="rgba(255,255,255,0.08)" />
        <rect x="80" y="196" width="160" height="6" rx="3" fill="url(#progGrad)" />
      </g>

      {/* Floating notification card */}
      <g filter="url(#ls2)">
        <rect x="220" y="250" width="165" height="80" rx="12" fill="#0c1526" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <circle cx="244" cy="278" r="14" fill="#1a56db22" stroke="#1a56db44" strokeWidth="1" />
        <path d="M240 275 l6 5 8-9" stroke="#1a56db" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <rect x="264" y="270" width="100" height="6" rx="3" fill="white" opacity="0.6" />
        <rect x="264" y="284" width="70" height="5" rx="2.5" fill="white" opacity="0.3" />
        <rect x="230" y="302" width="140" height="16" rx="8" fill="url(#notifGrad)" opacity="0.8" />
        <rect x="240" y="307" width="80" height="6" rx="3" fill="white" opacity="0.9" />
      </g>

      {/* Floating avatar / team card */}
      <g filter="url(#ls3)">
        <rect x="15" y="270" width="155" height="72" rx="12" fill="#0c1526" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <rect x="28" y="284" width="80" height="6" rx="3" fill="white" opacity="0.5" />
        <rect x="28" y="298" width="55" height="5" rx="2.5" fill="white" opacity="0.3" />
        {/* Avatars */}
        {['#1a56db','#7c3aed','#059669','#ef4444'].map((c,i) => (
          <circle key={i} cx={28 + i*20} cy="325" r="12" fill={c}
            stroke="#0c1526" strokeWidth="2" />
        ))}
        <rect x="112" y="315" width="42" height="18" rx="9" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
        <rect x="120" y="321" width="26" height="6" rx="3" fill="white" opacity="0.5" />
      </g>

      {/* Resolution time badge */}
      <g filter="url(#ls2)">
        <rect x="130" y="370" width="150" height="52" rx="12" fill="#C8A96B" />
        <text x="150" y="393" fill="#0a0f1e" fontSize="11" fontWeight="700" fontFamily="Inter,sans-serif">🚀 Resolved in</text>
        <text x="150" y="411" fill="#0a0f1e" fontSize="18" fontWeight="800" fontFamily="Inter,sans-serif">2.4 hours</text>
      </g>

      {/* Connecting dots / data flow */}
      {[[200,232],[200,248],[200,264]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r="3" fill="#1a56db" opacity={0.4 + i*0.2} />
      ))}
      {[[205,350],[205,360],[205,370]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r="3" fill="#C8A96B" opacity={0.4 + i*0.2} />
      ))}

      <defs>
        <linearGradient id="cityGrad" x1="0" y1="200" x2="400" y2="380" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1a56db" />
          <stop offset="50%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#C8A96B" />
        </linearGradient>
        <linearGradient id="progGrad" x1="80" y1="0" x2="320" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1a56db" />
          <stop offset="100%" stopColor="#C8A96B" />
        </linearGradient>
        <linearGradient id="notifGrad" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#1a56db" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <filter id="ls1" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="#000" floodOpacity="0.5" />
        </filter>
        <filter id="ls2" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#000" floodOpacity="0.4" />
        </filter>
        <filter id="ls3" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#000" floodOpacity="0.4" />
        </filter>
      </defs>
    </svg>
  );
}
