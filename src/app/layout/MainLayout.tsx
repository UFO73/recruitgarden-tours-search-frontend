import { Link, Outlet } from 'react-router-dom';

import styles from './MainLayout.module.scss';

export function MainLayout() {
  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link className={styles.brand} to="/">
            RecruitGarden Tours
          </Link>
        </div>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
