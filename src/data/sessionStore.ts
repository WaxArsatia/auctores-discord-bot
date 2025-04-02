import type { User } from 'discord.js';

interface PartySession {
  messageId: string;
  betAmount: number;
  participants: Map<string, User>;
  isActive: boolean;
  startTime: number;
  timeoutId?: NodeJS.Timeout;
}

const partySessions = new Map<string, PartySession>();

export const createPartySession = (
  messageId: string,
  betAmount: number
): PartySession => {
  const session: PartySession = {
    messageId,
    betAmount,
    participants: new Map(),
    isActive: true,
    startTime: Date.now(),
  };
  partySessions.set(messageId, session);
  return session;
};

export const getPartySession = (
  messageId: string
): PartySession | undefined => {
  return partySessions.get(messageId);
};

export const deletePartySession = (messageId: string): void => {
  partySessions.delete(messageId);
};

export const addParticipant = (messageId: string, user: User): boolean => {
  const session = partySessions.get(messageId);
  if (!session || !session.isActive) return false;

  session.participants.set(user.id, user);
  return true;
};

export const endPartySession = (messageId: string): void => {
  const session = partySessions.get(messageId);
  if (session) {
    session.isActive = false;
    if (session.timeoutId) {
      clearTimeout(session.timeoutId);
    }
  }
};
