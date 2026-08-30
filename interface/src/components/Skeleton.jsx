const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-700 rounded ${className}`} />
);

const SkeletonText = ({ lines = 3, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} className="h-4 w-full" />
    ))}
  </div>
);

const SkeletonCard = () => (
  <div className="bg-gray-800 rounded-lg p-6 space-y-4">
    <Skeleton className="h-6 w-1/3" />
    <SkeletonText lines={3} />
  </div>
);

export { Skeleton, SkeletonText, SkeletonCard };
