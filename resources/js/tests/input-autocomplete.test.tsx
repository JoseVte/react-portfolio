import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import InputAutocomplete, { type Props } from '../components/input-autocomplete';

const CATEGORIES = ['Strategy', 'Storytelling', 'Party'];

const renderInput = (props: Partial<Omit<Props, 'ref'>> = {}) => {
    const onChange = vi.fn();

    render(<InputAutocomplete autocompleteValues={CATEGORIES} onChange={onChange} {...props} />);

    return { input: screen.getByRole('textbox') as HTMLInputElement, onChange };
};

describe('InputAutocomplete', () => {
    it('starts empty', () => {
        const { input } = renderInput();

        expect(input.value).toBe('');
    });

    it('starts from a default value', () => {
        const { input } = renderInput({ defaultValue: 'Party' });

        expect(input.value).toBe('Party');
    });

    it('completes the typed prefix with the first match', () => {
        const { input } = renderInput();

        fireEvent.change(input, { target: { value: 'Str' } });

        expect(input.value).toBe('Strategy');
    });

    it('reports the completed value to the caller', () => {
        const { input, onChange } = renderInput();

        fireEvent.change(input, { target: { value: 'Par' } });

        expect(onChange).toHaveBeenCalled();
        expect(onChange.mock.calls.at(-1)?.[0].currentTarget.value).toBe('Party');
    });

    it('selects the completed part so typing replaces it', () => {
        const { input } = renderInput();

        fireEvent.change(input, { target: { value: 'Str' } });

        expect(input.selectionStart).toBe(3);
        expect(input.selectionEnd).toBe('Strategy'.length);
    });

    it('leaves the input alone when nothing matches', () => {
        const { input } = renderInput();

        fireEvent.change(input, { target: { value: 'Zzz' } });

        expect(input.value).toBe('Zzz');
    });

    it('does not complete while deleting characters', () => {
        const { input } = renderInput();

        fireEvent.change(input, { target: { value: 'Str' } });
        expect(input.value).toBe('Strategy');

        fireEvent.change(input, { target: { value: 'St' } });

        expect(input.value).toBe('St');
    });

    it('tolerates an empty list of suggestions', () => {
        const { input } = renderInput({ autocompleteValues: [] });

        fireEvent.change(input, { target: { value: 'Str' } });

        expect(input.value).toBe('Str');
    });

    it('is fully controlled when a value prop is supplied', () => {
        const { input } = renderInput({ value: 'Party' });

        fireEvent.change(input, { target: { value: 'Str' } });

        expect(input.value).toBe('Party');
    });
});
