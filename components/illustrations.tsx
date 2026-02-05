'use client';

export function EventCreationIllustration() {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Calendar */}
      <rect x="150" y="50" width="100" height="120" rx="8" fill="#2E8C96" opacity="0.2" />
      <rect x="160" y="60" width="80" height="20" rx="4" fill="#2E8C96" />
      <circle cx="180" cy="100" r="8" fill="#2E8C96" />
      <circle cx="220" cy="100" r="8" fill="#2A7A84" />
      <circle cx="180" cy="130" r="8" fill="#30a46c" />
      <circle cx="220" cy="130" r="8" fill="#2E8C96" opacity="0.5" />
      
      {/* Plus icon */}
      <circle cx="280" cy="110" r="25" fill="#2E8C96" />
      <line x1="280" y1="100" x2="280" y2="120" stroke="white" strokeWidth="3" />
      <line x1="270" y1="110" x2="290" y2="110" stroke="white" strokeWidth="3" />
      
      {/* Event card */}
      <rect x="50" y="200" width="300" height="80" rx="12" fill="white" stroke="#E9F1F4" strokeWidth="2" />
      <rect x="70" y="220" width="80" height="40" rx="6" fill="#2E8C96" opacity="0.1" />
      <rect x="160" y="220" width="180" height="12" rx="6" fill="#1F2D3A" opacity="0.3" />
      <rect x="160" y="240" width="120" height="12" rx="6" fill="#4A5568" opacity="0.2" />
      <rect x="160" y="258" width="100" height="12" rx="6" fill="#2E8C96" opacity="0.4" />
    </svg>
  );
}

export function PaymentIllustration() {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Wallet */}
      <rect x="100" y="80" width="200" height="140" rx="12" fill="#2E8C96" opacity="0.2" />
      <rect x="120" y="100" width="160" height="100" rx="8" fill="white" stroke="#2E8C96" strokeWidth="2" />
      <circle cx="200" cy="150" r="20" fill="#2E8C96" />
      <rect x="140" y="180" width="120" height="8" rx="4" fill="#4A5568" opacity="0.3" />
      
      {/* M-Pesa icon */}
      <rect x="50" y="200" width="80" height="50" rx="8" fill="#30a46c" opacity="0.3" />
      <text x="90" y="230" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#30a46c">M-Pesa</text>
      
      {/* USDC icon */}
      <rect x="270" y="200" width="80" height="50" rx="8" fill="#2A7A84" opacity="0.3" />
      <circle cx="310" cy="220" r="12" fill="#2A7A84" />
      <text x="310" y="245" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#2A7A84">USDC</text>
      
      {/* Arrow */}
      <path d="M 200 180 L 200 200" stroke="#2E8C96" strokeWidth="3" markerEnd="url(#arrowhead)" />
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="5" refY="3" orient="auto">
          <polygon points="0 0, 10 3, 0 6" fill="#2E8C96" />
        </marker>
      </defs>
    </svg>
  );
}

export function SharingIllustration() {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Central event card */}
      <rect x="150" y="100" width="100" height="80" rx="8" fill="#2E8C96" opacity="0.2" />
      <rect x="160" y="110" width="80" height="20" rx="4" fill="#2E8C96" />
      <rect x="160" y="140" width="60" height="8" rx="4" fill="#4A5568" opacity="0.3" />
      <rect x="160" y="155" width="50" height="8" rx="4" fill="#2E8C96" opacity="0.4" />
      
      {/* Share arrows */}
      <path d="M 200 100 L 100 50" stroke="#2E8C96" strokeWidth="2" opacity="0.4" />
      <path d="M 200 100 L 300 50" stroke="#2E8C96" strokeWidth="2" opacity="0.4" />
      <path d="M 200 180 L 100 230" stroke="#2E8C96" strokeWidth="2" opacity="0.4" />
      <path d="M 200 180 L 300 230" stroke="#2E8C96" strokeWidth="2" opacity="0.4" />
      
      {/* People icons */}
      <circle cx="100" cy="50" r="20" fill="#2E8C96" opacity="0.3" />
      <circle cx="300" cy="50" r="20" fill="#2A7A84" opacity="0.3" />
      <circle cx="100" cy="230" r="20" fill="#30a46c" opacity="0.3" />
      <circle cx="300" cy="230" r="20" fill="#2E8C96" opacity="0.3" />
    </svg>
  );
}

export function CommunityIllustration() {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* People group */}
      <circle cx="150" cy="120" r="30" fill="#2E8C96" opacity="0.4" />
      <rect x="130" y="150" width="40" height="60" rx="20" fill="#2E8C96" opacity="0.4" />
      
      <circle cx="200" cy="100" r="35" fill="#2A7A84" opacity="0.4" />
      <rect x="175" y="135" width="50" height="70" rx="25" fill="#2A7A84" opacity="0.4" />
      
      <circle cx="250" cy="120" r="30" fill="#30a46c" opacity="0.4" />
      <rect x="230" y="150" width="40" height="60" rx="20" fill="#30a46c" opacity="0.4" />
      
      {/* Connection lines */}
      <line x1="165" y1="130" x2="190" y2="115" stroke="#2E8C96" strokeWidth="2" opacity="0.3" />
      <line x1="215" y1="115" x2="240" y2="130" stroke="#2A7A84" strokeWidth="2" opacity="0.3" />
      
      {/* Event icon above */}
      <circle cx="200" cy="50" r="25" fill="#2E8C96" />
      <text x="200" y="58" textAnchor="middle" fontSize="20" fill="white">🎫</text>
    </svg>
  );
}

export function EmptyEventsIllustration() {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Calendar */}
      <rect x="150" y="80" width="100" height="120" rx="8" fill="#E9F1F4" />
      <rect x="160" y="90" width="80" height="20" rx="4" fill="#2E8C96" opacity="0.3" />
      
      {/* Question mark */}
      <circle cx="200" cy="150" r="30" fill="#E9F1F4" />
      <text x="200" y="165" textAnchor="middle" fontSize="40" fill="#4A5568" opacity="0.5">?</text>
      
      {/* Plus sign */}
      <circle cx="200" cy="230" r="20" fill="#2E8C96" opacity="0.2" />
      <line x1="200" y1="220" x2="200" y2="240" stroke="#2E8C96" strokeWidth="3" />
      <line x1="190" y1="230" x2="210" y2="230" stroke="#2E8C96" strokeWidth="3" />
    </svg>
  );
}
