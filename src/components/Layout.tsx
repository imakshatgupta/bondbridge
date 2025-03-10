import React from 'react';
import { Button } from './ui/button';
import SidebarAvatar from './profile/SidebarAvatar';
import Navbar from './Navbar';

interface LayoutProps {
    children: React.ReactNode;
    showSidebars?: boolean; // Flag to control sidebar visibility
}
const LeftSidebar: React.FC = () => {
    return (
        <div className="col-span-2 border-r border-border  text-xl flex flex-col">
                        {/* Left Sidebar Menu */}
                        <div className=" p-4 w-fit mx-auto flex flex-col justify-between h-full">
                            <ul className="space-y-4">
                                <li>
                                    <a href="/" className="flex items-center space-x-3 text-sidebar-foreground font-medium">
                                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 5.69l5 4.5V18h-2v-6H9v6H7v-7.81l5-4.5zM12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z" />
                                        </svg>
                                        <span>Home</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="/search" className="flex items-center space-x-3 text-gray-600">
                                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 001.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 00-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 005.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                                        </svg>
                                        <span>Search</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="/activity" className="flex items-center space-x-3 text-gray-600">
                                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M13.5 8H12V13L16.28 15.54L17 14.33L13.5 12.25V8M13 3C8.03 3 4 7.03 4 12H1L4.96 16.03L9 12H6C6 8.13 9.13 5 13 5S20 8.13 20 12 16.87 19 13 19C11.07 19 9.32 18.21 8.06 16.94L6.64 18.36C8.27 20 10.5 21 13 21C17.97 21 22 16.97 22 12S17.97 3 13 3" />
                                        </svg>
                                        <span>Activity</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="/notifications" className="flex items-center space-x-3 text-gray-600">
                                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" />
                                        </svg>
                                        <span>Notifications</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="/chat" className="flex items-center space-x-3 text-sidebar-primary">
                                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                                        </svg>
                                        <span>Bond Chat</span>
                                    </a>
                                </li>
                                <Button size={'lg'} className='text-lg w-full'>
                                    + Post
                                </Button>
                            </ul>
                            {/* Settings */}
                            <div className="pb-5">
                                <a href="/settings" className="flex items-center space-x-3">
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
                                    </svg>
                                    <span>Settings</span>
                                </a>
                            </div>
                        </div>



                    </div>
    )
}


const Layout: React.FC<LayoutProps> = ({ children, showSidebars = false }) => {
    return (
        <div className=" flex flex-col">
            {/* Navbar */}
            <Navbar />

            {showSidebars ? (
                <div className="grid lg:grid-cols-12 w-full ">
                    {/* Left Sidebar */}
                    <LeftSidebar />
                    <div className='flex col-span-10'>
                       
                    

                    {/* Main Content */}
                    <div className="border-r w-full border-border p-10 h-[calc(100vh-64px)] overflow-y-auto app-scrollbar">
                        {children}
                    </div>

                    {/* Right Sidebar */}
                    <div className="p-5 w-1/2  px-12 space-y-6 *:rounded-xl ">
                        {/* Profile Section */}
                        <div className="p-4 border-2 border-sidebar-border ">
                            <div className="flex flex-col items-center">
                                <img src="/profile/avatars/2.png" alt="Profile" className="w-20 h-20 rounded-full mb-2 border-2 border-sidebar-border" />
                                <h3 className="font-semibold text-xl text-sidebar-foreground">France Leaphart</h3>
                                <p className="text-sidebar-foreground/60">UI/UX Designer</p>
                                <Button variant={'outline'} className='mt-2 text-sidebar-primary text-sm font-medium border-primary w-full'>
                                    View Profile
                                </Button>
                            </div>
                        </div>

                        {/* People Section */}
                        <div className="p-6 border-2 overflow-y-auto max-h-[52vh] app-scrollbar">
                            <h3 className="font-semibold text-lg mb-4 text-sidebar-foreground">People</h3>
                            <ul className="space-y-3">
                               <SidebarAvatar/>
                               <SidebarAvatar/>
                               <SidebarAvatar/>
                               <SidebarAvatar/>
                               <SidebarAvatar/>
                               <SidebarAvatar/>
                               <SidebarAvatar/>
                               <SidebarAvatar/>
                               <SidebarAvatar/>
                               <SidebarAvatar/>
                               <SidebarAvatar/>
                               <SidebarAvatar/>
                               <SidebarAvatar/>
                               <SidebarAvatar/>
                            </ul>
                        </div>
                    </div>
                    </div>
                </div>
            ) : (
                /* Main content without sidebars */
                <main className="flex-grow">
                    {children}
                </main>
            )}

            {!showSidebars && (
                /* Footer - only show when sidebars are hidden */
                <footer className="bg-secondary text-secondary-foreground">
                    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div>
                                <h3 className="text-lg font-semibold mb-4">About Bond</h3>
                                <p className="text-muted-foreground">Connecting dreams and fostering growth in communities worldwide.</p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                                <ul className="space-y-2">
                                    <li><a href="/about" className="text-muted-foreground hover:text-secondary-foreground">About Us</a></li>
                                    <li><a href="/services" className="text-muted-foreground hover:text-secondary-foreground">Services</a></li>
                                    <li><a href="/contact" className="text-muted-foreground hover:text-secondary-foreground">Contact</a></li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
                                <ul className="space-y-2 text-muted-foreground">
                                    <li>Email: info@bond.com</li>
                                    <li>Phone: (123) 456-7890</li>
                                    <li>Address: 123 Bond Street</li>
                                </ul>
                            </div>
                        </div>
                        <div className="mt-8 pt-8 border-t border-border text-center text-muted-foreground">
                            <p>&copy; {new Date().getFullYear()} Bond. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            )}
        </div>
    );
};

export default Layout;
