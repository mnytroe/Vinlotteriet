'use client'

import { useState, useEffect, useRef } from 'react'

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
  const wheelRef = useRef<SVGSVGElement>(null)
  const animationRef = useRef<number>()
  const isRandomizingRef = useRef(false)

  // Expand participants based on tickets
  const expandedSegments = participants.flatMap((p) =>
    Array(p.tickets).fill(p)
  )

  const totalSegments = expandedSegments.length
  const segmentAngle = 360 / totalSegments

  // Randomize order
  const [randomizedSegments, setRandomizedSegments] = useState<Participant[]>(
    []
  )

  useEffect(() => {
    if (participants.length > 0) {
      randomizeSegments()
    }
  }, [participants])

  const randomizeSegments = () => {
    // Don't randomize while spinning or if already randomizing
    if (isSpinning || isRandomizingRef.current) return
    
    isRandomizingRef.current = true
    
    const expanded = participants.flatMap((p) => Array(p.tickets).fill(p))
    // Better shuffle algorithm (Fisher-Yates)
    const shuffled = [...expanded]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    setRandomizedSegments(shuffled)
    // Also randomize starting position
    setRotation(Math.random() * 360)
    
    // Reset flag after a short delay
    setTimeout(() => {
      isRandomizingRef.current = false
    }, 100)
  }

  const spin = () => {
    if (isSpinning || spinning) return

    setIsSpinning(true)
    onSpinStart()

    // Pick a random segment to win
    const targetSegmentIndex = Math.floor(Math.random() * randomizedSegments.length)
    
    // Segments start at -90° (top) and go clockwise
    // Each segment i has center at: -90° + (i + 0.5) * segmentAngle
    // Pointer is at top (0° or 360°)
    // After rotation R, segment i's center is at: -90° + (i + 0.5) * segmentAngle + R
    // We want this to be 0° (mod 360), so:
    // -90° + (i + 0.5) * segmentAngle + R ≡ 0° (mod 360)
    // R ≡ 90° - (i + 0.5) * segmentAngle (mod 360)
    
    const targetSegmentCenterAngle = -90 + (targetSegmentIndex + 0.5) * segmentAngle
    // We want the wheel rotated so target segment center is at 0° (top where pointer is)
    // So final rotation should make: targetSegmentCenterAngle + finalRotation ≡ 0 (mod 360)
    // finalRotation ≡ -targetSegmentCenterAngle (mod 360)
    // But we need to account for current rotation and add full spins
    const currentNormalized = ((rotation % 360) + 360) % 360
    
    // Calculate angle needed to reach target from current position
    const angleToTarget = (360 - targetSegmentCenterAngle) % 360
    
    // Add multiple full rotations for drama (8-15 rotations)
    const spins = 8 + Math.random() * 7
    const totalRotation = currentNormalized + spins * 360 + angleToTarget

    const startTime = Date.now()
    const duration = 5000 // 5 seconds for more suspense
    const startRotation = rotation

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Smooth ease-out: starts fast, gradually slows down
      // Using cubic ease-out for natural deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3)
      
      const currentRotation = startRotation + (totalRotation - startRotation) * easeOut
      setRotation(currentRotation)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        // Ensure final rotation is exactly correct
        const finalRotation = startRotation + totalRotation
        setRotation(finalRotation)
        
        // Verify winner calculation based on final rotation
        // Final rotation mod 360 gives us where segment 0's center is
        const finalNormalized = ((finalRotation % 360) + 360) % 360
        // Segment 0 center at finalNormalized, so segment i center at finalNormalized - 90 + (i+0.5)*segmentAngle
        // We want to find which segment has center at 0° (top)
        // 0 = finalNormalized - 90 + (i+0.5)*segmentAngle
        // (i+0.5)*segmentAngle = 90 - finalNormalized
        // i = (90 - finalNormalized) / segmentAngle - 0.5
        
        let calculatedIndex = Math.floor((90 - finalNormalized) / segmentAngle + 0.5)
        calculatedIndex = ((calculatedIndex % randomizedSegments.length) + randomizedSegments.length) % randomizedSegments.length
        
        // Use the calculated winner (should match targetSegmentIndex)
        const winner = randomizedSegments[calculatedIndex] || randomizedSegments[targetSegmentIndex]

        // Cancel any existing animation frame
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
        }
        setIsSpinning(false)
        
        if (winner) {
          setTimeout(() => {
            onSpinComplete(winner)
          }, 300)
        }
      }
    }

    animate()
  }

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
    const innerRadius = 20

    const x1 = 250 + outerRadius * Math.cos(startAngle)
    const y1 = 250 + outerRadius * Math.sin(startAngle)
    const x2 = 250 + outerRadius * Math.cos(endAngle)
    const y2 = 250 + outerRadius * Math.sin(endAngle)

    const x3 = 250 + innerRadius * Math.cos(endAngle)
    const y3 = 250 + innerRadius * Math.sin(endAngle)
    const x4 = 250 + innerRadius * Math.cos(startAngle)
    const y4 = 250 + innerRadius * Math.sin(startAngle)

    return `M 250 250 L ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 0 0 ${x4} ${y4} Z`
  }

  const getSegmentColor = (index: number) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
      '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52BE80',
      '#EC7063', '#5DADE2', '#58D68D', '#F4D03F', '#AF7AC5',
    ]
    return colors[index % colors.length]
  }

  const getSegmentLabel = (index: number) => {
    if (index >= randomizedSegments.length) return ''
    const participant = randomizedSegments[index]
    return participant.employee.name.substring(0, 10)
  }

  const getSegmentLabelPosition = (index: number, radius: number) => {
    const angle = ((index + 0.5) * segmentAngle - 90) * (Math.PI / 180)
    const labelRadius = radius * 0.7
    const x = 250 + labelRadius * Math.cos(angle)
    const y = 250 + labelRadius * Math.sin(angle)
    const rotation = (index + 0.5) * segmentAngle
    return { x, y, rotation }
  }

  if (randomizedSegments.length === 0) {
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
        <svg
          ref={wheelRef}
          width="500"
          height="500"
          className="transform"
          style={{
            transform: `rotate(${rotation}deg)`,
            transformOrigin: 'center',
            transition: isSpinning ? 'none' : 'transform 0.05s ease-out',
          }}
        >
          {randomizedSegments.map((_, index) => {
            const { x, y, rotation: labelRotation } = getSegmentLabelPosition(
              index,
              outerRadius
            )
            return (
              <g key={index}>
                <path
                  d={getSegmentPath(index, outerRadius)}
                  fill={getSegmentColor(index)}
                  stroke="#fff"
                  strokeWidth="2"
                />
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs font-semibold fill-white"
                  transform={`rotate(${labelRotation}, ${x}, ${y})`}
                  style={{
                    fontSize: '12px',
                    pointerEvents: 'none',
                  }}
                >
                  {getSegmentLabel(index)}
                </text>
              </g>
            )
          })}
        </svg>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
          <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-red-600"></div>
        </div>
      </div>

      <div className="mt-6 flex gap-4">
        <button
          onClick={randomizeSegments}
          disabled={isSpinning || randomizedSegments.length === 0}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
        >
          Randomiser
        </button>
        <button
          onClick={spin}
          disabled={isSpinning || spinning || randomizedSegments.length === 0}
          className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-lg"
        >
          {isSpinning ? 'Spinner...' : 'Spinn!'}
        </button>
      </div>
    </div>
  )
}
