import { cn } from "@/services/utils";

const Section = ({
  dark,
  children,
}: {
  dark?: boolean;
  children: React.ReactNode;
}) => {
  return (
    <section
      className={cn(
        dark
          ? "w-full py-12 md:py-24 lg:py-32"
          : `w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800`
      )}
    >
      {children}
    </section>
  );
};

export { Section };