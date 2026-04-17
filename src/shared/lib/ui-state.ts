export type ViewStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error';

export interface ViewState<T> {
  status: ViewStatus;
  data?: T;
  errorMessage?: string;
}
