interface RoundupSectionHeaderProps {
  title: string;
  subtitle?: string;
}

// Matches the landing page section-header pattern: a top border, generous top
// padding, centered title in font-semibold with a muted subtitle.
export const RoundupSectionHeader = ({ title, subtitle }: RoundupSectionHeaderProps) => {
  return (
    <div className='px-6 pt-20 pb-10 border-t'>
      <div className='flex flex-col items-center gap-2 text-center'>
        <h2 className='text-3xl font-semibold'>{title}</h2>
        {subtitle && <p className='text-muted-foreground max-w-2xl'>{subtitle}</p>}
      </div>
    </div>
  );
};
