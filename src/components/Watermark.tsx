export function Watermark() {
  return (
    <span
      aria-hidden="true"
      data-no-translate
      className="pointer-events-none absolute bottom-2 right-2 z-10 select-none rounded-md bg-background/45 px-1.5 py-0.5 text-[10px] font-black tracking-[0.18em] text-foreground/80 backdrop-blur-sm sm:text-xs"
    >
      PKMREPS
    </span>
  );
}
