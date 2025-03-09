

const SidebarAvatar = () => {
  return (
    <li className="flex items-center justify-between">
    <div className="flex items-center space-x-3 text-lg">
        <img src="/profile/avatars/1.png" alt="Avatar" className="w-12 h-12 rounded-full" />
        <span className="text-sidebar-foreground">Michel Smithwick</span>
    </div>
    <svg className="h-5 w-5 text-sidebar-foreground/40" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
    </svg>
</li>
  )
}

export default SidebarAvatar