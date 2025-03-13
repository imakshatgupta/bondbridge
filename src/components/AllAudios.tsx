interface Audio {
  id: number;
  title: string;
  duration: string;
}

interface AllAudiosProps {
  audios: Audio[];
}

const AllAudios: React.FC<AllAudiosProps> = ({ audios }) => {
  return (
    <div className="space-y-3">
      {audios.map(audio => (
        <div key={audio.id} className="p-3 border rounded-lg flex justify-between items-center">
          <div>
            <h3 className="font-medium">{audio.title}</h3>
            <span className="text-sm text-muted-foreground">{audio.duration}</span>
          </div>
          <button className="w-8 h-8 rounded-full bg-primary text-background flex items-center justify-center">
            ▶
          </button>
        </div>
      ))}
    </div>
  );
};

export default AllAudios; 