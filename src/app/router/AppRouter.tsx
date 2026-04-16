import { Route, Routes } from 'react-router-dom';

import { SearchPage } from '@pages/SearchPage';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<SearchPage />} />
    </Routes>
  );
}
