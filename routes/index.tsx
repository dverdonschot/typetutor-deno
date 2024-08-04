import { useSignal } from "@preact/signals";
import Countdown from "../islands/Countdown.tsx";

export default function Home() {
  const date = new Date();
  date.setHours(date.getHours() + 1);
  return (
    <div class="container mx-auto">
      <header class="bg-emerald-800" >
        <h1>Typetutor: The place to train your Touch Typing skills!!</h1>
      </header>
      <div class="main-content">
        <nav class="menu">
          <ul>
            <li><a href="#">Random Words</a></li>
            <li><a href="#">Letters</a></li>
            <li><a href="#">Quotes</a></li>
            <li><a href="#">Custom Text</a></li>
          </ul>
        </nav>
        <div class="typing-field">
          <p>
            The big event is happening <Countdown target={date.toISOString()} />.
          </p>

          <textarea id="typefield" rows = {10} placeholder="Start typing here..."></textarea>
        </div>
      </div>
    </div>
  );
}
