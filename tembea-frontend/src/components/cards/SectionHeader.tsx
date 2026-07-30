type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

export function SectionHeader({ eyebrow, title, description }: SectionHeaderProps) {
  return (
    <div className="stack-sm">
      <p className="section-kicker">{eyebrow}</p>
      <h2 className="section-heading">{title}</h2>
      {description ? <p className="max-w-2xl text-muted">{description}</p> : null}
    </div>
  );
}
