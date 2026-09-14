import Link from 'next/link';
import { Logo } from '@/components/Logo';

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <Logo className="text-3xl" />
        <p className="gradient-text mt-8 text-7xl font-black">۴۰۴</p>
        <h1 className="mt-4 text-xl font-bold">این صفحه پیدا نشد</h1>
        <p className="muted mt-3 text-sm">ممکن است آدرس را اشتباه وارد کرده باشید.</p>
        <Link href="/" className="btn-primary mt-8">
          بازگشت به خانه
        </Link>
      </div>
    </main>
  );
}
