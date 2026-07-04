import { RouterProvider } from '@heroui/react/rac';
import { ToastProvider } from '@heroui/react/toast';
import { useHref, useNavigate } from 'react-router-dom';

export default function HeroUIProvider({ children }) {
  const navigate = useNavigate();

  return (
    <RouterProvider navigate={navigate} useHref={useHref}>
      <ToastProvider placement="top-right" />
      {children}
    </RouterProvider>
  );
}
