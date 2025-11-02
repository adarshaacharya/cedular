export async function CTAModule() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="relative rounded-3xl border border-white/20 bg-gradient-to-br from-blue-500/10 via-black to-cyan-500/10 p-12 md:p-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-transparent to-cyan-500/0 opacity-50" />

          <div className="relative z-10 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to <span className="text-blue-400">reclaim your time?</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who've eliminated scheduling chaos
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-black font-bold rounded-lg hover:shadow-2xl hover:shadow-blue-500/50 transition">
                Get Started Free
              </button>
              <button className="px-8 py-4 border border-white/30 text-white font-semibold rounded-lg hover:bg-white/5 transition">
                Schedule Demo
              </button>
            </div>
            <p className="text-gray-400 text-sm mt-6">
              14-day free trial. No credit card required.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
