'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface Participant {
  id: number
  employeeId: number
  tickets: number
  employee: {
    id: number
    name: string
  }
}

interface WheelProps {
  participants: Participant[]
  onSpinComplete: (winner: Participant) => void
  spinning: boolean
  onSpinStart: () => void
}

export default function Wheel({
  participants,
  onSpinComplete,
  spinning,
  onSpinStart,
}: WheelProps) {
  const [rotation, setRotation] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)
  const [segments, setSegments] = useState<Participant[]>([])
  const animationRef = useRef<number | null>(null)

  const segmentAngle = segments.length > 0 ? 360 / segments.length : 0

  // Initialize segments when participants change
  useEffect(() => {
    if (participants.length > 0) {
      const expanded = participants.flatMap((p) => Array(p.tickets).fill(p))
      shuffleArray(expanded)
      setSegments(expanded)
      setRotation(Math.random() * 360)
    }
  }, [participants])

  // Fisher-Yates shuffle
  const shuffleArray = (array: Participant[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]
    }
  }

  const randomize = useCallback(() => {
    if (isSpinning) return
    
    const expanded = participants.flatMap((p) => Array(p.tickets).fill(p))
    shuffleArray(expanded)
    setSegments([...expanded])
    setRotation(Math.random() * 360)
  }, [isSpinning, participants])

  const spin = useCallback(() => {
    if (isSpinning || spinning || segments.length === 0) return

    setIsSpinning(true)
    onSpinStart()

    // Pick a random winner index
    const winnerIndex = Math.floor(Math.random() * segments.length)
    
    // Calculate final rotation to land on winner
    // Segment 0 is at top when rotation = 0
    // To land on segment i, we need to rotate so segment i is at top
    // That means rotating by: i * segmentAngle degrees (to bring segment i to where segment 0 was)
    // But since rotation is clockwise, we need: 360 - (winnerIndex * segmentAngle)
    // Plus we add some random offset within the segment (but not too close to edges)
    const segmentCenter = winnerIndex * segmentAngle + segmentAngle / 2
    const targetAngle = 360 - segmentCenter
    
    // Add full rotations for drama
    const fullRotations = 5 + Math.floor(Math.random() * 5) // 5-9 full rotations
    const finalRotation = rotation + fullRotations * 360 + targetAngle - (rotation % 360)
    
    const duration = 5000
    const startTime = performance.now()
    const startRotation = rotation

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Cubic ease-out: starts fast, slows down
      const easeOut = 1 - Math.pow(1 - progress, 3)
      
      const currentRotation = startRotation + (finalRotation - startRotation) * easeOut
      setRotation(currentRotation)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        // Animation complete
        setRotation(finalRotation)
        setIsSpinning(false)
        
        // Announce winner
        const winner = segments[winnerIndex]
        if (winner) {
          setTimeout(() => onSpinComplete(winner), 200)
        }
      }
    }

    animationRef.current = requestAnimationFrame(animate)
  }, [isSpinning, spinning, segments, rotation, segmentAngle, onSpinStart, onSpinComplete])

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  const getSegmentPath = (index: number, outerRadius: number) => {
    const startAngle = (index * segmentAngle - 90) * (Math.PI / 180)
    const endAngle = ((index + 1) * segmentAngle - 90) * (Math.PI / 180)
    const innerRadius = 30

    const x1 = 250 + outerRadius * Math.cos(startAngle)
    const y1 = 250 + outerRadius * Math.sin(startAngle)
    const x2 = 250 + outerRadius * Math.cos(endAngle)
    const y2 = 250 + outerRadius * Math.sin(endAngle)
    const x3 = 250 + innerRadius * Math.cos(endAngle)
    const y3 = 250 + innerRadius * Math.sin(endAngle)
    const x4 = 250 + innerRadius * Math.cos(startAngle)
    const y4 = 250 + innerRadius * Math.sin(startAngle)

    const largeArc = segmentAngle > 180 ? 1 : 0

    return `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`
  }

  const getSegmentColor = (participant: Participant) => {
    const colors = [
      '#E53935', '#1E88E5', '#43A047', '#FB8C00', '#8E24AA',
      '#00ACC1', '#FFB300', '#5E35B1', '#D81B60', '#00897B',
      '#3949AB', '#C0CA33', '#6D4C41', '#039BE5', '#7CB342',
    ]
    // Use employeeId to ensure same person always gets same color
    return colors[participant.employeeId % colors.length]
  }

  const getSegmentLabelPosition = (index: number, radius: number) => {
    const angle = ((index + 0.5) * segmentAngle - 90) * (Math.PI / 180)
    const labelRadius = radius * 0.65
    const x = 250 + labelRadius * Math.cos(angle)
    const y = 250 + labelRadius * Math.sin(angle)
    const textRotation = (index + 0.5) * segmentAngle
    return { x, y, textRotation }
  }

  if (segments.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <p className="text-gray-500">Ingen deltakere valgt</p>
      </div>
    )
  }

  const outerRadius = 200

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-10" style={{ marginTop: '-5px' }}>
          <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-red-600 drop-shadow-lg"></div>
        </div>
        
        {/* Wheel */}
        <svg
          width="500"
          height="500"
          style={{
            transform: `rotate(${rotation}deg)`,
            transformOrigin: 'center',
          }}
        >
          {/* Outer ring */}
          <circle cx="250" cy="250" r="210" fill="#333" />
          
          {/* Segments */}
          {segments.map((participant, index) => {
            const { x, y, textRotation } = getSegmentLabelPosition(index, outerRadius)
            return (
              <g key={index}>
                <path
                  d={getSegmentPath(index, outerRadius)}
                  fill={getSegmentColor(participant)}
                  stroke="#fff"
                  strokeWidth="2"
                />
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontWeight="bold"
                  fontSize={segments.length > 10 ? '10px' : '12px'}
                  transform={`rotate(${textRotation}, ${x}, ${y})`}
                  style={{ pointerEvents: 'none', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
                >
                  {participant.employee.name.substring(0, 8)}
                </text>
              </g>
            )
          })}
          
          {/* Center circle */}
          <circle cx="250" cy="250" r="30" fill="#333" stroke="#fff" strokeWidth="3" />
        </svg>
      </div>

      <div className="mt-8 flex gap-4">
        <button
          onClick={randomize}
          disabled={isSpinning}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition-all active:scale-95"
        >
          Randomiser
        </button>
        <button
          onClick={spin}
          disabled={isSpinning || segments.length === 0}
          className="px-10 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold text-lg transition-all active:scale-95"
        >
          {isSpinning ? 'Spinner...' : 'SPINN!'}
        </button>
      </div>
    </div>
  )
}
