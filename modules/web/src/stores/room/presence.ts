import { makeAutoObservable } from 'mobx';
import type { Translate } from '../locale';
import type { Member, PlayerColor, PresenceStatus } from './types';

export interface MemberView {
  id: string;
  name: string;
  initial: string;
  color: PlayerColor;
  status: PresenceStatus;
  isMe: boolean;
  isOnline: boolean;
  // Shown after the name in the people list: "you", "away" or nothing.
  note: string;
}

const stackSize = 5;

const noteFor = (member: Member, meId: string, t: Translate): string => {
  if (member.id === meId) return t('people.you');

  return member.status === 'away' ? t('people.away') : '';
};

const toView = (member: Member, meId: string, t: Translate): MemberView => ({
  id: member.id,
  name: member.name,
  initial: member.name.charAt(0).toUpperCase(),
  color: member.color,
  status: member.status,
  isMe: member.id === meId,
  isOnline: member.status === 'online',
  note: noteFor(member, meId, t),
});

// Who is at the table. Each member's status is its own small state: online ⇄ away.
export class RoomPresenceStore {
  members: Member[];
  readonly meId: string;
  readonly #t: Translate;

  constructor(members: Member[], meId: string, t: Translate) {
    this.members = members;
    this.meId = meId;
    this.#t = t;
    makeAutoObservable(this, { meId: false }, { autoBind: true });
  }

  get views(): MemberView[] {
    return this.members.map((member) => toView(member, this.meId, this.#t));
  }

  get stack(): MemberView[] {
    return this.views.slice(0, stackSize);
  }

  get overflow(): number {
    return Math.max(0, this.members.length - stackSize);
  }

  get hasOverflow(): boolean {
    return this.overflow > 0;
  }

  get count(): number {
    return this.members.length;
  }

  get countLabel(): string {
    return this.#t('people.count', { number: this.count });
  }

  get showLabel(): string {
    return this.#t('people.show', { number: this.count });
  }

  get me(): MemberView | undefined {
    return this.views.find((view) => view.isMe);
  }

  find(id: string): MemberView | undefined {
    return this.views.find((view) => view.id === id);
  }

  rename(id: string, name: string): void {
    this.members = this.members.map((member) => (member.id === id ? { ...member, name } : member));
  }
}
