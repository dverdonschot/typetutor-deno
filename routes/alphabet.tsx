import { PageProps } from '$fresh/server.ts';
import { Menu } from "../components/menu.tsx";
import { Logo } from "../components/logo.tsx";
import { Description } from "../components/description.tsx";
import { Alphabet } from "../components/alphabet.tsx";

export default function alphabet(props: PageProps) {
  const date = new Date();
  date.setHours(date.getHours() + 1);
  return (
    <div class="m-4 grid gap-2 sm:grid-cols-12 flex-grow">
      <Logo />
      <Description description="Type the Alphabet as fas as you can!!" />
      <Menu />
      <Alphabet />
    </div>
  );
}
