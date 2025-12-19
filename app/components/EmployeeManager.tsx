'use client'

import { useState, useEffect } from 'react'

interface Employee {
  id: number
  name: string
  isActive: boolean
}

export default function EmployeeManager() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [newName, setNewName] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees')
      if (!res.ok) {
        console.error('Failed to fetch employees:', res.status)
        setEmployees([])
        return
      }
      const data = await res.json()
      // Ensure data is an array
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

  const addEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return

    setLoading(true)
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      })

      if (res.ok) {
        setNewName('')
        fetchEmployees()
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to add employee')
      }
    } catch (error) {
      console.error('Error adding employee:', error)
      alert('Failed to add employee')
    } finally {
      setLoading(false)
    }
  }

  const toggleEmployee = async (id: number, isActive: boolean) => {
    try {
      const res = await fetch('/api/employees', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !isActive }),
      })

      if (res.ok) {
        fetchEmployees()
      }
    } catch (error) {
      console.error('Error updating employee:', error)
    }
  }

  const deleteEmployee = async (id: number) => {
    if (!confirm('Er du sikker på at du vil slette denne ansatte?')) return

    try {
      const res = await fetch(`/api/employees?id=${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchEmployees()
      }
    } catch (error) {
      console.error('Error deleting employee:', error)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Administrer ansatte</h2>

      <form onSubmit={addEmployee} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Navn på ansatt"
            maxLength={50}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || newName.trim().length < 2}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Legg til
          </button>
        </div>
      </form>

      <div className="space-y-2">
        {employees.map((employee) => (
          <div
            key={employee.id}
            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
          >
            <span
              className={employee.isActive ? 'font-medium' : 'text-gray-400'}
            >
              {employee.name}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => toggleEmployee(employee.id, employee.isActive)}
                className={`px-4 py-1 rounded ${
                  employee.isActive
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {employee.isActive ? 'Aktiv' : 'Inaktiv'}
              </button>
              <button
                onClick={() => deleteEmployee(employee.id)}
                className="px-4 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200"
              >
                Slett
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
