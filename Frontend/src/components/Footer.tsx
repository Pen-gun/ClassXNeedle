import { Link } from 'react-router-dom';
import { Instagram, PinIcon, Twitter } from 'lucide-react';
import { footerSections, footerSocials } from '../lib/navigation';

const Footer = () => (
  <footer className="bg-accent-charcoal dark:bg-stone-950 text-white mt-auto">
    <div className="border-b border-white/10">
      <div className="container-wide py-16">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <span className="section-subtitle">Stay Connected</span>
          <h3 className="font-display text-3xl md:text-4xl">Join the ClassXNeedle World</h3>
          <p className="text-stone-400">
            Subscribe for exclusive access to new collections, style guides, and member-only offers.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-stone-500 focus:outline-none focus:border-accent-gold transition-colors"
            />
            <button type="submit" className="btn-gold whitespace-nowrap">
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </div>

    <div className="container-wide py-16">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-16">
        <div className="col-span-2 md:col-span-1 space-y-6">
          <div>
            <span className="font-display text-2xl font-semibold">
              Class<span className="text-accent-gold">X</span>Needle
            </span>
          </div>
          <p className="text-stone-400 text-sm leading-relaxed">
            Premium clothing crafted with precision and passion. Where timeless elegance meets modern sophistication.
          </p>
          <div className="flex items-center gap-4">
            {footerSocials.map((social) => {
              const icon = social.label === 'Instagram' ? Instagram : social.label === 'Twitter' ? Twitter : PinIcon;
              const Icon = icon;
              return (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="text-stone-400 hover:text-accent-gold transition-colors"
                >
                  <Icon />
                </a>
              );
            })}
          </div>
        </div>

        {footerSections.map((section) => (
          <div key={section.title} className="space-y-4">
            <h4 className="font-semibold text-sm uppercase tracking-wider">{section.title}</h4>
            <ul className="space-y-3 text-sm text-stone-400">
              {section.links.map((link) => (
                <li key={link.label}>
                  {link.to.startsWith('#') ? (
                    <a href={link.to} className="hover:text-accent-gold transition-colors">
                      {link.label}
                    </a>
                  ) : (
                    <Link to={link.to} className="hover:text-accent-gold transition-colors">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>

    <div className="border-t border-white/10">
      <div className="container-wide py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-stone-500">
        <p>Ac {new Date().getFullYear()} ClassXNeedle. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-white transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Terms of Service
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Cookies
          </a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
