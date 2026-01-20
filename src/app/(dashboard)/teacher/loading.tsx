import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-40" />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="border-0 shadow-sm bg-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Skeleton className="h-4 w-24 mb-2" />
                                    <Skeleton className="h-8 w-12" />
                                </div>
                                <Skeleton className="h-12 w-12 rounded-xl" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid lg:grid-cols-3 gap-6">
                <Card className="border-0 shadow-sm bg-white lg:col-span-2">
                    <CardHeader>
                        <Skeleton className="h-6 w-64 mb-2" />
                        <Skeleton className="h-4 w-96" />
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full flex items-end justify-between gap-2 pt-4 px-2">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <Skeleton
                                    key={i}
                                    className="w-full rounded-t-lg"
                                    style={{ height: `${Math.random() * 60 + 20}%` }}
                                />
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                    <CardHeader>
                        <Skeleton className="h-6 w-32 bg-white/20" />
                        <Skeleton className="h-4 w-48 bg-white/20" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                            <Skeleton className="h-4 w-40 bg-white/20 mb-2" />
                            <Skeleton className="h-8 w-32 bg-white/20" />
                            <Skeleton className="h-3 w-24 bg-white/20 mt-2" />
                        </div>

                        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                            <Skeleton className="h-4 w-32 bg-white/20 mb-2" />
                            <Skeleton className="h-8 w-40 bg-white/20" />
                            <Skeleton className="h-3 w-24 bg-white/20 mt-2" />
                        </div>

                        <div className="pt-4">
                            <Skeleton className="h-10 w-full bg-white/20 rounded-md" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
