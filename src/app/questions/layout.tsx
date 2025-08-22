
import { RonkaCourseSection } from "@/components/course-promo";

export default function QuestionsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <main className="relative container flex min-h-screen flex-col">
        <div className="flex flex-1 md:py-4 py-2">
            <div className="w-full">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-3 md:px-4 py-2">
                        {children}
                    </div>
                    <div className="md:col-span-1 md:px-4 py-2">
                        <RonkaCourseSection />
                    </div>
                </div>
            </div>
        </div>
    </main>
}
