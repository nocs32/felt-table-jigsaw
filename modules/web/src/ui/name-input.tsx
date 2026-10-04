import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import type { NameFieldStore } from '../stores/name-field';
import { NameInputField, NameInputSizer } from './styled-components';
import { useNameInputKeys } from './use-name-input';

interface NameInputProps {
  field: NameFieldStore;
  label: string;
  title?: string;
  tone: 'heading' | 'field';
}

// A name you edit in place (Slack's channel rename): looks like text until you click it.
export const NameInput = observer(function NameInput({ field, label, title, tone }: NameInputProps): ReactElement {
  const ref = useNameInputKeys(field);

  return (
    <NameInputSizer tone={tone} data-value={field.sizerText}>
      <NameInputField
        ref={ref}
        tone={tone}
        value={field.text}
        placeholder={field.placeholder}
        aria-label={label}
        title={title}
        spellCheck={false}
        autoComplete="off"
        onFocus={field.edit}
        onChange={(event) => field.type(event.target.value)}
        onBlur={field.commit}
      />
    </NameInputSizer>
  );
});
