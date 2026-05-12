import { useApp } from '@/hooks/useAppContext';

export default function Toast() {
  const { toast } = useApp();

  return (
    <div className={`toast ${toast.visible ? 'show' : ''}`}>
      <span style={{ fontSize: '1.3rem' }}>{toast.icon}</span>
      <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{toast.message}</span>
    </div>
  );
}
