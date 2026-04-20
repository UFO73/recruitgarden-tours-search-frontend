import { Outlet } from 'react-router-dom';

import styles from './MainLayout.module.scss';

export function MainLayout() {
  return (
    <div className={styles.root}>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
