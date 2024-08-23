
interface DescriptionProps {
  description: string;
}


export function Description({ description }: DescriptionProps) {
  return (
    <div class="flex items-center col-span-10 min-h-[100px] rounded-lg bg-orange-500 shadow">
      <p class="flex-auto text-center">`{description}`</p>
    </div>
 
  );
}
