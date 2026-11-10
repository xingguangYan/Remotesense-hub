import { Suspense } from "react"
import { loadDataset } from "@cn/lib/data"
import { DemandsListCN } from "@cn/components/DemandsListCN"

export default function DemandsPage() {
  const dataset = loadDataset()

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="h-8 w-48 animate-pulse rounded bg-muted/60" />
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-[136px] animate-pulse rounded-lg border border-border bg-muted/40"
              />
            ))}
          </div>
        </div>
      }
    >
      <DemandsListCN demands={dataset.demands} />
    </Suspense>
  )
}
