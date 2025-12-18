import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { participantId, removeTicket } = body

    if (!participantId) {
      return NextResponse.json(
        { error: 'Participant ID is required' },
        { status: 400 }
      )
    }

    const participant = await prisma.participant.findUnique({
      where: { id: participantId },
    })

    if (!participant) {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      )
    }

    if (removeTicket) {
      const newTickets = Math.max(0, participant.tickets - 1)

      if (newTickets === 0) {
        // Remove participant if tickets reach 0
        await prisma.participant.delete({
          where: { id: participantId },
        })
        return NextResponse.json({ 
          success: true, 
          tickets: 0,
          removed: true 
        })
      } else {
        // Update tickets
        const updated = await prisma.participant.update({
          where: { id: participantId },
          data: { tickets: newTickets },
          include: {
            employee: true,
          },
        })
        return NextResponse.json({ 
          success: true, 
          participant: updated,
          tickets: newTickets,
          removed: false 
        })
      }
    } else {
      // Just return current state without updating
      const participantWithEmployee = await prisma.participant.findUnique({
        where: { id: participantId },
        include: {
          employee: true,
        },
      })
      return NextResponse.json({ 
        success: true, 
        participant: participantWithEmployee,
        tickets: participant.tickets,
        removed: false 
      })
    }
  } catch (error) {
    console.error('Error updating participant:', error)
    return NextResponse.json(
      { error: 'Failed to update participant' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      )
    }

    await prisma.participant.delete({
      where: { id: parseInt(id) },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting participant:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to delete participant' },
      { status: 500 }
    )
  }
}
