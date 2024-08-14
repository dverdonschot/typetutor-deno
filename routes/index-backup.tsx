import { h } from 'preact';
import { PageProps } from '$fresh/server.ts';
import KeyLogger from '../islands/KeyLogger.tsx';

import Countdown from "../islands/Countdown.tsx";

export default function Home(props: PageProps) {
  const date = new Date();
  date.setHours(date.getHours() + 1);
  return (
    <div class="container mx-auto text-">
      <div class="min-h-[100px] rounded-lg bg-emerald-500">
        <h1>Typetutor: The place to train your Touch Typing skills!!</h1>
      </div>
      <div class="main-content">
        <nav class="menu">
          <ul>
            <li><a href="/random">Random Words</a></li>
            <li><a href="/random/letters">Letters</a></li>
            <li><a href="/quotes">Quotes</a></li>
            <li><a href="/custom">Custom Text</a></li>
          </ul>
        </nav>
        <div class="typing-field">
          <p>
            The big event is happening <Countdown target={date.toISOString()} />.
          </p>

          <textarea id="typefield" rows = {10} placeholder="Start typing here..."></textarea>
          <KeyLogger />
        </div>
      </div>
    </div>
  );
}
