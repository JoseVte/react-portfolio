import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string; url: string };
    sidebarOpen: boolean;

    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;

    [key: string]: unknown; // This allows for additional properties...
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
    name: string;
    value: string;
}

export interface GitHubRepository {
    name: string;
    updated_at: string;
    description: string;
    html_url: string;
    stargazers_count: number;
    forks_count: number;
    open_issues_count: number;
    size: number;
    language: string | undefined;
    homepage: ?string;
    license: ?string;
    owner: {
        login: string;
        avatar_url: string;
    };
}
