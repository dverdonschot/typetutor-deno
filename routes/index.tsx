import { PageProps } from '$fresh/server.ts';
import { Menu } from "../components/menu.tsx";
import { Logo } from "../components/logo.tsx";
import { Description } from "../components/description.tsx";
import { Random } from "../components/random.tsx";

export default function Home(props: PageProps) {
  const date = new Date();
  date.setHours(date.getHours() + 1);
  return (
    <div class="m-4 flex flex-col sm:grid sm:grid-cols-12 gap-4 flex-grow">
      <div class="sm:col-span-12 order-1"><Logo /></div>
 
      <div class="sm:col-span-12 order-3 sm:order-2"><Description description="The place to train your Touch Typing skills!!" /></div>
 
      <div class="sm:col-span-12 order-2 sm:order-3 flex flex-col sm:flex-row gap-4">
          <div class="w-full sm:w-auto sm:flex-none sm:col-span-3 order-2 sm:order-1"><Menu /></div>
          <div class="w-full sm:flex-grow sm:col-span-9 order-1 sm:order-2"><Random /></div>
      </div>
    </div>
  );
}
