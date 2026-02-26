import ZenNavbar from './components/ZenNavbar';
import Hero from './components/Hero';
import Manifesto from './components/Manifesto';
import Philosophy from './components/Philosophy';
import Superfilter from './components/Superfilter';
import Mission from './components/Mission';
import Footer from './components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen relative">
      <ZenNavbar />
      <Hero />
      <Manifesto />
      <Philosophy />
      <Superfilter />
      <Mission />
      <Footer />
    </main>
  );
}
