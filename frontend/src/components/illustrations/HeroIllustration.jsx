/* Premium SVG illustration — facility/maintenance operations scene */
export default function HeroIllustration({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 520 340" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Background building silhouette */}
      <rect x="40" y="80" width="440" height="240" rx="12" fill="url(#buildingGrad)" opacity="0.06" />

      {/* Building floors */}
      {[80,140,200,260].map((y,i) => (
        <g key={y}>
          <rect x="60" y={y} width="400" height="52" rx="4" fill="white" fillOpacity={0.03} stroke="white" strokeOpacity={0.06} />
          {/* Windows */}
          {[0,1,2,3,4,5].map(w => (
            <rect key={w} x={80 + w * 64} y={y + 12} width="36" height="28" rx="4"
              fill={`url(#winGrad${(i+w)%3})`} opacity={0.7} />
          ))}
        </g>
      ))}

      {/* Floating ticket card 1 */}
      <g filter="url(#shadow1)">
        <rect x="20" y="60" width="180" height="90" rx="12" fill="#0f172a" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
        <rect x="32" y="74" width="60" height="8" rx="4" fill="#1a56db" opacity="0.9" />
        <rect x="32" y="90" width="120" height="6" rx="3" fill="white" opacity="0.6" />
        <rect x="32" y="104" width="90" height="6" rx="3" fill="white" opacity="0.3" />
        {/* Status badge */}
        <rect x="32" y="118" width="52" height="18" rx="9" fill="#ef444430" />
        <rect x="40" y="124" width="36" height="6" rx="3" fill="#ef4444" opacity="0.9" />
        {/* Priority dot */}
        <circle cx="158" cy="127" r="6" fill="#ef4444" />
        <circle cx="158" cy="127" r="3" fill="#fff" opacity="0.8" />
      </g>

      {/* Floating ticket card 2 */}
      <g filter="url(#shadow2)">
        <rect x="320" y="20" width="185" height="100" rx="12" fill="#0f172a" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
        <rect x="334" y="34" width="50" height="8" rx="4" fill="#C8A96B" opacity="0.9" />
        <rect x="334" y="50" width="130" height="6" rx="3" fill="white" opacity="0.6" />
        <rect x="334" y="64" width="100" height="6" rx="3" fill="white" opacity="0.3" />
        {/* Avatar row */}
        {[0,1,2].map(a => (
          <circle key={a} cx={334 + a * 18} cy="90" r="10" fill={['#1a56db','#7c3aed','#059669'][a]}
            stroke="#0f172a" strokeWidth="2" />
        ))}
        <rect x="392" y="82" width="70" height="16" rx="8" fill="#C8A96B20" stroke="#C8A96B50" strokeWidth="1" />
        <rect x="400" y="87" width="54" height="6" rx="3" fill="#C8A96B" opacity="0.8" />
      </g>

      {/* Floating stat card */}
      <g filter="url(#shadow3)">
        <rect x="185" y="240" width="155" height="76" rx="12" fill="#0f172a" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
        <rect x="198" y="254" width="40" height="6" rx="3" fill="white" opacity="0.4" />
        <text x="198" y="286" fill="#10b981" fontSize="28" fontWeight="700" fontFamily="Inter,sans-serif">98%</text>
        <rect x="198" y="294" width="60" height="5" rx="2.5" fill="white" opacity="0.3" />
        {/* Mini bar chart */}
        {[18,28,22,35,30,42,38].map((h,i) => (
          <rect key={i} x={280 + i*9} y={300-h} width="6" height={h} rx="2"
            fill={i===5||i===6 ? '#10b981' : '#1a56db'} opacity={i===5||i===6 ? 1 : 0.4} />
        ))}
      </g>

      {/* Center connecting lines */}
      <path d="M 200 105 Q 260 105 260 180" stroke="url(#lineGrad)" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" />
      <path d="M 320 70 Q 280 70 260 180" stroke="url(#lineGrad)" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" />
      <path d="M 260 252 Q 260 240 262 278" stroke="url(#lineGrad)" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" />

      {/* Center hub circle */}
      <circle cx="260" cy="170" r="36" fill="url(#hubGrad)" />
      <circle cx="260" cy="170" r="32" fill="#0f172a" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      {/* Zap icon in hub */}
      <path d="M264 155l-10 18h8l-4 12 10-18h-8l4-12z" fill="#C8A96B" />
      {/* Pulse ring */}
      <circle cx="260" cy="170" r="44" stroke="#1a56db" strokeWidth="1" opacity="0.2" />
      <circle cx="260" cy="170" r="52" stroke="#1a56db" strokeWidth="1" opacity="0.1" />

      {/* People icons at nodes */}
      <circle cx="110" cy="155" r="18" fill="#1a56db20" stroke="#1a56db40" strokeWidth="1" />
      <circle cx="110" cy="148" r="7" fill="#1a56db" />
      <path d="M96 170 Q110 163 124 170" fill="#1a56db" />

      <circle cx="415" cy="120" r="18" fill="#7c3aed20" stroke="#7c3aed40" strokeWidth="1" />
      <circle cx="415" cy="113" r="7" fill="#7c3aed" />
      <path d="M401 135 Q415 128 429 135" fill="#7c3aed" />

      <circle cx="265" cy="300" r="18" fill="#05966920" stroke="#05966940" strokeWidth="1" />
      <circle cx="265" cy="293" r="7" fill="#059669" />
      <path d="M251 315 Q265 308 279 315" fill="#059669" />

      {/* Defs */}
      <defs>
        <linearGradient id="buildingGrad" x1="40" y1="80" x2="480" y2="320" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1a56db" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#1a56db" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#C8A96B" stopOpacity="0.6" />
        </linearGradient>
        <radialGradient id="hubGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1a56db" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="winGrad0" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a56db" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#0d1b2e" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="winGrad1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C8A96B" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#0d1b2e" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="winGrad2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#0d1b2e" stopOpacity="0.2" />
        </linearGradient>
        <filter id="shadow1" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#000" floodOpacity="0.4" />
        </filter>
        <filter id="shadow2" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#000" floodOpacity="0.4" />
        </filter>
        <filter id="shadow3" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#000" floodOpacity="0.4" />
        </filter>
      </defs>
    </svg>
  );
}
