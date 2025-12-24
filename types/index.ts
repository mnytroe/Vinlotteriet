// Felles type-definisjoner for Vinlotteriet

export interface Employee {
  id: number
  name: string
  isActive: boolean
}

export interface Participant {
  id: number
  employeeId: number
  tickets: number
  employee: Pick<Employee, 'id' | 'name'>
}

export interface SessionParticipant {
  employeeId: number
  tickets: number
}

export interface Winner {
  participant: Participant
  ticketsRemaining: number
}

export interface LotterySession {
  id: number
  name: string | null
  participants: Participant[]
  createdAt: string
  updatedAt: string
}
