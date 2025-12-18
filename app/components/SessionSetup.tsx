'use client'

import { useState, useEffect } from 'react'

interface Employee {
  id: number
  name: string
  isActive: boolean
}

interface Participant {
  employeeId: number
  tickets: number
}

interface SessionSetupProps {
  onSessionStart: (participants: Participant[]) => void
}

export default function SessionSetup({ onSessionStart }: SessionSetupProps) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployees, setSelectedEmployees] = useState<Set<number>>(
    new Set()
  )
  const [tickets, setTickets] = useState<Record<number, number>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchEmployees()
  }, [])

  useEffect(() => {
    // Pre-select active employees
    const activeIds = employees
      .filter((e) => e.isActive)
      .map((e) => e.id)
    setSelectedEmployees(new Set(activeIds))

    // Set default tickets to 1 for active employees
    const defaultTickets: Record<number, number> = {}
    activeIds.forEach((id) => {
      defaultTickets[id] = 1
    })
    setTickets(defaultTickets)
  }, [employees])

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees')
      if (!res.ok) {
        console.error('Failed to fetch employees:', res.status)
        setEmployees([])
        return
      }
      const data = await res.json()
      if (Array.isArray(data)) {
        setEmployees(data)
      } else {
        console.error('Invalid data format:', data)
        setEmployees([])
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
      setEmployees([])
    }
  }

  const toggleEmployee = (id: number) => {
    const newSelected = new Set(selectedEmployees)
    if (newSelected.has(id)) {
      newSelected.delete(id)
      const newTickets = { ...tickets }
      delete newTickets[id]
      setTickets(newTickets)
    } else {
      newSelected.add(id)
      setTickets({ ...tickets, [id]: 1 })
    }
    setSelectedEmployees(newSelected)
  }

  const updateTickets = (id: number, value: number) => {
    const numValue = Math.max(1, parseInt(String(value)) || 1)
    setTickets({ ...tickets, [id]: numValue })
  }

  const handleStart = () => {
    const participants: Participant[] = Array.from(selectedEmployees).map(
      (id) => ({
        employeeId: id,
        tickets: tickets[id] || 1,
      })
    )

    if (participants.length === 0) {
      alert('Velg minst én ansatt!')
      return
    }

    onSessionStart(participants)
  }

  const activeEmployees = employees.filter((e) => e.isActive)

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Sett opp lotteri</h2>

      <div className="space-y-3 mb-6">
        {activeEmployees.map((employee) => {
          const isSelected = selectedEmployees.has(employee.id)
          return (
            <div
              key={employee.id}
              className={`flex items-center justify-between p-3 border-2 rounded-lg ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleEmployee(employee.id)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="font-medium">{employee.name}</span>
              </div>
              {isSelected && (
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Lodd:</label>
                  <input
                    type="number"
                    min="1"
                    value={tickets[employee.id] || 1}
                    onChange={(e) =>
                      updateTickets(employee.id, parseInt(e.target.value))
                    }
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      <button
        onClick={handleStart}
        disabled={selectedEmployees.size === 0}
        className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-lg"
      >
        Start lotteri
      </button>
    </div>
  )
}
