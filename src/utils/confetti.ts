/**
 * Confetti Effect Utility — CSS-only confetti burst
 * Used by: vote submission, level-up toast
 */

const CONFETTI_COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
    '#FF9F43', '#EE5A24', '#0ABDE3', '#10AC84',
];

export function triggerConfetti(originEl?: HTMLElement) {
    const container = document.createElement('div');
    container.style.cssText = `
        position: fixed; inset: 0; z-index: 9999;
        pointer-events: none; overflow: hidden;
    `;
    document.body.appendChild(container);

    const rect = originEl?.getBoundingClientRect();
    const originX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const originY = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;

    const count = 60;
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
        const size = Math.random() * 8 + 4;
        const isCircle = Math.random() > 0.5;
        const angle = (Math.random() * 360) * (Math.PI / 180);
        const velocity = Math.random() * 400 + 200;
        const dx = Math.cos(angle) * velocity;
        const dy = Math.sin(angle) * velocity - 300; // upward bias
        const rotation = Math.random() * 720 - 360;
        const duration = Math.random() * 800 + 1200;

        particle.style.cssText = `
            position: absolute;
            left: ${originX}px;
            top: ${originY}px;
            width: ${size}px;
            height: ${isCircle ? size : size * 0.6}px;
            background: ${color};
            border-radius: ${isCircle ? '50%' : '2px'};
            opacity: 1;
            transform: translate(0, 0) rotate(0deg);
            animation: confetti-burst ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
            --dx: ${dx}px;
            --dy: ${dy}px;
            --rot: ${rotation}deg;
        `;

        container.appendChild(particle);
    }

    // Inject animation keyframes if not already present
    if (!document.getElementById('confetti-style')) {
        const style = document.createElement('style');
        style.id = 'confetti-style';
        style.textContent = `
            @keyframes confetti-burst {
                0% {
                    transform: translate(0, 0) rotate(0deg);
                    opacity: 1;
                }
                100% {
                    transform: translate(var(--dx), calc(var(--dy) + 400px)) rotate(var(--rot));
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    setTimeout(() => container.remove(), 2500);
}
