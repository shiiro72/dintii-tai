'use client';

import { PropsWithChildren, useEffect, useState } from 'react';
import DashboardHeader from './DashboardHeader';
import Sidebar from '../Sidebar';
import { isTouchDevice } from '@/helpers';

export default function DashboardClientWrapper({
  children,
}: PropsWithChildren) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // On desktop, we want it open by default.
    // On touch devices, it should be closed by default.
    if (!isTouchDevice()) {
      setMenuOpen(true);
    }
  }, []);

  return (
    <div className='min-h-screen'>
      <Sidebar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <div className='flex flex-1 flex-col'>
        <DashboardHeader menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
        <div
          className={`transition-all duration-300 ${
            menuOpen ? 'md:ml-64' : 'ml-0'
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
