import { Link, LinkProps } from "react-router-dom";
import { useCallback, useRef, ReactNode } from "react";
import usePrefetch from "@/hooks/usePrefetch";

interface PrefetchLinkProps extends LinkProps {
  productId?: string;
  children: ReactNode;
  prefetchDelay?: number;
}

const PrefetchLink = ({
  productId,
  children,
  prefetchDelay = 100,
  ...linkProps
}: PrefetchLinkProps) => {
  const { prefetchProduct } = usePrefetch();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = useCallback(() => {
    if (!productId) return;
    
    timeoutRef.current = setTimeout(() => {
      prefetchProduct(productId);
    }, prefetchDelay);
  }, [productId, prefetchProduct, prefetchDelay]);

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const handleTouchStart = useCallback(() => {
    if (productId) {
      prefetchProduct(productId);
    }
  }, [productId, prefetchProduct]);

  return (
    <Link
      {...linkProps}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
    >
      {children}
    </Link>
  );
};

export default PrefetchLink;
