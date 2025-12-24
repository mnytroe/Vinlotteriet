import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const sessions = await prisma.lotterySession.findMany({
      include: {
        participants: {
          include: {
            employee: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(sessions)
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, participants } = body // participants: [{ employeeId, tickets }]

    // Valider input
    if (!participants || !Array.isArray(participants)) {
      return NextResponse.json(
        { error: 'Participants må være en array' },
        { status: 400 }
      )
    }

    if (participants.length === 0) {
      return NextResponse.json(
        { error: 'Minst én deltaker kreves' },
        { status: 400 }
      )
    }

    // Valider hver deltaker
    for (const p of participants) {
      if (typeof p.employeeId !== 'number' || p.employeeId <= 0) {
        return NextResponse.json(
          { error: 'Ugyldig employeeId' },
          { status: 400 }
        )
      }
      if (p.tickets !== undefined && (typeof p.tickets !== 'number' || p.tickets < 1)) {
        return NextResponse.json(
          { error: 'Tickets må være et positivt tall' },
          { status: 400 }
        )
      }
    }

    const session = await prisma.lotterySession.create({
      data: {
        name: name || null,
        participants: {
          create: participants.map((p: { employeeId: number; tickets: number }) => ({
            employeeId: p.employeeId,
            tickets: p.tickets || 1,
          })),
        },
      },
      include: {
        participants: {
          include: {
            employee: true,
          },
        },
      },
    })

    return NextResponse.json(session, { status: 201 })
  } catch (error) {
    console.error('Error creating session:', error)
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    )
  }
}
