export interface Community {
    id: number;
    name: string;
    image: string;
  }

export interface Group {
  id: string;
  name: string;
  image: string | null;
  members: number;
  lastActive: string;
}

export interface CommunityL {
  id: number;
  name: string;
  image: string;
  members: number;
  joined: boolean;
}