import { cn } from "@/services/utils";

const Section = ({
  dark,
  id,
  children,
}: {
  id?: string;
  dark?: boolean;
  children: React.ReactNode;
}) => {
  return (
    <section
      id={id}
      className={cn(
        dark
          ? "w-full py-12 md:py-24 lg:py-32"
          : `w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800`
      )}
    >
      <div className="container px-4 md:px-6">{children}</div>
    </section>
  );
};

export { Section };
