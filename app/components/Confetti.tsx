'use client'

import { useEffect, useState } from 'react'

interface ConfettiPiece {
  id: number
  left: number
  delay: number
  duration: number
  color: string
  size: number
  rotation: number
}

export default function Confetti() {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([])

  useEffect(() => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
      '#F7DC6F', '#BB8FCE', '#FFD700', '#FF69B4', '#00CED1',
      '#FF4500', '#32CD32', '#BA55D3', '#FF1493', '#00FA9A',
    ]

    const newPieces: ConfettiPiece[] = []
    for (let i = 0; i < 150; i++) {
      newPieces.push({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 8 + Math.random() * 8,
        rotation: Math.random() * 360,
      })
    }
    setPieces(newPieces)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute animate-confetti"
          style={{
            left: `${piece.left}%`,
            top: '-20px',
            width: `${piece.size}px`,
            height: `${piece.size * 0.6}px`,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotation}deg)`,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            borderRadius: '2px',
          }}
        />
      ))}
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 1;
          }
          25% {
            transform: translateY(25vh) rotate(180deg) translateX(20px) scale(1);
            opacity: 1;
          }
          50% {
            transform: translateY(50vh) rotate(360deg) translateX(-20px) scale(0.9);
            opacity: 0.9;
          }
          75% {
            transform: translateY(75vh) rotate(540deg) translateX(15px) scale(0.8);
            opacity: 0.7;
          }
          100% {
            transform: translateY(105vh) rotate(720deg) translateX(-10px) scale(0.6);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti-fall linear forwards;
        }
      `}</style>
    </div>
  )
}
