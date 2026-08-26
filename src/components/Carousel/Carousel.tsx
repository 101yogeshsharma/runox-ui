"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { cn } from "../../utils/cn";
import { Box } from "../../atoms/Box";
import { Button } from "../Button/Button";
import { useThrottledEvent } from "../../hooks/use-throttled-event";
import { rnx } from "../../utils/rnx";

import "./Carousel.css";

type CarouselApi = {
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: () => boolean;
  canScrollNext: () => boolean;
  getSelectedIndex: () => number;
  getSlideCount: () => number;
  scrollTo: (index: number) => void;
  on: (event: string, callback: (api: CarouselApi) => void) => void;
  off: (event: string, callback: (api: CarouselApi) => void) => void;
};

type CarouselOptions = {
  align?: "start" | "center" | "end";
  loop?: boolean;
  axis?: "x" | "y"; // For backward compatibility if used
};
type CarouselPlugin = Record<string, unknown>;

type CarouselProps = {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: "horizontal" | "vertical";
  setApi?: (api: CarouselApi) => void;
  effect?: "slide" | "fade" | "flip";
};

type CarouselContextProps = {
  carouselRef: React.RefObject<HTMLDivElement | null>;
  api: CarouselApi | null;
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  selectedIndex: number;
  slideCount: number;
  scrollTo: (index: number) => void;
} & CarouselProps;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);
  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }
  return context;
}

const CarouselRoot = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & CarouselProps
>(
  (
    {
      orientation = "horizontal",
      opts,
      setApi,
      plugins: _plugins,
      className,
      children,
      effect = "slide",
      ...props
    },
    ref,
  ) => {
    const carouselRef = React.useRef<HTMLDivElement>(null);
    const [canScrollPrev, setCanScrollPrev] = React.useState(false);
    const [canScrollNext, setCanScrollNext] = React.useState(false);
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const [slideCount, setSlideCount] = React.useState(0);

    React.useEffect(() => {
      if (!carouselRef.current) return;
      const container = carouselRef.current.firstElementChild as HTMLElement;
      if (!container || container.children.length === 0) return;

      const snapAlign =
        opts?.align === "center"
          ? "center"
          : opts?.align === "end"
            ? "end"
            : "start";

      // Only apply scrollSnapAlign to actual slides (role="group"), not the
      // padding spacer boxes at the start/end of CarouselContent.
      const items = Array.from(
        container.querySelectorAll<HTMLElement>('[role="group"]'),
      );
      items.forEach((child) => {
        child.style.scrollSnapAlign = snapAlign;
      });

      if (opts?.align === "center") {
        // Use requestAnimationFrame to ensure layout is calculated
        requestAnimationFrame(() => {
          const items = Array.from(
            container.querySelectorAll('[role="group"]'),
          ) as HTMLElement[];
          if (!items.length) return;
          const firstChild = items[0];
          const lastChild = items[items.length - 1];
          const viewport = carouselRef.current;
          if (!viewport) return;

          if (orientation === "horizontal") {
            const padLeft = (viewport.clientWidth - firstChild.offsetWidth) / 2;
            const padRight = (viewport.clientWidth - lastChild.offsetWidth) / 2;
            container.style.setProperty("--pad-start", `${padLeft}px`);
            container.style.setProperty("--pad-end", `${padRight}px`);
          } else {
            const padTop =
              (viewport.clientHeight - firstChild.offsetHeight) / 2;
            const padBottom =
              (viewport.clientHeight - lastChild.offsetHeight) / 2;
            container.style.setProperty("--pad-start", `${padTop}px`);
            container.style.setProperty("--pad-end", `${padBottom}px`);
          }
        });
      } else {
        // Reset padding if not centered
        container.style.removeProperty("--pad-start");
        container.style.removeProperty("--pad-end");
      }
    }, [opts?.align, orientation]);

    const api = React.useMemo<CarouselApi>(() => {
      const listeners: Record<string, ((api: CarouselApi) => void)[]> = {};

      const _listeners: Record<string, ((api: CarouselApi) => void)[]> = {};

      const _checkPhysicalScrollPrev = () => {
        if (!carouselRef.current) return false;
        const container = carouselRef.current;
        return orientation === "horizontal"
          ? container.scrollLeft > 0
          : container.scrollTop > 0;
      };

      const _checkPhysicalScrollNext = () => {
        if (!carouselRef.current) return false;
        const container = carouselRef.current;
        if (orientation === "horizontal") {
          return (
            container.scrollLeft + container.clientWidth <
            container.scrollWidth - 1
          );
        } else {
          return (
            container.scrollTop + container.clientHeight <
            container.scrollHeight - 1
          );
        }
      };

      const getCanScrollPrevFn = () => {
        if (opts?.loop) return true;
        if (!carouselRef.current) return false;
        const container = carouselRef.current;
        return orientation === "horizontal"
          ? container.scrollLeft > 0
          : container.scrollTop > 0;
      };

      const getCanScrollNextFn = () => {
        if (opts?.loop) return true;
        if (!carouselRef.current) return false;
        const container = carouselRef.current;
        if (orientation === "horizontal") {
          return (
            container.scrollLeft + container.clientWidth <
            container.scrollWidth - 1
          );
        } else {
          return (
            container.scrollTop + container.clientHeight <
            container.scrollHeight - 1
          );
        }
      };

      const scrollPrevFn = () => {
        if (carouselRef.current) {
          const container = carouselRef.current;
          const isHorizontal = orientation === "horizontal";

          const flexWrapper = container.firstElementChild as HTMLElement;
          const firstItem = flexWrapper?.querySelector(
            '[role="group"]',
          ) as HTMLElement;
          const scrollAmount = firstItem
            ? isHorizontal
              ? firstItem.clientWidth
              : firstItem.clientHeight
            : isHorizontal
              ? container.clientWidth
              : container.clientHeight;

          container.scrollBy({
            left: isHorizontal ? -scrollAmount : 0,
            top: isHorizontal ? 0 : -scrollAmount,
            behavior: effect === "fade" ? "auto" : "smooth",
          });
        }
      };

      const scrollNextFn = () => {
        if (carouselRef.current) {
          const container = carouselRef.current;
          const isHorizontal = orientation === "horizontal";

          const flexWrapper = container.firstElementChild as HTMLElement;
          const firstItem = flexWrapper?.querySelector(
            '[role="group"]',
          ) as HTMLElement;
          const scrollAmount = firstItem
            ? isHorizontal
              ? firstItem.clientWidth
              : firstItem.clientHeight
            : isHorizontal
              ? container.clientWidth
              : container.clientHeight;

          container.scrollBy({
            left: isHorizontal ? scrollAmount : 0,
            top: isHorizontal ? 0 : scrollAmount,
            behavior: effect === "fade" ? "auto" : "smooth",
          });
        }
      };

      const getSlideCountFn = () => {
        if (!carouselRef.current) return 0;
        const container = carouselRef.current.firstElementChild as HTMLElement;
        if (!container) return 0;
        const items = container.querySelectorAll('[role="group"]');
        return opts?.loop ? items.length / 3 : items.length;
      };

      const getSelectedIndexFn = () => {
        if (!carouselRef.current) return 0;
        const container = carouselRef.current;
        const isHorizontal = orientation === "horizontal";
        const scrollPos = isHorizontal
          ? container.scrollLeft
          : container.scrollTop;

        const flexWrapper = container.firstElementChild as HTMLElement;
        const items = flexWrapper?.querySelectorAll(
          '[role="group"]',
        ) as NodeListOf<HTMLElement>;
        if (!items || items.length === 0) return 0;

        const firstItem = items[0];
        const itemSize = isHorizontal
          ? firstItem.clientWidth
          : firstItem.clientHeight;
        if (itemSize === 0) return 0;

        const index = Math.round(scrollPos / itemSize);
        const originalCount = opts?.loop ? items.length / 3 : items.length;

        if (opts?.loop && originalCount > 0) {
          return ((index % originalCount) + originalCount) % originalCount;
        }
        return index;
      };

      const scrollToFn = (index: number) => {
        if (!carouselRef.current) return;
        const container = carouselRef.current;
        const isHorizontal = orientation === "horizontal";

        const flexWrapper = container.firstElementChild as HTMLElement;
        const items = flexWrapper?.querySelectorAll(
          '[role="group"]',
        ) as NodeListOf<HTMLElement>;
        if (!items || items.length === 0) return;

        const originalCount = opts?.loop ? items.length / 3 : items.length;
        const firstItem = items[0];
        const itemSize = isHorizontal
          ? firstItem.clientWidth
          : firstItem.clientHeight;

        let targetIndex = index;
        if (opts?.loop) {
          targetIndex = index + originalCount;
        }

        const targetScroll = targetIndex * itemSize;

        container.scrollTo({
          left: isHorizontal ? targetScroll : 0,
          top: isHorizontal ? 0 : targetScroll,
          behavior: effect === "fade" ? "auto" : "smooth",
        });
      };

      const onFn = (event: string, callback: (api: CarouselApi) => void) => {
        if (!listeners[event]) listeners[event] = [];
        listeners[event].push(callback);
      };

      const offFn = (event: string, callback: (api: CarouselApi) => void) => {
        if (!listeners[event]) return;
        listeners[event] = listeners[event].filter((cb) => cb !== callback);
      };

      const trigger = (event: string) => {
        if (listeners[event]) {
          listeners[event].forEach((cb) => cb(apiObj));
        }
      };

      const apiObj = {
        scrollPrev: scrollPrevFn,
        scrollNext: scrollNextFn,
        canScrollPrev: getCanScrollPrevFn,
        canScrollNext: getCanScrollNextFn,
        getSelectedIndex: getSelectedIndexFn,
        getSlideCount: getSlideCountFn,
        scrollTo: scrollToFn,
        on: onFn,
        off: offFn,
        _trigger: trigger,
      };
      return apiObj;
      // eslint-disable-next-line react-hooks/exhaustive-deps -- embla setter fns are stable; re-creating on them would loop
    }, [orientation, opts?.loop]);

    const onSelect = React.useCallback((api: CarouselApi) => {
      if (!api) return;
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
      setSelectedIndex(api.getSelectedIndex());
      setSlideCount(api.getSlideCount());
    }, []);

    const scrollPrev = React.useCallback(() => {
      api?.scrollPrev();
    }, [api]);

    const scrollNext = React.useCallback(() => {
      api?.scrollNext();
    }, [api]);

    const scrollTo = React.useCallback(
      (index: number) => {
        api?.scrollTo(index);
      },
      [api],
    );

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          scrollPrev();
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          scrollNext();
        }
      },
      [scrollPrev, scrollNext],
    );

    React.useEffect(() => {
      if (!api || !setApi) return;
      setApi(api);
    }, [api, setApi]);

    React.useEffect(() => {
      if (!api) return;

      onSelect(api);
      api.on("reInit", onSelect);
      api.on("select", onSelect);

      return () => {
        api?.off("select", onSelect);
      };
    }, [api, onSelect]);

    const scrollTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    useThrottledEvent(
      "scroll",
      () => {
        (api as { _trigger?: (event: string) => void })._trigger?.("select");

        if (opts?.loop && carouselRef.current) {
          const wrapper = carouselRef.current;
          const container = wrapper.firstElementChild as HTMLElement;
          if (!container) return;

          const isHoriz = orientation === "horizontal";

          const items = container.querySelectorAll('[role="group"]');
          if (!items.length) return;
          const numItems = items.length / 3;
          const firstItem = items[0] as HTMLElement;
          const secondItem = items[1] as HTMLElement | undefined;
          const itemSize = secondItem
            ? isHoriz
              ? secondItem.offsetLeft - firstItem.offsetLeft
              : secondItem.offsetTop - firstItem.offsetTop
            : isHoriz
              ? firstItem.clientWidth
              : firstItem.clientHeight;
          const jumpSize = numItems * itemSize;

          if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
          }

          scrollTimeoutRef.current = setTimeout(() => {
            const currentScrollPos = isHoriz
              ? wrapper.scrollLeft
              : wrapper.scrollTop;

            // If we scroll into the first third, jump forward a third
            if (currentScrollPos <= jumpSize * 0.25) {
              wrapper.scrollBy({
                left: isHoriz ? jumpSize : 0,
                top: isHoriz ? 0 : jumpSize,
                behavior: "auto",
              });
            }
            // If we scroll into the last third, jump back a third
            else if (
              currentScrollPos >=
              jumpSize * 2.75 -
                (isHoriz ? wrapper.clientWidth : wrapper.clientHeight)
            ) {
              wrapper.scrollBy({
                left: isHoriz ? -jumpSize : 0,
                top: isHoriz ? 0 : -jumpSize,
                behavior: "auto",
              });
            }
          }, 100);
        }
      },
      carouselRef,
      100,
    );

    React.useEffect(() => {
      const container = carouselRef.current;
      if (container) {
        const handleResizeOrMutate = () => {
          (api as { _trigger?: (event: string) => void })._trigger?.("reInit");
        };

        const resizeObserver = new ResizeObserver(handleResizeOrMutate);
        resizeObserver.observe(container);

        const mutationObserver = new MutationObserver(handleResizeOrMutate);
        mutationObserver.observe(container, { childList: true, subtree: true });

        // Initial scroll to middle set if looping
        if (opts?.loop) {
          const wrapper = container.firstElementChild as HTMLElement;
          if (wrapper) {
            requestAnimationFrame(() => {
              const isHoriz = orientation === "horizontal";
              const items = wrapper.querySelectorAll('[role="group"]');
              if (!items.length) return;
              const firstItem = items[0] as HTMLElement;
              const numItems = items.length / 3;
              const secondItem = items[1] as HTMLElement | undefined;
              const itemSize = secondItem
                ? isHoriz
                  ? secondItem.offsetLeft - firstItem.offsetLeft
                  : secondItem.offsetTop - firstItem.offsetTop
                : isHoriz
                  ? firstItem.clientWidth
                  : firstItem.clientHeight;
              const jumpSize = numItems * itemSize;
              container.scrollTo({
                left: isHoriz ? jumpSize : 0,
                top: isHoriz ? 0 : jumpSize,
                behavior: "auto",
              });
            });
          }
        }

        return () => {
          resizeObserver.disconnect();
          mutationObserver.disconnect();
          if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
            scrollTimeoutRef.current = null;
          }
        };
      }
    }, [api, opts?.loop, orientation]);

    const contextValue = React.useMemo(
      () => ({
        carouselRef,
        api: api,
        opts,
        orientation:
          orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        scrollPrev,
        scrollNext,
        scrollTo,
        canScrollPrev,
        canScrollNext,
        selectedIndex,
        slideCount,
        effect,
      }),
      [
        carouselRef,
        api,
        opts,
        orientation,
        scrollPrev,
        scrollNext,
        scrollTo,
        canScrollPrev,
        canScrollNext,
        selectedIndex,
        slideCount,
        effect,
      ],
    );

    return (
      <CarouselContext.Provider value={contextValue}>
        <Box
          {...rnx({ component: "Carousel" })}
          ref={ref}
          onKeyDownCapture={handleKeyDown}
          className={cn("relative", className)}
          role="region"
          aria-roledescription="carousel"
          {...props}
        >
          {children}
        </Box>
      </CarouselContext.Provider>
    );
  },
);
CarouselRoot.displayName = "Carousel";

const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { carouselRef, orientation, effect, opts } = useCarousel();

  React.useEffect(() => {
    if (!effect || effect === "slide") return;

    const container = carouselRef.current;
    if (!container) return;

    let frameId: number;
    let items: HTMLElement[] = [];

    const applyEffect = () => {
      // Refresh items in case they change
      items = Array.from(
        container.querySelectorAll('[role="group"]'),
      ) as HTMLElement[];
      if (!items.length) return;

      const isHoriz = orientation === "horizontal";
      const scrollPos = isHoriz ? container.scrollLeft : container.scrollTop;

      // We assume items are all the same size for the effect calculations
      const itemSize = isHoriz ? items[0].clientWidth : items[0].clientHeight;
      if (itemSize === 0) return;

      const centerIndex = scrollPos / itemSize;
      const isSingleView = itemSize >= container.clientWidth - 10;

      items.forEach((item, index) => {
        const progress = index - centerIndex;
        const target = (item.firstElementChild as HTMLElement) || item;

        item.style.transformStyle = "preserve-3d";

        if (effect === "fade") {
          const opacity = Math.max(0, 1 - Math.abs(progress));
          const translate = -progress * itemSize;
          target.style.transition = "opacity 0.4s ease";
          target.style.transform = `translate${isHoriz ? "X" : "Y"}(${translate}px)`;
          target.style.opacity = opacity.toString();
          item.style.zIndex = (
            100 - Math.abs(Math.round(progress * 100))
          ).toString();
        } else if (effect === "flip") {
          const rotate = progress * 90;
          const translate = isSingleView ? -progress * itemSize : 0;
          const originZ = itemSize / 2;
          target.style.transformOrigin = `50% 50% -${originZ}px`;
          target.style.transform = `translate${isHoriz ? "X" : "Y"}(${translate}px) rotate${isHoriz ? "Y" : "X"}(${rotate}deg)`;
          target.style.opacity = Math.abs(progress) > 1 ? "0" : "1";
          item.style.zIndex = (
            100 - Math.abs(Math.round(progress * 100))
          ).toString();
        }
      });
    };

    applyEffect();

    const handleScroll = () => {
      frameId = requestAnimationFrame(applyEffect);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      cancelAnimationFrame(frameId);

      items.forEach((item) => {
        const target = (item.firstElementChild as HTMLElement) || item;
        item.style.transform = "";
        item.style.opacity = "";
        item.style.zIndex = "";
        item.style.transformOrigin = "";
        item.style.backfaceVisibility = "";
        item.style.transformStyle = "";
        target.style.transform = "";
        target.style.opacity = "";
        target.style.transformOrigin = "";
        target.style.backfaceVisibility = "";
      });
    };
  }, [carouselRef, orientation, effect]);

  const memoizedChildren = React.useMemo(() => {
    if (!opts?.loop) return children;
    const childArray = React.Children.toArray(children);
    return (
      <>
        {childArray.map((child, i) =>
          React.isValidElement(child)
            ? React.cloneElement(child as React.ReactElement, {
                key: "clone-pre-" + i,
              })
            : child,
        )}
        {childArray.map((child, i) =>
          React.isValidElement(child)
            ? React.cloneElement(child as React.ReactElement, {
                key: "real-" + i,
              })
            : child,
        )}
        {childArray.map((child, i) =>
          React.isValidElement(child)
            ? React.cloneElement(child as React.ReactElement, {
                key: "clone-post-" + i,
              })
            : child,
        )}
      </>
    );
  }, [children, opts?.loop]);

  return (
    <Box
      ref={carouselRef}
      className={cn(
        "rnx-scrollbar-hide h-full overflow-auto scroll-smooth",
        orientation === "horizontal"
          ? "overflow-y-hidden"
          : "overflow-x-hidden",
      )}
      style={{
        scrollSnapType:
          orientation === "horizontal" ? "x mandatory" : "y mandatory",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        perspective: effect === "flip" ? "1000px" : "none",
        transformStyle: "preserve-3d",
      }}
    >
      <Box
        ref={ref}
        className={cn(
          "flex h-full items-center",
          orientation === "horizontal" ? "-ms-4" : "-mt-4 flex-col",
          className,
        )}
        {...props}
      >
        <Box
          className="shrink-0"
          style={{
            [orientation === "horizontal" ? "width" : "height"]:
              `var(--pad-start, 0px)`,
          }}
        />
        {memoizedChildren}
        <Box
          className="shrink-0"
          style={{
            [orientation === "horizontal" ? "width" : "height"]:
              `var(--pad-end, 0px)`,
          }}
        />
      </Box>
    </Box>
  );
});
CarouselContent.displayName = "Carousel.Content";

const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { orientation } = useCarousel();

  return (
    <Box
      ref={ref}
      role="group"
      aria-roledescription="slide"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full snap-center",
        orientation === "horizontal" ? "ps-4" : "pt-4",
        className,
      )}
      {...props}
    />
  );
});
CarouselItem.displayName = "Carousel.Item";

const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = "outline", size = "icon", ...props }, ref) => {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "rnx-carousel__button absolute z-10 h-8 w-8",
        orientation === "horizontal"
          ? "top-1/2 left-4 -translate-y-1/2"
          : "top-4 left-1/2 -translate-x-1/2 rotate-90",
        !canScrollPrev ? "hidden" : "",
        className,
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      aria-label="Previous slide"
      {...props}
    >
      <ArrowLeft className="h-4 w-4" />
    </Button>
  );
});
CarouselPrevious.displayName = "Carousel.Previous";

const CarouselNext = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = "outline", size = "icon", ...props }, ref) => {
  const { orientation, scrollNext, canScrollNext } = useCarousel();

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "rnx-carousel__button absolute z-10 h-8 w-8",
        orientation === "horizontal"
          ? "top-1/2 right-4 -translate-y-1/2"
          : "bottom-4 left-1/2 -translate-x-1/2 rotate-90",
        !canScrollNext ? "hidden" : "",
        className,
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      aria-label="Next slide"
      {...props}
    >
      <ArrowRight className="h-4 w-4" />
    </Button>
  );
});
CarouselNext.displayName = "Carousel.Next";

const CarouselCaption = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    position?: "top" | "center" | "bottom";
  }
>(({ className, position = "bottom", ...props }, ref) => {
  return (
    <Box
      ref={ref}
      className={cn(
        "rnx-carousel__caption absolute inset-0 z-20 flex flex-col items-center",
        position === "top"
          ? "justify-start"
          : position === "center"
            ? "justify-center"
            : "justify-end",
        className,
      )}
      {...props}
    />
  );
});
CarouselCaption.displayName = "Carousel.Caption";

const CarouselDots = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { selectedIndex, slideCount, scrollTo } = useCarousel();

  if (slideCount <= 1) return null;

  return (
    <Box
      ref={ref}
      className={cn(
        "absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2",
        className,
      )}
      {...props}
    >
      {Array.from({ length: slideCount }).map((_, index) => (
        <button
          key={index}
          className={cn(
            "h-2 w-2 rounded-full transition-all",
            selectedIndex === index
              ? "bg-primary w-4"
              : "bg-primary/30 hover:bg-primary/50",
          )}
          aria-label={`Go to slide ${index + 1}`}
          aria-current={selectedIndex === index}
          onClick={() => scrollTo(index)}
        />
      ))}
    </Box>
  );
});
CarouselDots.displayName = "Carousel.Dots";

const Carousel = Object.assign(CarouselRoot, {
  Content: CarouselContent,
  Item: CarouselItem,
  Previous: CarouselPrevious,
  Next: CarouselNext,
  Caption: CarouselCaption,
  Dots: CarouselDots,
});

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselCaption,
  CarouselDots,
};
