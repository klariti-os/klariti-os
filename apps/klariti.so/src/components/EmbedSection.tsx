import PillButton from "@/components/PillButton";

interface EmbedSectionProps {
  title: string;
  description: string;
  embedSrc: string;
  buttonHref: string;
  buttonText: string;
  allowAttributes?: string;
}

const EmbedSection: React.FC<EmbedSectionProps> = ({
  title,
  description,
  embedSrc,
  buttonHref,
  buttonText,
  allowAttributes = "fullscreen",
}) => {
  return (
    <div className="mb-16">
      <h2 className="mb-2 font-serif text-xl font-normal text-foreground">
        {title}
      </h2>
      <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>

      <div className="overflow-hidden rounded-xl border border-border">
        <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
          <iframe
            loading="lazy"
            className="absolute inset-0 h-full w-full"
            src={embedSrc}
            allowFullScreen
            allow={allowAttributes}
            title={title}
          />
        </div>
      </div>

      <div className="mt-4">
        <PillButton href={buttonHref} target="_blank">
          {buttonText}
        </PillButton>
      </div>
    </div>
  );
};

export default EmbedSection;
