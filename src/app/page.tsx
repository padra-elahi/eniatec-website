import { Contact } from '@/components/Contact';
import { Cursor } from '@/components/Cursor';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Process } from '@/components/Process';
import { Products } from '@/components/Products';
import { ScrollProgress } from '@/components/ScrollProgress';
import { Services } from '@/components/Services';
import { Stack } from '@/components/Stack';
import { Stats } from '@/components/Stats';

export default function Home() {
  return (
    <>
      <ScrollProgress />
      <Cursor />
      <Header />
      <main>
        <Hero />
        <Stats />
        <Services />
        <Products />
        <Process />
        <Stack />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
