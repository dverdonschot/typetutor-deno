
interface DescriptionProps {
  description: string;
}


export function Description({ description }: DescriptionProps) {
  return (
    <p class="flex-auto text-tt-darkblue text-center text-xl font-medium min-h-[60px] flex items-center justify-center w-full">
      {description}
    </p>
  );
}
