import type { PropsWithChildren } from 'react';

import {
  QueryClient,
  QueryClientProvider,
  type DefaultOptions
} from '@tanstack/react-query';

const defaultOptions: DefaultOptions = {
  queries: {
    refetchOnWindowFocus: false,
    retry: 1
  }
};

const queryClient = new QueryClient({
  defaultOptions
});

export function QueryProvider({ children }: PropsWithChildren) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
