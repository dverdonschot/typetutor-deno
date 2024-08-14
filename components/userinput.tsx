import Countdown from "../islands/Countdown.tsx";
import KeyLogger from '../islands/KeyLogger.tsx';

export function Userinput() {
  const date = new Date();
  return (
     <div class="col-span-10 min-h-[300px] rounded-lg bg-slate-400 shadow">
        <p>
          The big event is happening <Countdown target={date.toISOString()} />.
        </p>

        <textarea id="typefield" rows = {10} placeholder="Start typing here..."></textarea>
        <KeyLogger />
      </div>
  );
}
