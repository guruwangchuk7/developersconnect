export function HeroSection() {
  return (
    <section className="relative flex min-h-[calc(100dvh-var(--header-height,64px))] flex-col items-center justify-center border-b bg-grid overflow-y-auto overflow-x-hidden">
      <div className="w-full relative py-12 md:py-20 lg:py-32 px-4 md:px-10">
        <div className="flex flex-col items-center gap-8 md:gap-14">
          <div className="flex flex-col items-center gap-4 md:gap-6">
            <h1 className="max-w-[1000px] text-center text-3xl font-semibold leading-[1.2] tracking-tighter sm:text-5xl md:text-7xl lg:text-8xl text-balance">
              Bhutan Developer Connect
            </h1>

            <p className="max-w-[650px] text-center text-sm font-medium leading-relaxed text-muted-foreground md:text-lg text-balance">
              A working network for builders in Bhutan. Connect, collaborate,
              and build the future of the nation&apos;s technical ecosystem.
            </p>

            <a 
              href="/join"
              className="md:hidden px-6 py-2 bg-primary text-background text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm hover:opacity-90 transition-all"
            >
              Access the Platform
            </a>
          </div>        </div>
      </div>
    </section>
  );
}
