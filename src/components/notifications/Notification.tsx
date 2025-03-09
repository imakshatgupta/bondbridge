

type Props = {
  avatar: string;
  title: string;
  description: string;
  timestamp: string;
}

const Notification = ({ avatar, title, description, timestamp }: Props) => {
    
  return (
    <div className="flex items-center gap-4 p-4 border-b hover:bg-muted cursor-pointer">
      <div className="w-12 h-12">
        <img 
          src={avatar} 
          alt="User avatar" 
          className="w-full h-full rounded-full object-cover"
        />
      </div>
      <div className="flex-1">
        <h3 className="font-medium text-xl text-foreground">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <div className="text-sm text-muted-foreground">
        {timestamp}
      </div>
    </div>
  )
}

export default Notification