import { makeAutoObservable } from 'mobx';
import type { Member, PlayerColor, PresenceStatus } from './types';

export interface MemberView {
  id: string;
  name: string;
  initial: string;
  color: PlayerColor;
  status: PresenceStatus;
  isMe: boolean;
  isOnline: boolean;
}

const stackSize = 5;

const toView = (member: Member, meId: string): MemberView => ({
  id: member.id,
  name: member.name,
  initial: member.name.charAt(0).toUpperCase(),
  color: member.color,
  status: member.status,
  isMe: member.id === meId,
  isOnline: member.status === 'online',
});

// Who is at the table. Each member's status is its own small state: online ⇄ away.
export class RoomPresenceStore {
  members: Member[];
  readonly meId: string;

  constructor(members: Member[], meId: string) {
    this.members = members;
    this.meId = meId;
    makeAutoObservable(this, { meId: false }, { autoBind: true });
  }

  get views(): MemberView[] {
    return this.members.map((member) => toView(member, this.meId));
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
    return `${this.count} at the table`;
  }

  get me(): MemberView | undefined {
    return this.views.find((view) => view.isMe);
  }

  find(id: string): MemberView | undefined {
    return this.views.find((view) => view.id === id);
  }
}
