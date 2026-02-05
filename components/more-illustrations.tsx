'use client';

export function HowItWorksOrganizerIllustration() {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Step 1: Create */}
      <rect x="50" y="50" width="80" height="80" rx="8" fill="#2E8C96" opacity="0.2" />
      <circle cx="90" cy="90" r="20" fill="#2E8C96" />
      <text x="90" y="97" textAnchor="middle" fontSize="20" fill="white">+</text>
      <text x="90" y="150" textAnchor="middle" fontSize="12" fill="#1F2D3A" fontWeight="bold">1. Create</text>
      
      {/* Arrow */}
      <path d="M 140 90 L 180 90" stroke="#2E8C96" strokeWidth="3" markerEnd="url(#arrow1)" />
      <defs>
        <marker id="arrow1" markerWidth="10" markerHeight="10" refX="5" refY="3" orient="auto">
          <polygon points="0 0, 10 3, 0 6" fill="#2E8C96" />
        </marker>
      </defs>
      
      {/* Step 2: Share */}
      <rect x="190" y="50" width="80" height="80" rx="8" fill="#2A7A84" opacity="0.2" />
      <circle cx="230" cy="70" r="15" fill="#2A7A84" />
      <circle cx="250" cy="70" r="15" fill="#2A7A84" />
      <circle cx="230" cy="100" r="15" fill="#2A7A84" />
      <circle cx="250" cy="100" r="15" fill="#2A7A84" />
      <text x="230" y="150" textAnchor="middle" fontSize="12" fill="#1F2D3A" fontWeight="bold">2. Share</text>
      
      {/* Arrow */}
      <path d="M 280 90 L 320 90" stroke="#2A7A84" strokeWidth="3" markerEnd="url(#arrow2)" />
      <defs>
        <marker id="arrow2" markerWidth="10" markerHeight="10" refX="5" refY="3" orient="auto">
          <polygon points="0 0, 10 3, 0 6" fill="#2A7A84" />
        </marker>
      </defs>
      
      {/* Step 3: Get Paid */}
      <rect x="330" y="50" width="80" height="80" rx="8" fill="#30a46c" opacity="0.2" />
      <rect x="350" y="70" width="40" height="30" rx="4" fill="#30a46c" />
      <circle cx="370" cy="85" r="8" fill="white" />
      <text x="370" y="150" textAnchor="middle" fontSize="12" fill="#1F2D3A" fontWeight="bold">3. Get Paid</text>
      
      {/* Bottom flow */}
      <rect x="50" y="200" width="360" height="60" rx="8" fill="#E9F1F4" />
      <circle cx="90" cy="230" r="15" fill="#2E8C96" />
      <text x="90" y="237" textAnchor="middle" fontSize="14" fill="white">M</text>
      <text x="90" y="260" textAnchor="middle" fontSize="10" fill="#4A5568">M-Pesa</text>
      
      <circle cx="200" cy="230" r="15" fill="#2A7A84" />
      <text x="200" y="237" textAnchor="middle" fontSize="10" fill="white">$</text>
      <text x="200" y="260" textAnchor="middle" fontSize="10" fill="#4A5568">USDC</text>
      
      <path d="M 230 230 L 280 230" stroke="#2E8C96" strokeWidth="2" />
      <rect x="290" y="215" width="60" height="30" rx="4" fill="#2E8C96" />
      <text x="320" y="235" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">Wallet</text>
    </svg>
  );
}

export function HowItWorksAttendeeIllustration() {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Step 1: Browse */}
      <rect x="50" y="50" width="80" height="80" rx="8" fill="#2E8C96" opacity="0.2" />
      <rect x="70" y="70" width="40" height="30" rx="4" fill="#2E8C96" />
      <circle cx="90" cy="85" r="8" fill="white" />
      <text x="90" y="150" textAnchor="middle" fontSize="12" fill="#1F2D3A" fontWeight="bold">1. Browse</text>
      
      {/* Arrow */}
      <path d="M 140 90 L 180 90" stroke="#2E8C96" strokeWidth="3" markerEnd="url(#arrow3)" />
      <defs>
        <marker id="arrow3" markerWidth="10" markerHeight="10" refX="5" refY="3" orient="auto">
          <polygon points="0 0, 10 3, 0 6" fill="#2E8C96" />
        </marker>
      </defs>
      
      {/* Step 2: Pay */}
      <rect x="190" y="50" width="80" height="80" rx="8" fill="#2A7A84" opacity="0.2" />
      <rect x="210" y="70" width="40" height="30" rx="4" fill="#2A7A84" />
      <circle cx="230" cy="85" r="8" fill="white" />
      <text x="230" y="150" textAnchor="middle" fontSize="12" fill="#1F2D3A" fontWeight="bold">2. Pay</text>
      
      {/* Arrow */}
      <path d="M 280 90 L 320 90" stroke="#2A7A84" strokeWidth="3" markerEnd="url(#arrow4)" />
      <defs>
        <marker id="arrow4" markerWidth="10" markerHeight="10" refX="5" refY="3" orient="auto">
          <polygon points="0 0, 10 3, 0 6" fill="#2A7A84" />
        </marker>
      </defs>
      
      {/* Step 3: Attend */}
      <rect x="330" y="50" width="80" height="80" rx="8" fill="#30a46c" opacity="0.2" />
      <circle cx="370" cy="90" r="25" fill="#30a46c" />
      <text x="370" y="98" textAnchor="middle" fontSize="20" fill="white">✓</text>
      <text x="370" y="150" textAnchor="middle" fontSize="12" fill="#1F2D3A" fontWeight="bold">3. Attend</text>
      
      {/* Payment methods */}
      <rect x="50" y="200" width="360" height="60" rx="8" fill="#E9F1F4" />
      <circle cx="120" cy="230" r="15" fill="#30a46c" />
      <text x="120" y="237" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">M</text>
      <text x="120" y="260" textAnchor="middle" fontSize="10" fill="#4A5568">M-Pesa</text>
      
      <circle cx="280" cy="230" r="15" fill="#2A7A84" />
      <text x="280" y="237" textAnchor="middle" fontSize="10" fill="white">$</text>
      <text x="280" y="260" textAnchor="middle" fontSize="10" fill="#4A5568">USDC</text>
    </svg>
  );
}

export function SecurityIllustration() {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shield */}
      <path d="M 200 50 L 250 80 L 250 150 Q 250 200 200 240 Q 150 200 150 150 L 150 80 Z" fill="#2E8C96" opacity="0.2" stroke="#2E8C96" strokeWidth="3" />
      <path d="M 200 70 L 230 90 L 230 140 Q 230 180 200 210 Q 170 180 170 140 L 170 90 Z" fill="#2E8C96" />
      <circle cx="200" cy="130" r="20" fill="white" />
      <text x="200" y="138" textAnchor="middle" fontSize="20" fill="#2E8C96">✓</text>
      
      {/* Lock icons */}
      <rect x="100" y="200" width="40" height="50" rx="4" fill="#2A7A84" opacity="0.3" />
      <rect x="110" y="210" width="20" height="25" rx="2" fill="#2A7A84" />
      <circle cx="120" cy="210" r="6" fill="#2A7A84" />
      
      <rect x="260" y="200" width="40" height="50" rx="4" fill="#30a46c" opacity="0.3" />
      <rect x="270" y="210" width="20" height="25" rx="2" fill="#30a46c" />
      <circle cx="280" cy="210" r="6" fill="#30a46c" />
    </svg>
  );
}

export function BenefitsAttendeeIllustration() {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Person with ticket */}
      <circle cx="200" cy="100" r="40" fill="#2E8C96" opacity="0.3" />
      <rect x="160" y="140" width="80" height="100" rx="40" fill="#2E8C96" opacity="0.3" />
      
      {/* Ticket */}
      <rect x="250" y="120" width="100" height="60" rx="4" fill="white" stroke="#2E8C96" strokeWidth="2" strokeDasharray="4 4" />
      <circle cx="250" cy="150" r="8" fill="#E9F1F4" />
      <circle cx="350" cy="150" r="8" fill="#E9F1F4" />
      <text x="300" y="145" textAnchor="middle" fontSize="12" fill="#1F2D3A" fontWeight="bold">Ticket</text>
      <text x="300" y="165" textAnchor="middle" fontSize="10" fill="#4A5568">Confirmed</text>
      
      {/* Benefits icons */}
      <circle cx="100" cy="220" r="25" fill="#2E8C96" opacity="0.2" />
      <text x="100" y="230" textAnchor="middle" fontSize="16" fill="#2E8C96">⚡</text>
      <text x="100" y="255" textAnchor="middle" fontSize="10" fill="#4A5568">Instant</text>
      
      <circle cx="200" cy="250" r="25" fill="#2A7A84" opacity="0.2" />
      <text x="200" y="260" textAnchor="middle" fontSize="16" fill="#2A7A84">🔒</text>
      <text x="200" y="285" textAnchor="middle" fontSize="10" fill="#4A5568">Secure</text>
      
      <circle cx="300" cy="220" r="25" fill="#30a46c" opacity="0.2" />
      <text x="300" y="230" textAnchor="middle" fontSize="16" fill="#30a46c">💳</text>
      <text x="300" y="255" textAnchor="middle" fontSize="10" fill="#4A5568">Easy Pay</text>
    </svg>
  );
}
