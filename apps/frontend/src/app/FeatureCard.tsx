'use client'
import { useCallback, useRef } from 'react';

export default function TextPage({
  icon,
  text, R
}: {
  icon: React.ReactNode;
  text: string;
}) {
  const orbRef = useRef<HTMLDivElement>(null);
  const iconWrapperRef = useRef<HTMLDivElement>(null);

  const getShadowOffset = (
    orb: { x: number; y: number },
    icon: { x: number; y: number },
    distance: number = 6
  ) => {
    const dx = icon.x - orb.x;
    const dy = icon.y - orb.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    if (length === 0) return { x: 0, y: 0 };
    return {
      x: (dx / length) * distance,
      y: (dy / length) * distance,
    };
  };

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget?.getBoundingClientRect();
    const orbX = e.clientX - (rect?.left ?? 0);
    const orbY = e.clientY - (rect?.top ?? 0);

    if (orbRef.current) {
      orbRef.current.style.left = `${orbX}px`;
      orbRef.current.style.top = `${orbY}px`;
    }

    // Read icon position fresh on every move — no stale closure
    const iconRect = iconWrapperRef.current?.getBoundingClientRect();
    if (iconRect && iconWrapperRef.current) {
      const iconPos = {
        x: iconRect.left - (rect?.left ?? 0),
        y: iconRect.top - (rect?.top ?? 0)
      };
      const shadow = getShadowOffset({ x: orbX, y: orbY }, iconPos, 8);
      iconWrapperRef.current.style.filter =
        `drop-shadow(${shadow.x}px ${shadow.y}px 1px rgba(0, 0, 0, 0.2))`;
    }
  }, []); // no deps needed — everything read from refs or event

  const handleMouseEnter = useCallback(() => {
    if (orbRef.current) {
      orbRef.current.style.opacity = '0.3';
      orbRef.current.style.pointerEvents = 'none';
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (orbRef.current) orbRef.current.style.opacity = '0';
  }, []);

  return (
    <>
      <div
        className='h-52 w-52 ios-modern-btn flex flex-col justify-between bg-radial-[at_0%_0%] from-slate-400 to-slate-800 p-4 rounded-xl hover:cursor-none overflow-hidden relative'
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div ref={iconWrapperRef} className='flex'>
          {icon}
        </div>

        <p className='text-white'>{text}</p>

        <div
          data-name='light'
          ref={orbRef}
          style={{
            height: '200px',
            width: '200px',
            borderRadius: '100%',
            background: 'radial-gradient(white 1%, transparent 50%)',
            mixBlendMode: 'screen',
            position: 'absolute',
            transform: 'translate(-50%, -50%)',
            opacity: '0',
            pointerEvents: 'none',
          }}
        />
      </div>
    </>
  );
}
