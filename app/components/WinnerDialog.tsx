'use client'

interface WinnerDialogProps {
  winnerName: string
  ticketsRemaining: number
  onRemoveTicket: () => void
  onKeepTicket: () => void
}

export default function WinnerDialog({
  winnerName,
  ticketsRemaining,
  onRemoveTicket,
  onKeepTicket,
}: WinnerDialogProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        <h2 className="text-3xl font-bold text-center mb-4 text-green-600">
          🎉 Gratulerer! 🎉
        </h2>
        <p className="text-xl text-center mb-2">
          <span className="font-bold">{winnerName}</span> har vunnet!
        </p>
        <p className="text-center text-gray-600 mb-6">
          {ticketsRemaining > 0
            ? `Gjenstående lodd: ${ticketsRemaining}`
            : 'Ingen lodd gjenstående'}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onRemoveTicket}
            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
          >
            Fjern lodd
          </button>
          <button
            onClick={onKeepTicket}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Behold lodd
          </button>
        </div>
      </div>
    </div>
  )
}
