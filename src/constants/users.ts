interface UserData {
  username: string;
  email: string;
  bio: string;
  followers: number;
  following: number;
  avatarSrc: string;
  isCurrentUser?: boolean;
}

const mockUserData: Record<string, Omit<UserData, "isCurrentUser">> = {
  "1": {
    username: "Jo Hall",
    email: "johall@gmail.com",
    bio: "Senior Developer at Google",
    followers: 20034,
    following: 3987,
    avatarSrc: "/profile/avatars/3.png",
  },
  "2": {
    username: "Sarah Wilson",
    email: "sarah.wilson@microsoft.com",
    bio: "Product Manager | Tech Enthusiast",
    followers: 15678,
    following: 2345,
    avatarSrc: "/profile/avatars/4.png",
  },
  "3": {
    username: "Mike Chen",
    email: "mike.chen@apple.com",
    bio: "iOS Developer | Coffee Addict",
    followers: 32156,
    following: 1234,
    avatarSrc: "/profile/avatars/5.png",
  },
  "4": {
    username: "Emma Thompson",
    email: "emma.t@meta.com",
    bio: "UI/UX Designer | Creative Mind",
    followers: 45123,
    following: 2876,
    avatarSrc: "/profile/avatars/1.png",
  },
  "5": {
    username: "Alex Rodriguez",
    email: "alex.r@netflix.com",
    bio: "Senior Software Architect",
    followers: 28945,
    following: 1543,
    avatarSrc: "/profile/avatars/2.png",
  },
  "6": {
    username: "Lisa Wang",
    email: "lisa.wang@amazon.com",
    bio: "Full Stack Developer | AWS Expert",
    followers: 19876,
    following: 2198,
    avatarSrc: "/profile/avatars/6.png",
  },
  "7": {
    username: "David Kim",
    email: "david.kim@spotify.com",
    bio: "Backend Engineer | Music Lover",
    followers: 23567,
    following: 1876,
    avatarSrc: "/profile/avatars/7.png",
  },
  "8": {
    username: "Rachel Green",
    email: "rachel.g@adobe.com",
    bio: "Creative Director | Design Expert",
    followers: 56789,
    following: 3421,
    avatarSrc: "/profile/avatars/8.png",
  },
  "9": {
    username: "Tom Anderson",
    email: "tom.a@twitter.com",
    bio: "DevOps Engineer | Cloud Expert",
    followers: 17654,
    following: 987,
    avatarSrc: "/profile/avatars/1.png",
  },
  "10": {
    username: "Maria Garcia",
    email: "maria.g@linkedin.com",
    bio: "Frontend Developer | React Expert",
    followers: 34567,
    following: 2345,
    avatarSrc: "/profile/avatars/2.png",
  },
};

export default mockUserData;

export type { UserData };
