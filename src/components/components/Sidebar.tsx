'use client';

import NavigationGroup from '../molecules/NavigationGroup';
import {
  defaultDictionaryEntries,
  useDictionary,
} from '../providers/DictionaryProvider';
import { useState } from 'react';
import { signOut } from '@/supabase/actions/userActions';
import {
  DASHBOARD_PATH,
  NEW_USER_PATH,
  PATIENTS_PATH,
  STUDIO_PATH,
  TODOS_PATH,
} from '@/types/GlobalTypes';
import { MenuProps } from './Dashboard/DashboardHeader';
import { isTouchDevice } from '@/helpers';

export default function Sidebar({ menuOpen, setMenuOpen }: MenuProps) {
  const dictionary = useDictionary();
  const [activeTab, setActiveTab] = useState<string | null>('');

  const {
    menu,
    general,
    addNewUser,
    adults,
    minors,
    dashboard,
    studio,
    logout,
    todoHeadline,
  } = dictionary || defaultDictionaryEntries;

  const menuLinks = [
    {
      name: dashboard || '',
      href: DASHBOARD_PATH,
      icon: 'dashboard',
    },
    {
      name: adults || 'Adults',
      href: `${PATIENTS_PATH}/adult`,
      icon: 'account_box',
    },
    {
      name: minors || 'Minors',
      href: `${PATIENTS_PATH}/minor`,
      icon: 'account_circle',
    },
    {
      name: todoHeadline || 'To-Do List',
      href: TODOS_PATH,
      icon: 'check_box',
    },
  ];
  const generalLinks = [
    {
      name: studio || '',
      href: STUDIO_PATH,
      icon: 'edit_note',
      target: '_blank',
    },
    {
      name: addNewUser || '',
      href: NEW_USER_PATH,
      icon: 'person_add',
    },
    {
      name: logout || '',
      onClick: () => {
        signOut();
      },
      icon: 'exit_to_app',
    },
  ];

  return (
    <aside
      id='logo-sidebar'
      className={`bg-base-dark border-background fixed left-0 z-40 h-screen w-64 -translate-x-full border-r pt-20 transition-transform ${
        menuOpen ? 'translate-x-0' : ''
      }`}
      aria-label='Sidebar'
    >
      <nav className='bg-base-dark h-full space-y-8 overflow-y-auto px-3 pb-4'>
        <NavigationGroup
          groupTitle={menu ?? ''}
          navigationLinks={menuLinks}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onClick={() => isTouchDevice() && setMenuOpen(false)}
        />
        <NavigationGroup
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          groupTitle={general ?? ''}
          navigationLinks={generalLinks}
          onClick={() => isTouchDevice() && setMenuOpen(false)}
        />
      </nav>
    </aside>
  );
}
