export interface ActivityLog {
    id: string;
    userId: string;
    userFirstName: string;
    userLastName: string;
    category: string;
    summary: string;
    createdOn: string;
    entityType: string;
    actionId: number;
}

export interface ActivityLogDetail {
    fieldName: string;
    oldValue: string;
    newValue: string;
}

export interface ActivityLogResponse {
    items: ActivityLog[];
    itemCount: number;
    totalCount?: number;
}

export interface ActivityLogParams {
    page: number;
    pageLength: number;
    sortBy: string;
    order: 'asc' | 'desc';
}