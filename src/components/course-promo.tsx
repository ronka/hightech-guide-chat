import { RonkaCourseButton } from "./landing-page/buttons";
import { Card, CardContent } from "./ui/card";

const RonkaCourseSection = () => {
    return (
        <Card className="w-full rounded-lg shadow-lg">
            <div className="relative overflow-hidden rounded-t-lg">
                <img
                    src="https://hightechguide.co.il/_next/image?url=%2Fcourse-assets%2Fcover.png&w=640&q=75"
                    alt="Book Cover"
                    className="aspect-[16/9] bg-gray-300 w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
            </div>
            <CardContent className="space-y-4 p-4 -mt-4">
                <div>
                    <h3 className="text-lg font-bold">
                        לעבור את ראיון העבודה הבא שלך בהצלחה
                    </h3>
                    <p className="text-muted-foreground">
                        קורס דיגיטלי מקיף עם +25 שיעורים מעשיים, כשעתיים של וידאו, וליווי של
                        מראיין בכיר.
                    </p>
                </div>
                <RonkaCourseButton />
            </CardContent>
        </Card>
    );
};

export { RonkaCourseSection }