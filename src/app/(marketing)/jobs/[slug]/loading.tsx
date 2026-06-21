import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-8">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-8 w-28 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-36 rounded-full" />
            </div>
            <Skeleton className="mt-5 h-12 w-3/4" />
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-5 w-full" />
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Skeleton className="h-8 w-20 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-28 rounded-full" />
            </div>
            <div className="mt-6 flex gap-3">
              <Skeleton className="h-11 w-36 rounded-full" />
              <Skeleton className="h-11 w-32 rounded-full" />
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="mt-4 h-28 w-full" />
            <Skeleton className="mt-6 h-8 w-40" />
            <Skeleton className="mt-4 h-24 w-full" />
          </div>
        </div>

        <div className="space-y-6">
          <Skeleton className="h-64 rounded-[2rem]" />
          <Skeleton className="h-40 rounded-[2rem]" />
          <Skeleton className="h-80 rounded-[2rem]" />
        </div>
      </div>
    </div>
  );
}
