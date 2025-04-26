import Link from 'next/link';
import { Building, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <Building className="h-8 w-8 text-emerald-500" />
              <span className="font-bold text-xl">Zameen Insight</span>
            </div>
            <p className="text-gray-400 mb-6">
              Pakistan's premier real estate platform with AI-powered insights to help you make informed decisions.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-emerald-500">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-emerald-500">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-emerald-500">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-emerald-500">
                <Youtube size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-6">Explore</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/properties" className="text-gray-400 hover:text-emerald-500">
                  Properties
                </Link>
              </li>
              <li>
                <Link href="/cities" className="text-gray-400 hover:text-emerald-500">
                  Cities
                </Link>
              </li>
              <li>
                <Link href="/agents" className="text-gray-400 hover:text-emerald-500">
                  Realtors
                </Link>
              </li>
              <li>
                <Link href="/guides" className="text-gray-400 hover:text-emerald-500">
                  Buying Guides
                </Link>
              </li>
              <li>
                <Link href="/market-trends" className="text-gray-400 hover:text-emerald-500">
                  Market Trends
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-6">Services</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/ai-insights" className="text-gray-400 hover:text-emerald-500">
                  AI Property Analysis
                </Link>
              </li>
              <li>
                <Link href="/advisor-chat" className="text-gray-400 hover:text-emerald-500">
                  Advisor Chat
                </Link>
              </li>
              <li>
                <Link href="/virtual-tours" className="text-gray-400 hover:text-emerald-500">
                  Virtual Tours
                </Link>
              </li>
              <li>
                <Link href="/investment-calculator" className="text-gray-400 hover:text-emerald-500">
                  Investment Calculator
                </Link>
              </li>
              <li>
                <Link href="/legal-services" className="text-gray-400 hover:text-emerald-500">
                  Legal Services
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 text-emerald-500 mt-0.5" />
                <span className="text-gray-400">
                  Blue Area, Islamabad, Pakistan
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-emerald-500" />
                <span className="text-gray-400">+92 51 2345678</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-emerald-500" />
                <span className="text-gray-400">info@zameeninsight.pk</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} Zameen Insight. All rights reserved.
            </p>
            <div className="flex space-x-4 md:justify-end text-sm">
              <Link href="/terms" className="text-gray-400 hover:text-emerald-500">
                Terms of Service
              </Link>
              <Link href="/privacy" className="text-gray-400 hover:text-emerald-500">
                Privacy Policy
              </Link>
              <Link href="/sitemap" className="text-gray-400 hover:text-emerald-500">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}