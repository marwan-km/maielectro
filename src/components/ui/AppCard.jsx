import { Card } from '@heroui/react/card';

export default function AppCard({ children, className = '', ...props }) {
  return (
    <Card className={`rounded-3xl border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-card-dark ${className}`} {...props}>
      {children}
    </Card>
  );
}

export const AppCardHeader = Card.Header;
export const AppCardBody = Card.Content;
export const AppCardFooter = Card.Footer;
export const AppCardTitle = Card.Title;
export const AppCardDescription = Card.Description;
