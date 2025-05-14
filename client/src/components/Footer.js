export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-burgundy/90 backdrop-blur-glass shadow-glass border-t border-white/10 text-white text-sm mt-auto animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:flex sm:items-center sm:justify-between">
        {/* Branding */}
        <div className="text-center sm:text-left mb-4 sm:mb-0 transition-all duration-500">
          <span className="text-2xl font-heading font-semibold tracking-wide text-white">
            PizzaOMS
          </span>
          <br />
          <span className="text-xs text-white/70">
            © {year} All rights reserved.
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex justify-center sm:justify-end gap-6 text-sm">
          <a
            href="/privacy"
            className="relative group font-medium text-white/80 hover:text-white transition-colors duration-300"
          >
            Privacy Policy
            <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a
            href="/contact"
            className="relative group font-medium text-white/80 hover:text-white transition-colors duration-300"
          >
            Contact Us
            <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
          </a>
        </nav>
      </div>
    </footer>
  );
}
