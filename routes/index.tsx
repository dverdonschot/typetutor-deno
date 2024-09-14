import { PageProps } from '$fresh/server.ts';
import { Menu } from "../components/menu.tsx";
import { Logo } from "../components/logo.tsx";
import { Description } from "../components/description.tsx";
import { Userinput } from "../components/userinput.tsx";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../islands/alert.tsx";

export default function Home(props: PageProps) {
  const date = new Date();
  date.setHours(date.getHours() + 1);
  return (
    <div class="m-4 grid gap-2 sm:grid-cols-12 flex-grow">
      <Logo />
      <Description description="The place to train your Touch Typing skills!!" />
      <Menu />
      <Userinput />
      <Alert>
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>
          You can add components and dependencies to your app using the cli.
        </AlertDescription>
      </Alert>
    </div>
  );
}
