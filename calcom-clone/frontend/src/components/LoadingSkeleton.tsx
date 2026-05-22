export function CardSkeleton() {
  return <div className="h-[104px] rounded-lg border border-gray-200 bg-gray-200/70 animate-pulse" />;
}

export function RowSkeleton() {
  return <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />;
}

export function SlotSkeleton() {
  return <div className="h-10 rounded-md bg-gray-200 animate-pulse" />;
}
