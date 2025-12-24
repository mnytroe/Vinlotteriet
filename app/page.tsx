'use client'

import { useState } from 'react'
import EmployeeManager from './components/EmployeeManager'
import SessionSetup from './components/SessionSetup'
import Wheel from './components/Wheel'
import WinnerDialog from './components/WinnerDialog'
import Confetti from './components/Confetti'
import type { Participant, SessionParticipant, Winner } from '@/types'

export default function Home() {
  const [view, setView] = useState<'employees' | 'setup' | 'lottery'>('employees')
  const [participants, setParticipants] = useState<Participant[]>([])
  const [sessionId, setSessionId] = useState<number | null>(null)
  const [spinning, setSpinning] = useState(false)
  const [winner, setWinner] = useState<Winner | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSessionStart = async (sessionParticipants: SessionParticipant[]) => {
    setLoading(true)
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Lotteri ${new Date().toLocaleDateString('no-NO')}`,
          participants: sessionParticipants,
        }),
      })

      if (res.ok) {
        const session = await res.json()
        setSessionId(session.id)
        setParticipants(session.participants)
        setView('lottery')
      } else {
        alert('Kunne ikke starte lotteri')
      }
    } catch (error) {
      console.error('Error starting session:', error)
      alert('Kunne ikke starte lotteri')
    } finally {
      setLoading(false)
    }
  }

  const handleSpinComplete = async (winnerParticipant: Participant) => {
    setWinner({
      participant: winnerParticipant,
      ticketsRemaining: winnerParticipant.tickets,
    })
    setSpinning(false)
  }

  const handleRemoveTicket = async () => {
    if (!winner) return

    setLoading(true)
    try {
      const res = await fetch('/api/participants', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId: winner.participant.id,
          removeTicket: true,
        }),
      })

      if (res.ok) {
        const result = await res.json()

        // Refresh participants
        if (sessionId) {
          const sessionRes = await fetch(`/api/sessions/${sessionId}`)
          if (sessionRes.ok) {
            const session = await sessionRes.json()
            setParticipants(session.participants)

            // If participant was removed, check if we should end the lottery
            if (result.removed || session.participants.length === 0) {
              if (session.participants.length === 0) {
                alert('Alle lodd er brukt opp!')
                setView('setup')
                setParticipants([])
                setSessionId(null)
              }
            }
          }
        }

        setWinner(null)
      }
    } catch (error) {
      console.error('Error removing ticket:', error)
      alert('Kunne ikke fjerne lodd')
    } finally {
      setLoading(false)
    }
  }

  const handleKeepTicket = () => {
    setWinner(null)
  }

  const handleNewLottery = () => {
    setView('setup')
    setParticipants([])
    setSessionId(null)
    setWinner(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">🎰 Vinlotteriet 🎰</h1>
        </header>

        <nav className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setView('employees')}
            className={`px-6 py-2 rounded-lg font-medium ${
              view === 'employees'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Ansatte
          </button>
          <button
            onClick={() => setView('setup')}
            className={`px-6 py-2 rounded-lg font-medium ${
              view === 'setup'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Sett opp
          </button>
          {view === 'lottery' && (
            <button
              onClick={handleNewLottery}
              className="px-6 py-2 rounded-lg font-medium bg-white text-gray-700 hover:bg-gray-100"
            >
              Nytt lotteri
            </button>
          )}
        </nav>

        <main>
          {view === 'employees' && <EmployeeManager />}
          {view === 'setup' && (
            <SessionSetup onSessionStart={handleSessionStart} />
          )}
          {view === 'lottery' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-6 text-center">Lotteri</h2>
              <Wheel
                participants={participants}
                onSpinComplete={handleSpinComplete}
                spinning={spinning}
                onSpinStart={() => setSpinning(true)}
              />
              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  {participants.reduce((sum, p) => sum + p.tickets, 0)} lodd igjen
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {participants.length} deltakere
                </p>
              </div>
            </div>
          )}
        </main>

        {winner && (
          <>
            <Confetti />
            <WinnerDialog
              winnerName={winner.participant.employee.name}
              ticketsRemaining={winner.ticketsRemaining}
              onRemoveTicket={handleRemoveTicket}
              onKeepTicket={handleKeepTicket}
            />
          </>
        )}
      </div>
    </div>
  )
}
