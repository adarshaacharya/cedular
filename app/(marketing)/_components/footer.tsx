import Link from "next/link";

export async function Footer() {
  const links = {
    Product: ["Features", "Pricing", "Security"],
    Resources: ["Docs", "Blog", "API"],
    Company: ["About", "Contact", "Careers"],
  };

  return (
    <footer className="relative border-t border-white/10 bg-black/50 backdrop-blur-sm py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg" />
              <h3 className="text-lg font-bold text-white">Kaspr</h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Meetings on autopilot. Scheduling intelligence delivered via
              email.
            </p>
          </div>
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wide">
                {category}
              </h4>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item}>
                    <Link
                      href="#"
                      className="text-gray-400 hover:text-blue-400 transition text-sm"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center text-gray-500 text-xs gap-4">
          <p>&copy; 2025 Kaspr. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-blue-400 transition">
              Terms
            </Link>
            <Link href="#" className="hover:text-blue-400 transition">
              Privacy
            </Link>
            <Link href="#" className="hover:text-blue-400 transition">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
