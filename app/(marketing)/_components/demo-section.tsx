export async function DemoSection() {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6 leading-tight">
              See it in <span className="text-blue-400">action</span>
            </h2>
            <p className="text-gray-400 mb-4 leading-relaxed">
              From email to booked meeting in seconds. No forms, no apps, no
              friction.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                "CC Kaspr on any email",
                "AI understands the request",
                "Perfect meeting time found",
                "Calendar updated instantly",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                  <span className="text-gray-300">{item}</span>
                </li>
              ))}
            </ul>
            <button className="px-6 py-3 border border-blue-500/50 text-blue-400 font-semibold rounded-lg hover:bg-blue-500/10 transition">
              View Full Demo
            </button>
          </div>

          <div className="relative">
            <div className="aspect-video rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center backdrop-blur-sm">
              <div className="text-center">
                <div className="text-6xl mb-2">▶</div>
                <p className="text-gray-400 text-sm">Play video demo</p>
              </div>
            </div>
            <div className="absolute -inset-4 bg-blue-500/10 rounded-2xl blur-xl -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}
