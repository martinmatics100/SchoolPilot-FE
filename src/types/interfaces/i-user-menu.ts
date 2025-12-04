export interface IUserMenuItem {
    id: number;
    path?: string;
    title: string;
    icon: string;
    color?: string;
    action?: () => void;
}