import { Reveal } from './Reveal';

type Props = { eyebrow: string; title: string; accent?: string; desc?: string; center?: boolean };

/** The shared eyebrow + headline + description block above every section. */
export function SectionHeading({ eyebrow, title, accent, desc, center = true }: Props) {
  return (
    <div className={center ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      <Reveal>
        <span className="chip border-brand/30 text-brand-light">{eyebrow}</span>
      </Reveal>
      <Reveal delay={0.08}>
        <h2 className="heading mt-5">
          {title} {accent && <span className="gradient-text">{accent}</span>}
        </h2>
      </Reveal>
      {desc && (
        <Reveal delay={0.16}>
          <p className="muted mt-5 text-[15px] leading-[2.1]">{desc}</p>
        </Reveal>
      )}
    </div>
  );
}
