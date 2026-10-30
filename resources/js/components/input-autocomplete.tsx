import { TextInput, TextInputProps } from 'flowbite-react';
import { ChangeEvent, useRef, useState } from 'react';

export interface Props extends Omit<TextInputProps, 'value' | 'defaultValue' | 'onChange'> {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    autocompleteValues: string[];
}

/**
 * A text input that completes what is typed with the first known value starting with it, and selects the completed
 * part so the next keystroke replaces it. It reports the resulting value, not the event, because the completion is
 * not what the visitor typed.
 */
export default function InputAutocomplete({ value, defaultValue = '', onValueChange, autocompleteValues, ...props }: Props) {
    const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
    const isControlled = value !== undefined;
    const written = useRef(isControlled ? value : defaultValue);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const input = event.currentTarget;
        const typed = input.value;
        const isTypingForward = typed.length > written.current.length;
        const match = isTypingForward ? autocompleteValues.find((autocompleteValue) => autocompleteValue.startsWith(typed)) : undefined;

        written.current = typed;

        if (match) {
            // Done before React re-renders, so it finds the value in place and keeps the selection.
            input.value = match;
            input.setSelectionRange(typed.length, match.length);
        }

        if (!isControlled) {
            setUncontrolledValue(input.value);
        }

        onValueChange?.(input.value);
    };

    return <TextInput {...props} value={isControlled ? value : uncontrolledValue} onChange={handleChange} />;
}
