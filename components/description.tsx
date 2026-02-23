interface DescriptionProps {
  description: string;
}

export function Description({ description }: DescriptionProps) {
  return (
    <p class="description-text">
      {description}
    </p>
  );
}
