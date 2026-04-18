import { Route, Routes } from 'react-router-dom';

import { MainLayout } from '@app/layout';
import { SearchPage } from '@pages/SearchPage';
import { TourPage } from '@pages/TourPage';

export function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<SearchPage />} />
        <Route path="/tour/:priceId/:hotelId" element={<TourPage />} />
      </Route>
    </Routes>
  );
}
