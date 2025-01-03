import { PageProps } from '$fresh/server.ts';
import { Menu } from "../components/menu.tsx";
import { Logo } from "../components/logo.tsx";
import { Description } from "../components/description.tsx";
import { Random } from "../components/random.tsx";

export default function Home(props: PageProps) {
  const date = new Date();
  date.setHours(date.getHours() + 1);
  return (
    <div class="m-4 grid gap-2 sm:grid-cols-12 flex-grow">
      <Logo />
      <Description description="The place to train your Touch Typing skills!!" />
      <Menu />
      <Random />
    </div>
  );
}
