'use client';

import { createContext, ReactNode, useContext, useState } from 'react';
import Dialog from '../components/Dialog';
import NotificationMessageLine from '../molecules/NotificationMessageLine';

export const DialogContext = createContext<{
  isOpen: boolean;
  handleClick: (
    content: ReactNode,
    headline?: string,
    className?: string
  ) => void;
  closeDialog: () => void;
  showFeedback: (type: 'success' | 'error', message: string) => void;
} | null>(null);

export default function DialogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<ReactNode>(null);
  const [headline, setHeadline] = useState('');
  const [className, setClassName] = useState('');
  const [, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setIsOpen(true);
    setContent(
      <NotificationMessageLine
        message={message}
        iconName={type === 'success' ? 'check_circle' : 'error'}
        notificationIconColor={`${type === 'success' ? 'text-green-500' : 'text-red-500'}`}
      />
    );
    setClassName('text-xl');
  };

  const handleClick = (
    customContent: ReactNode,
    headline?: string,
    className?: string
  ) => {
    setIsOpen(true);
    setContent(customContent);
    setHeadline(headline || '');
    setClassName(className || '');
  };

  const closeDialog = () => {
    setIsOpen(false);

    setContent(null);
  };

  return (
    <DialogContext.Provider
      value={{ isOpen, handleClick, closeDialog, showFeedback }}
    >
      <Dialog
        isOpen={isOpen}
        onClose={closeDialog}
        headline={headline}
        className={className}
      >
        {content}
      </Dialog>
      {children}
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const context = useContext(DialogContext);

  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }

  return context;
}
