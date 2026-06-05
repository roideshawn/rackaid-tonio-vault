import Link from 'next/link';
import AdminThemeEditor from '../AdminThemeEditor';

export default function ThemeEnginePage() {
  return (
    <div className="min-h-screen bg-black pt-8 pb-24 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link href="/admin" className="text-zinc-500 hover:text-white font-mono text-xs uppercase tracking-widest transition-colors">
            ← Back to Hub
          </Link>
        </div>
        <AdminThemeEditor />
      </div>
    </div>
  );
}