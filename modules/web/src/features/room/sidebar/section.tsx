import type { ReactElement, ReactNode } from 'react';
import { RoomSidebarSectionCount, RoomSidebarSectionRoot, RoomSidebarSectionTitle } from './styled-components';

interface RoomSidebarSectionProps {
  title: string;
  count?: number;
  children: ReactNode;
}

export function RoomSidebarSection({ title, count, children }: RoomSidebarSectionProps): ReactElement {
  return (
    <RoomSidebarSectionRoot aria-label={title}>
      <RoomSidebarSectionTitle>
        {title}
        {count !== undefined && <RoomSidebarSectionCount>{count}</RoomSidebarSectionCount>}
      </RoomSidebarSectionTitle>
      {children}
    </RoomSidebarSectionRoot>
  );
}
