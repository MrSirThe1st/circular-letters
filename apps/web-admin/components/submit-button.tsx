'use client';

import type { JSX, ReactNode } from 'react';
import { useFormStatus } from 'react-dom';

type SubmitButtonProps = Readonly<{
  children: ReactNode;
  pendingLabel: string;
}>;

export function SubmitButton({ children, pendingLabel }: SubmitButtonProps): JSX.Element {
  const { pending } = useFormStatus();

  return (
    <button className="button" disabled={pending} type="submit">
      {pending ? pendingLabel : children}
    </button>
  );
}