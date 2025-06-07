export interface INavbarItem {
    id: number;
    path: string;
    title: string;
    icon: string;
    active: boolean;
    group: string;
    roles: string[];
}