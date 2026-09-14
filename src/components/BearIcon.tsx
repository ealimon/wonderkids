import React from 'react';

export function BearIcon({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1024 1024"
      className={className}
    >
      <defs>
        {/* Background Gradient: Warm Radiant Golden Yellow */}
        <linearGradient id="compBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE043"/>
          <stop offset="60%" stopColor="#FFC700"/>
          <stop offset="100%" stopColor="#FFA800"/>
        </linearGradient>

        {/* Radial Sunlight Glow */}
        <radialGradient id="compSunGlow" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45"/>
          <stop offset="70%" stopColor="#FFF388" stopOpacity="0.15"/>
          <stop offset="100%" stopColor="#FFA800" stopOpacity="0"/>
        </radialGradient>

        {/* Bear Primary Fur Gradient */}
        <linearGradient id="compBearFur" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#EAA66E"/>
          <stop offset="35%" stopColor="#D78A4E"/>
          <stop offset="85%" stopColor="#B86629"/>
          <stop offset="100%" stopColor="#994D18"/>
        </linearGradient>

        {/* Inner Ear & Muzzle Cream Gradient */}
        <linearGradient id="compCreamFur" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#FFF7E6"/>
          <stop offset="50%" stopColor="#FEDFA8"/>
          <stop offset="100%" stopColor="#EBC485"/>
        </linearGradient>

        {/* Soft Drop Shadow for Character */}
        <radialGradient id="compGroundShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#8B4500" stopOpacity="0.45"/>
          <stop offset="60%" stopColor="#C77800" stopOpacity="0.2"/>
          <stop offset="100%" stopColor="#FFC700" stopOpacity="0"/>
        </radialGradient>

        {/* Shiny Nose Gradient */}
        <linearGradient id="compNoseGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4A2612"/>
          <stop offset="100%" stopColor="#1A0D06"/>
        </linearGradient>

        {/* Eye Gradient */}
        <radialGradient id="compEyeGrad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#3A1C0E"/>
          <stop offset="80%" stopColor="#1A0B05"/>
          <stop offset="100%" stopColor="#000000"/>
        </radialGradient>

        {/* Cheeks Blush Gradient */}
        <radialGradient id="compBlush" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF5D73" stopOpacity="0.55"/>
          <stop offset="70%" stopColor="#FF8A9A" stopOpacity="0.25"/>
          <stop offset="100%" stopColor="#FFA800" stopOpacity="0"/>
        </radialGradient>
      </defs>

      {/* 1. Base Fill */}
      <rect width="1024" height="1024" fill="url(#compBgGrad)"/>
      <rect width="1024" height="1024" fill="url(#compSunGlow)"/>

      {/* Sparkles & Bubbles */}
      <circle cx="180" cy="220" r="32" fill="#FFFFFF" opacity="0.3"/>
      <circle cx="160" cy="260" r="16" fill="#FFFFFF" opacity="0.4"/>
      <path d="M 820 180 Q 820 220 860 220 Q 820 220 820 260 Q 820 220 780 220 Q 820 220 820 180 Z" fill="#FFFFFF" opacity="0.6"/>
      <path d="M 220 780 Q 220 805 245 805 Q 220 805 220 830 Q 220 805 195 805 Q 220 805 220 780 Z" fill="#FFFFFF" opacity="0.4"/>
      <path d="M 840 760 Q 840 790 870 790 Q 840 790 840 820 Q 840 790 810 790 Q 840 790 840 760 Z" fill="#FFFFFF" opacity="0.5"/>

      {/* 2. Soft Ground Shadow */}
      <ellipse cx="512" cy="850" rx="340" ry="85" fill="url(#compGroundShadow)"/>

      {/* 3. Teddy Bear Body & Limbs */}
      <g id="comp-teddy-bear">
        {/* Left Ear */}
        <ellipse cx="360" cy="310" rx="95" ry="95" fill="#A8571F"/>
        <ellipse cx="360" cy="305" rx="90" ry="90" fill="url(#compBearFur)"/>
        <ellipse cx="365" cy="310" rx="55" ry="55" fill="url(#compCreamFur)"/>

        {/* Right Ear */}
        <ellipse cx="664" cy="310" rx="95" ry="95" fill="#A8571F"/>
        <ellipse cx="664" cy="305" rx="90" ry="90" fill="url(#compBearFur)"/>
        <ellipse cx="659" cy="310" rx="55" ry="55" fill="url(#compCreamFur)"/>

        {/* Left Arm */}
        <ellipse cx="310" cy="620" rx="75" ry="115" transform="rotate(28 310 620)" fill="#A8571F"/>
        <ellipse cx="310" cy="615" rx="72" ry="110" transform="rotate(28 310 615)" fill="url(#compBearFur)"/>
        <ellipse cx="280" cy="670" rx="36" ry="46" transform="rotate(28 280 670)" fill="url(#compCreamFur)"/>

        {/* Right Arm */}
        <ellipse cx="714" cy="620" rx="75" ry="115" transform="rotate(-28 714 620)" fill="#A8571F"/>
        <ellipse cx="714" cy="615" rx="72" ry="110" transform="rotate(-28 714 615)" fill="url(#compBearFur)"/>
        <ellipse cx="744" cy="670" rx="36" ry="46" transform="rotate(-28 744 670)" fill="url(#compCreamFur)"/>

        {/* Main Torso / Body */}
        <ellipse cx="512" cy="650" rx="230" ry="215" fill="#994D18"/>
        <ellipse cx="512" cy="640" rx="225" ry="210" fill="url(#compBearFur)"/>

        {/* Cute Big Round Tummy */}
        <ellipse cx="512" cy="660" rx="145" ry="145" fill="url(#compCreamFur)"/>
        <ellipse cx="512" cy="630" rx="110" ry="95" fill="#FFFFFF" opacity="0.25"/>

        {/* Left Foot & Paw */}
        <ellipse cx="330" cy="770" rx="100" ry="85" transform="rotate(-8 330 770)" fill="#8B4500"/>
        <ellipse cx="330" cy="762" rx="95" ry="80" transform="rotate(-8 330 762)" fill="url(#compBearFur)"/>
        <ellipse cx="330" cy="765" rx="60" ry="50" transform="rotate(-8 330 765)" fill="url(#compCreamFur)"/>
        <circle cx="285" cy="710" r="16" fill="url(#compCreamFur)"/>
        <circle cx="325" cy="695" r="17" fill="url(#compCreamFur)"/>
        <circle cx="365" cy="705" r="16" fill="url(#compCreamFur)"/>

        {/* Right Foot & Paw */}
        <ellipse cx="694" cy="770" rx="100" ry="85" transform="rotate(8 694 770)" fill="#8B4500"/>
        <ellipse cx="694" cy="762" rx="95" ry="80" transform="rotate(8 694 762)" fill="url(#compBearFur)"/>
        <ellipse cx="694" cy="765" rx="60" ry="50" transform="rotate(8 694 765)" fill="url(#compCreamFur)"/>
        <circle cx="655" cy="705" r="16" fill="url(#compCreamFur)"/>
        <circle cx="695" cy="695" r="17" fill="url(#compCreamFur)"/>
        <circle cx="735" cy="710" r="16" fill="url(#compCreamFur)"/>

        {/* 4. Head & Face */}
        <ellipse cx="512" cy="425" rx="230" ry="195" fill="#994D18"/>
        <ellipse cx="512" cy="415" rx="225" ry="190" fill="url(#compBearFur)"/>
        <ellipse cx="512" cy="300" rx="150" ry="70" fill="#FFFFFF" opacity="0.2"/>

        {/* Cheeks Blush */}
        <ellipse cx="370" cy="470" rx="55" ry="40" fill="url(#compBlush)"/>
        <ellipse cx="654" cy="470" rx="55" ry="40" fill="url(#compBlush)"/>

        {/* Big Cream Muzzle */}
        <ellipse cx="512" cy="465" rx="130" ry="98" fill="#B87333" opacity="0.2"/>
        <ellipse cx="512" cy="460" rx="125" ry="95" fill="url(#compCreamFur)"/>

        {/* Shiny Cute Nose */}
        <path d="M 512 432 C 488 405, 460 425, 474 445 C 488 465, 512 485, 512 485 C 512 485, 536 465, 550 445 C 564 425, 536 405, 512 432 Z" fill="url(#compNoseGrad)"/>
        <ellipse cx="496" cy="425" rx="12" ry="7" transform="rotate(-20 496 425)" fill="#FFFFFF" opacity="0.75"/>

        {/* Mouth & Tongue */}
        <path d="M 512 485 L 512 510" stroke="#4A2612" strokeWidth="7" strokeLinecap="round"/>
        <path d="M 460 510 Q 512 550 564 510" stroke="#4A2612" strokeWidth="7" strokeLinecap="round" fill="none"/>
        <path d="M 488 522 Q 512 548 536 522 Z" fill="#FF6B8B"/>

        {/* Eyes */}
        <ellipse cx="400" cy="390" rx="28" ry="34" fill="url(#compEyeGrad)"/>
        <circle cx="390" cy="378" r="11" fill="#FFFFFF"/>
        <circle cx="410" cy="404" r="5" fill="#FFFFFF"/>

        <ellipse cx="624" cy="390" rx="28" ry="34" fill="url(#compEyeGrad)"/>
        <circle cx="614" cy="378" r="11" fill="#FFFFFF"/>
        <circle cx="634" cy="404" r="5" fill="#FFFFFF"/>
      </g>
    </svg>
  );
}

export default BearIcon;
