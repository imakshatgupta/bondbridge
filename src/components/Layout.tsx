import React from 'react';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col">
            {/* Navbar */}
            <nav className="">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <a href="/" className="text-xl font-bold">
                                <div className="">
                                    <img src="/logo.png" alt="Bond Bridge" className="h-8 w-8" />
                                </div>
                            </a>
                        </div>

                        {/* Mobile menu button */}
                        <div className="flex items-center md:hidden">
                            <button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>

                        
                    </div>
                </div>

                {/* Mobile menu panel */}
                <div className="hidden md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        <a href="/about" className="block px-3 py-2 text-gray-500 hover:text-gray-900">About</a>
                        <a href="/services" className="block px-3 py-2 text-gray-500 hover:text-gray-900">Services</a>
                        <a href="/contact" className="block px-3 py-2 text-gray-500 hover:text-gray-900">Contact</a>
                    </div>
                </div>
            </nav>

            {/* Main content */}
            <main className="flex-grow">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-gray-800 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <h3 className="text-lg font-semibold mb-4">About Bond</h3>
                            <p className="text-gray-300">Connecting dreams and fostering growth in communities worldwide.</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                            <ul className="space-y-2">
                                <li><a href="/about" className="text-gray-300 hover:text-white">About Us</a></li>
                                <li><a href="/services" className="text-gray-300 hover:text-white">Services</a></li>
                                <li><a href="/contact" className="text-gray-300 hover:text-white">Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
                            <ul className="space-y-2 text-gray-300">
                                <li>Email: info@bond.com</li>
                                <li>Phone: (123) 456-7890</li>
                                <li>Address: 123 Bond Street</li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-300">
                        <p>&copy; {new Date().getFullYear()} Bond. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
