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
