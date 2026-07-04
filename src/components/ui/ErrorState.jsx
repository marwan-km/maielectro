import { Alert } from '@heroui/react/alert';

export default function ErrorState({ message = 'Une erreur est survenue.', className = '' }) {
  return (
    <Alert className={`rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300 ${className}`}>
      <Alert.Content>
        <Alert.Title>Erreur</Alert.Title>
        <Alert.Description>{message}</Alert.Description>
      </Alert.Content>
    </Alert>
  );
}
