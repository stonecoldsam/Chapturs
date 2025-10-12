import AppLayout from '@/components/AppLayout';
import ReaderMonetizationSettings from '@/components/ReaderMonetizationSettings';

export default function ReaderSettingsPage() {
  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Reader Settings</h1>
        <ReaderMonetizationSettings />
      </div>
    </AppLayout>
  );
}
