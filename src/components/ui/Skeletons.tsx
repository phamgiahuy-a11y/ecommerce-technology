export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-square animate-pulse bg-neutral-200" />
      <div className="p-3.5 space-y-2.5">
        <div className="h-3 w-16 animate-pulse rounded bg-neutral-200" />
        <div className="h-4 w-full animate-pulse rounded bg-neutral-200" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-neutral-200" />
        <div className="h-4 w-20 animate-pulse rounded bg-neutral-200" />
        <div className="h-5 w-24 animate-pulse rounded bg-neutral-200" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function Spinner({ size = 24 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center py-12">
      <div
        className="animate-spin rounded-full border-2 border-neutral-200 border-t-blue-600"
        style={{ width: size, height: size }}
      />
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-neutral-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
