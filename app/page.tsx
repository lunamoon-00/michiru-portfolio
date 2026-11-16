// トップページ。部品を上から順に並べているだけ
import { Backdrop, Hud, Cursor, CaseDialog, Transition, Intro } from '@/components/Overlays';
import { Nav } from '@/components/Nav';
import { Hero, Impact, Numbers, Works, Contact } from '@/components/Sections';
import { Experience } from '@/components/Experience';

export default function Home() {
  return (
    <>
      <Backdrop />
      <Hud />
      <Cursor />
      <CaseDialog />
      <Transition />
      <Intro />
      <Nav />
      <main>
        <Hero />
        <Impact />
        <Numbers />
        <Works />
        <Contact />
      </main>
      <footer>© 2026 MICHIRU — BUILT WITH CLAUDE CODE</footer>
      <Experience />
    </>
  );
}
