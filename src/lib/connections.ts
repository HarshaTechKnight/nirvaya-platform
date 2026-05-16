export type ConnectionStatus = 'none' | 'pending_sent' | 'pending_received' | 'accepted' | 'declined'

export function getConnectionStatus(
  connections: any[],
  currentUserId: string,
  otherUserId: string
): { status: ConnectionStatus; connectionId: string | null } {
  const conn = connections.find(c =>
    (c.sender_id === currentUserId && c.receiver_id === otherUserId) ||
    (c.sender_id === otherUserId && c.receiver_id === currentUserId)
  )

  if (!conn) return { status: 'none', connectionId: null }

  if (conn.status === 'accepted') return { status: 'accepted', connectionId: conn.id }
  if (conn.status === 'declined') return { status: 'declined', connectionId: conn.id }

  // pending
  if (conn.sender_id === currentUserId) return { status: 'pending_sent', connectionId: conn.id }
  return { status: 'pending_received', connectionId: conn.id }
}

export function areConnected(
  connections: any[],
  currentUserId: string,
  otherUserId: string
): boolean {
  return connections.some(c =>
    c.status === 'accepted' &&
    ((c.sender_id === currentUserId && c.receiver_id === otherUserId) ||
     (c.sender_id === otherUserId && c.receiver_id === currentUserId))
  )
}