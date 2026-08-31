import { createElement, Fragment, type ReactNode } from 'react';

const NEWLINE_SPLIT_PATTERN = /(\r\n|\r|\n)/g;
const NEWLINE_PATTERN = /^(\r\n|\r|\n)$/;

/**
 * Render a plain string with its newlines turned into <br /> elements.
 */
export function nl2br(value: string | null | undefined): ReactNode {
    if (typeof value !== 'string') {
        return value ?? null;
    }

    return value
        .split(NEWLINE_SPLIT_PATTERN)
        .map((part, index) => (NEWLINE_PATTERN.test(part) ? createElement('br', { key: index }) : createElement(Fragment, { key: index }, part)));
}
