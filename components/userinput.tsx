import KeyLogger from '../islands/KeyLogger.tsx';
import GamestateRandom from '../islands/GamestateRandom.tsx';

export function Userinput() {
  const date = new Date();
  return (
     <div class="col-span-10 min-h-[300px] rounded-lg bg-slate-400 shadow">

        <textarea id="typefield" rows = {10} placeholder="Start typing here..."></textarea>
        <KeyLogger />
      </div>
  );
}
