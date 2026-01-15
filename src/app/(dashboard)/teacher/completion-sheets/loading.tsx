import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div>
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-4 w-96" />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="border-slate-200">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <Skeleton className="h-5 w-24 mb-2" />
                                <Skeleton className="h-5 w-5 rounded-full" />
                            </div>
                            <Skeleton className="h-7 w-48 mb-1" />
                            <Skeleton className="h-4 w-16" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4 mt-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-20" />
                            </div>
                            <Skeleton className="h-1.5 w-full mt-4 rounded-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
