// src/providers/QueryClientProvider.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode } from 'react';

const isProduction = process.env.NODE_ENV === 'production';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: isProduction ? 1000 * 60 * 10 : 1000 * 60 * 5,
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

export const ReactQueryProvider = ({ children }: { children: ReactNode }) => {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
};