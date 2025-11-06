import Link from "next/link";

export async function CTAModule() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="relative rounded-3xl border border-border bg-card/80 p-12 md:p-16 overflow-hidden backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-transparent to-accent/0 opacity-50" />

          <div className="relative z-10 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to <span className="text-primary">reclaim your time?</span>
            </h2>
            <p className="text-xl text-foreground/90 mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who&apos;ve eliminated scheduling chaos
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <button className="px-8 py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold rounded-lg hover:shadow-2xl hover:shadow-primary/50 transition">
                  Get Started Free
                </button>
              </Link>
              <button className="px-8 py-4 border border-border text-foreground font-semibold rounded-lg hover:bg-secondary transition">
                Schedule Demo
              </button>
            </div>
            <p className="text-muted-foreground text-sm mt-6">
              14-day free trial. No credit card required.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
