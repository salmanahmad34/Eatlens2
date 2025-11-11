import React from 'react';
import type { Page } from '../MainApp';
import { Logo } from './ui/Logo';

// Social Icons
const TwitterIcon = () => ( <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current"><title>Twitter</title><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.223.085a4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg> );
const GithubIcon = () => ( <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current"><title>GitHub</title><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg> );

interface FooterProps {
    onNavigate: (page: Page, targetId?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {

  const handleScrollLink = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    if (targetId === 'top') {
        onNavigate('landing');
    } else {
        onNavigate('landing', targetId);
    }
  };

  const handlePageLink = (e: React.MouseEvent<HTMLAnchorElement>, page: Page) => {
      e.preventDefault();
      onNavigate(page);
  }

  return (
    <footer className="w-full bg-slate-50 border-t border-slate-200/60 mt-16" style={{backgroundColor: 'var(--color-slate-50)', borderColor: 'var(--color-slate-200)'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Branding section */}
          <div className="col-span-1 lg:col-span-5">
             <div className="flex items-center" style={{color: 'var(--color-primary-600)'}}>
              <Logo />
              <span className="text-2xl font-bold ml-2 text-slate-800 tracking-tighter">EatLens</span>
            </div>
            <p className="mt-4 text-slate-600 max-w-md">
              AI-powered nutrition analysis to help you eat smarter and live healthier.
            </p>
            <div className="mt-6 flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-slate-800 transition-colors"><TwitterIcon /></a>
              <a href="#" className="text-slate-400 hover:text-slate-800 transition-colors"><GithubIcon /></a>
            </div>
          </div>

          <div className="col-span-1 lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
              {/* Quick Links */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 tracking-wider uppercase">Quick Links</h3>
                <ul className="mt-4 space-y-2">
                  <li><a href="#" onClick={(e) => handleScrollLink(e, 'top')} className="text-base text-slate-600 hover:text-slate-900 transition-colors">Home</a></li>
                  <li><a href="#features" onClick={(e) => handleScrollLink(e, 'features')} className="text-base text-slate-600 hover:text-slate-900 transition-colors">Features</a></li>
                  <li><a href="#pricing" onClick={(e) => handleScrollLink(e, 'pricing')} className="text-base text-slate-600 hover:text-slate-900 transition-colors">Pricing</a></li>
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 tracking-wider uppercase">Legal</h3>
                <ul className="mt-4 space-y-2">
                  <li><a href="#" onClick={(e) => handlePageLink(e, 'privacy')} className="text-base text-slate-600 hover:text-slate-900 transition-colors">Privacy Policy</a></li>
                  <li><a href="#" onClick={(e) => handlePageLink(e, 'terms')} className="text-base text-slate-600 hover:text-slate-900 transition-colors">Terms of Service</a></li>
                </ul>
              </div>

               {/* Company */}
               <div>
                <h3 className="text-sm font-semibold text-slate-900 tracking-wider uppercase">Company</h3>
                <ul className="mt-4 space-y-2">
                  <li><a href="#" onClick={(e) => handlePageLink(e, 'contact')} className="text-base text-slate-600 hover:text-slate-900 transition-colors">Contact Us</a></li>
                </ul>
              </div>
          </div>
        </div>
        
        <div className="mt-12 border-t border-slate-200/60 pt-8 text-center">
          <p className="text-base text-slate-500">
            &copy; {new Date().getFullYear()} EatLens. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};