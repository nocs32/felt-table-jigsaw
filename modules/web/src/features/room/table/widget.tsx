import { observer } from 'mobx-react-lite';
import type { ReactElement, ReactNode } from 'react';
import type { UiWidgetsFrameStore } from '../../../stores/ui/widgets/frame';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomTableWidgetResize, RoomTableWidgetRoot } from './styled-components';
import { useRoomTableWidget } from './use-widget';

interface RoomTableWidgetProps {
  frame: UiWidgetsFrameStore;
  label: string;
  layer: 'picture' | 'chat';
  children: ReactNode;
}

// A movable, resizable card floating over the table. Children mark their drag area with
// data-widget-move; the corner handle resizes.
export const RoomTableWidget = observer(function RoomTableWidget({ frame, label, layer, children }: RoomTableWidgetProps): ReactElement {
  const { locale } = useRootStore();
  const ref = useRoomTableWidget(frame);

  return (
    <RoomTableWidgetRoot ref={ref} data-widget aria-label={label} layer={layer} gesture={frame.gesture}>
      {children}
      <RoomTableWidgetResize data-widget-resize title={locale.t('widget.resize')} aria-hidden />
    </RoomTableWidgetRoot>
  );
});
