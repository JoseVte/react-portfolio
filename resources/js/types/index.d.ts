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

export interface PlayroomGame {
    id: number;
    name: string;
    description_en: string;
    description_es: string;
    category_en: string;
    category_es: string;
    order: number;
    image_url: string;
}

export interface SteamInfo {
    summary: {
        nick: string;
        avatar: string;
        url: string;
        achievements: number;
    };
    owned_games: Array<{
        name: string;
        steam_url: string;
        icon_url: string;
        default_icon_url: string;
        time: {
            '2weeks': number;
            total: number;
        };
    }>;
    recently_games: Array<{
        name: string;
        steam_url: string;
        website: string;
        style: {
            background: string;
            image: string;
            capsule_image: string;
            capsule_imagev5: string;
        };
        time: {
            '2weeks': number;
            total: number;
        };
        achievements: {
            current: number;
            total: number;
        };
    }>;
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
