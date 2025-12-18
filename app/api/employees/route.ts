import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(employees)
  } catch (error: any) {
    console.error('Error fetching employees:', error)
    // If database doesn't exist or tables not created, return empty array
    if (error.code === 'P1001' || error.code === 'P2021') {
      console.log('Database not initialized, returning empty array')
      return NextResponse.json([])
    }
    return NextResponse.json(
      { error: 'Failed to fetch employees', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, isActive } = body

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Navn er påkrevd' },
        { status: 400 }
      )
    }

    const trimmedName = name.trim()

    // Validate name length (2-50 characters)
    if (trimmedName.length < 2) {
      return NextResponse.json(
        { error: 'Navn må være minst 2 tegn' },
        { status: 400 }
      )
    }

    if (trimmedName.length > 50) {
      return NextResponse.json(
        { error: 'Navn kan ikke være mer enn 50 tegn' },
        { status: 400 }
      )
    }

    // Validate characters (letters, spaces, hyphens, apostrophes)
    const validNamePattern = /^[\p{L}\s\-']+$/u
    if (!validNamePattern.test(trimmedName)) {
      return NextResponse.json(
        { error: 'Navn kan kun inneholde bokstaver, mellomrom, bindestrek og apostrof' },
        { status: 400 }
      )
    }

    const employee = await prisma.employee.create({
      data: {
        name: trimmedName,
        isActive: isActive !== undefined ? isActive : true,
      },
    })

    return NextResponse.json(employee, { status: 201 })
  } catch (error: any) {
    console.error('Error creating employee:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Employee with this name already exists' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create employee' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, isActive } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (name !== undefined) {
      const trimmedName = name.trim()
      
      if (trimmedName.length < 2) {
        return NextResponse.json(
          { error: 'Navn må være minst 2 tegn' },
          { status: 400 }
        )
      }

      if (trimmedName.length > 50) {
        return NextResponse.json(
          { error: 'Navn kan ikke være mer enn 50 tegn' },
          { status: 400 }
        )
      }

      const validNamePattern = /^[\p{L}\s\-']+$/u
      if (!validNamePattern.test(trimmedName)) {
        return NextResponse.json(
          { error: 'Navn kan kun inneholde bokstaver, mellomrom, bindestrek og apostrof' },
          { status: 400 }
        )
      }

      updateData.name = trimmedName
    }
    if (isActive !== undefined) updateData.isActive = isActive

    const employee = await prisma.employee.update({
      where: { id: parseInt(id) },
      data: updateData,
    })

    return NextResponse.json(employee)
  } catch (error: any) {
    console.error('Error updating employee:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update employee' },
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

    await prisma.employee.delete({
      where: { id: parseInt(id) },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting employee:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to delete employee' },
      { status: 500 }
    )
  }
}
