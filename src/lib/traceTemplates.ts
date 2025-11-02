/**
 * Generates SVG-based dotted outline templates for draw_trace challenges
 * Creates simple text or shape outlines that students can trace over
 */

export function generateTraceTemplate(word: string): string {
  // Create an SVG with dotted text outline
  const svg = `
    <svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Bubblegum+Sans&amp;display=swap');
        </style>
      </defs>

      <!-- Background -->
      <rect width="600" height="400" fill="white"/>

      <!-- Dotted outline text -->
      <text
        x="50%"
        y="50%"
        font-family="Bubblegum Sans, Arial, sans-serif"
        font-size="72"
        font-weight="bold"
        fill="none"
        stroke="#0ea5e9"
        stroke-width="3"
        stroke-dasharray="8,8"
        stroke-linecap="round"
        text-anchor="middle"
        dominant-baseline="middle"
      >
        ${word.toUpperCase()}
      </text>

      <!-- Guide dots at strategic points -->
      <circle cx="20" cy="380" r="4" fill="#0ea5e9" opacity="0.5"/>
      <text x="35" y="385" font-size="14" fill="#666">Start here →</text>
    </svg>
  `;

  // Convert SVG to data URL
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  return URL.createObjectURL(blob);
}

/**
 * Generates shape-based trace templates for simpler objects
 */
export function generateShapeTraceTemplate(word: string): string {
  // For simple words, create basic shapes
  const shapes: Record<string, string> = {
    tree: `
      <svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="600" height="400" fill="white"/>
        <!-- Tree trunk -->
        <rect x="270" y="250" width="60" height="100"
          fill="none" stroke="#0ea5e9" stroke-width="3"
          stroke-dasharray="10,10" stroke-linecap="round"/>
        <!-- Tree crown - circle -->
        <circle cx="300" cy="200" r="80"
          fill="none" stroke="#10b981" stroke-width="3"
          stroke-dasharray="10,10" stroke-linecap="round"/>
        <text x="300" y="380" font-size="18" fill="#666" text-anchor="middle">Trace the tree</text>
      </svg>
    `,
    flower: `
      <svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="600" height="400" fill="white"/>
        <!-- Stem -->
        <line x1="300" y1="350" x2="300" y2="200"
          stroke="#10b981" stroke-width="3"
          stroke-dasharray="8,8" stroke-linecap="round"/>
        <!-- Petals -->
        <circle cx="300" cy="150" r="25" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="6,6"/>
        <circle cx="340" cy="170" r="25" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="6,6"/>
        <circle cx="340" cy="220" r="25" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="6,6"/>
        <circle cx="300" cy="240" r="25" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="6,6"/>
        <circle cx="260" cy="220" r="25" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="6,6"/>
        <circle cx="260" cy="170" r="25" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="6,6"/>
        <!-- Center -->
        <circle cx="300" cy="195" r="20" fill="none" stroke="#ef4444" stroke-width="3" stroke-dasharray="6,6"/>
        <text x="300" y="380" font-size="18" fill="#666" text-anchor="middle">Trace the flower</text>
      </svg>
    `,
    river: `
      <svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="600" height="400" fill="white"/>
        <!-- Wavy river path -->
        <path d="M 50 200 Q 150 150, 250 200 T 450 200 T 550 200"
          fill="none" stroke="#0ea5e9" stroke-width="50"
          stroke-dasharray="15,15" stroke-linecap="round" opacity="0.3"/>
        <path d="M 50 200 Q 150 150, 250 200 T 450 200 T 550 200"
          fill="none" stroke="#0ea5e9" stroke-width="3"
          stroke-dasharray="10,10" stroke-linecap="round"/>
        <text x="300" y="380" font-size="18" fill="#666" text-anchor="middle">Trace the river</text>
      </svg>
    `,
    mountain: `
      <svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="600" height="400" fill="white"/>
        <!-- Mountain peaks -->
        <path d="M 50 350 L 200 150 L 300 250 L 450 100 L 550 350"
          fill="none" stroke="#0ea5e9" stroke-width="4"
          stroke-dasharray="12,12" stroke-linecap="round"/>
        <text x="300" y="380" font-size="18" fill="#666" text-anchor="middle">Trace the mountain</text>
      </svg>
    `,
  };

  // If we have a custom shape for this word, use it
  if (shapes[word.toLowerCase()]) {
    const blob = new Blob([shapes[word.toLowerCase()]], { type: 'image/svg+xml' });
    return URL.createObjectURL(blob);
  }

  // Otherwise, generate text trace
  return generateTraceTemplate(word);
}

/**
 * Gets the appropriate trace template based on word
 */
export function getTraceTemplate(word: string): string {
  const hasShapeTemplate = ['tree', 'flower', 'river', 'mountain'].includes(word.toLowerCase());

  if (hasShapeTemplate) {
    return generateShapeTraceTemplate(word);
  }

  return generateTraceTemplate(word);
}
