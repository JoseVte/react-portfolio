import {Config} from 'ziggy-js';

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string;
}

export interface Image {
    id: number;
    name: string;
    category: string;
    original_name: string;
    path: string;
    mimetype: string;
    url: string;
    created_at: Date;
    updated_at: Date;
}

export interface Category {
    name: string,
    value: string,
}

export interface GitHubRepository {
    name: string;
    updated_at: string;
    description: string;
    html_url: string;
    stargazers_count: number;
    forks_count: number;
    owner: {
        avatar_url: string;
    }
}

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: {
        user: User;
    };
    ziggy: Config & { location: string };
};
