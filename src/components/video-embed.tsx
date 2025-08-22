import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Play } from "lucide-react"

interface VideoEmbedProps {
    videoId?: string
    videoUrl?: string
    title: string
}

export function VideoEmbed({ videoId, videoUrl, title }: VideoEmbedProps) {
    const getEmbedSrc = (id?: string, url?: string) => {
        if (url) {
            try {
                if (url.includes("/embed/")) return url
                const parsed = new URL(url)
                const vParam = parsed.searchParams.get("v")
                if (vParam) return `https://www.youtube.com/embed/${vParam}`
                if (parsed.hostname.includes("youtu.be")) {
                    const pathId = parsed.pathname.replace("/", "")
                    if (pathId) return `https://www.youtube.com/embed/${pathId}`
                }
            } catch {
                // ignore parsing errors
            }
        }
        if (id) return `https://www.youtube.com/embed/${id}`
        return ""
    }

    const src = getEmbedSrc(videoId, videoUrl)
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Play className="h-5 w-5 text-primary" />
                    הסבר וידאו כיצד לפתור את השאלה
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                    <iframe
                        src={src}
                        title={`Video explanation for ${title}`}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            </CardContent>
        </Card>
    )
}
