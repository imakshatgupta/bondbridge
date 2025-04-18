interface Post {
  id: string;
  userId: string;
  content: string;
  imageUrl: string;
  likes: number;
  comments: number;
  shares: number;
  createdAt: string;
  isLiked?: boolean;
}

export interface MediaItem {
  url: string;
  type: string;
}

export interface PostData {
  content: string;
  postId?: string;
}

export interface UpdatePostParams {
  postId: string;
  content: string;
}

const mockPosts: Record<string, Post> = {
  "1": {
    id: "1",
    userId: "1",
    content:
      "Just shipped a major feature! The team did an amazing job. 🚀 #coding",
    imageUrl: "https://picsum.photos/seed/post1/800/600",
    likes: 234,
    comments: 45,
    shares: 12,
    createdAt: "2024-03-15T10:30:00Z",
  },
  "2": {
    id: "2",
    userId: "1",
    content:
      "Code review sessions are so important for team growth. Learning something new every day! 💡",
    imageUrl: "https://picsum.photos/seed/post2/800/600",
    likes: 156,
    comments: 23,
    shares: 8,
    createdAt: "2024-03-14T15:20:00Z",
  },
  "3": {
    id: "3",
    userId: "1",
    content:
      "Debugging this tricky issue. Coffee is my best friend right now ☕",
    imageUrl: "https://picsum.photos/seed/post3/800/600",
    likes: 189,
    comments: 34,
    shares: 5,
    createdAt: "2024-03-13T09:45:00Z",
  },
  "4": {
    id: "4",
    userId: "1",
    content:
      "Just gave a tech talk on React performance optimization. Great questions from the audience! 🎤",
    imageUrl: "https://picsum.photos/seed/post4/800/600",
    likes: 312,
    comments: 67,
    shares: 28,
    createdAt: "2024-03-12T14:15:00Z",
  },
  "5": {
    id: "5",
    userId: "2",
    content:
      "New UI design concept for our mobile app. Feedback welcome! 🎨 #UIDesign",
    imageUrl: "https://picsum.photos/seed/post5/800/600",
    likes: 423,
    comments: 89,
    shares: 45,
    createdAt: "2024-03-15T08:30:00Z",
  },
  "6": {
    id: "6",
    userId: "2",
    content:
      "Color psychology in UI design - fascinating research findings! 🌈",
    imageUrl: "https://picsum.photos/seed/post6/800/600",
    likes: 267,
    comments: 42,
    shares: 31,
    createdAt: "2024-03-14T11:20:00Z",
  },
  "7": {
    id: "7",
    userId: "2",
    content:
      "Wireframing session for our new project. Exciting times ahead! 📱",
    imageUrl: "https://picsum.photos/seed/post7/800/600",
    likes: 345,
    comments: 56,
    shares: 19,
    createdAt: "2024-03-13T16:45:00Z",
  },
  "8": {
    id: "8",
    userId: "2",
    content:
      "Design systems are a game changer for consistency. Here's why... 🎯",
    imageUrl: "https://picsum.photos/seed/post8/800/600",
    likes: 289,
    comments: 47,
    shares: 23,
    createdAt: "2024-03-12T13:30:00Z",
  },
  "9": {
    id: "9",
    userId: "3",
    content: "Sprint retrospective insights: Communication is key! 🗣️ #Agile",
    imageUrl: "https://picsum.photos/seed/post9/800/600",
    likes: 178,
    comments: 34,
    shares: 12,
    createdAt: "2024-03-15T09:15:00Z",
  },
  "10": {
    id: "10",
    userId: "3",
    content:
      "Team building activity today. Nothing beats good collaboration! 🤝",
    imageUrl: "https://picsum.photos/seed/post10/800/600",
    likes: 234,
    comments: 45,
    shares: 15,
    createdAt: "2024-03-14T14:30:00Z",
  },
  "11": {
    id: "11",
    userId: "3",
    content:
      "Project planning session was super productive. Love this team! 📊",
    imageUrl: "https://picsum.photos/seed/post11/800/600",
    likes: 156,
    comments: 28,
    shares: 9,
    createdAt: "2024-03-13T10:45:00Z",
  },
  "12": {
    id: "12",
    userId: "3",
    content: "Celebrating a successful product launch! 🎉 #TeamSuccess",
    imageUrl: "https://picsum.photos/seed/post12/800/600",
    likes: 445,
    comments: 89,
    shares: 56,
    createdAt: "2024-03-12T16:20:00Z",
  },
  "13": {
    id: "13",
    userId: "3",
    content: "Leadership workshop takeaways: Empathy drives success 💫",
    imageUrl: "https://picsum.photos/seed/post13/800/600",
    likes: 267,
    comments: 43,
    shares: 21,
    createdAt: "2024-03-11T11:30:00Z",
  },
  "14": {
    id: "14",
    userId: "4",
    content: "Deep dive into serverless architecture today 🚀 #AWS",
    imageUrl: "https://picsum.photos/seed/post14/800/600",
    likes: 389,
    comments: 67,
    shares: 42,
    createdAt: "2024-03-15T07:45:00Z",
  },
  "15": {
    id: "15",
    userId: "4",
    content:
      "Optimizing our cloud infrastructure. Every millisecond counts! ⚡",
    imageUrl: "https://picsum.photos/seed/post15/800/600",
    likes: 245,
    comments: 38,
    shares: 17,
    createdAt: "2024-03-14T12:30:00Z",
  },
  "16": {
    id: "16",
    userId: "4",
    content: "Security first! Implementing new authentication protocols 🔒",
    imageUrl: "https://picsum.photos/seed/post16/800/600",
    likes: 312,
    comments: 54,
    shares: 28,
    createdAt: "2024-03-13T15:20:00Z",
  },
  "17": {
    id: "17",
    userId: "4",
    content: "Container orchestration challenges and solutions 🐳 #Kubernetes",
    imageUrl: "https://picsum.photos/seed/post17/800/600",
    likes: 278,
    comments: 45,
    shares: 23,
    createdAt: "2024-03-12T09:15:00Z",
  },
};

export const POST_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAANlBMVEX///+/v7+8vLzKysr8/Pzg4ODFxcXb29vT09Pj4+P4+PjBwcH6+vry8vLY2NjIyMjs7Ozo6Oia8u11AAAEdUlEQVR4nO2d65bqIAxGp/Smrb34/i971KqlEC7FGuJZ3/7dKewJBgK4/PsDAAAAAAAAAAAAAAAA4KUam5+i3m94UsUPoVoYwlA6MIShfGAIQ/nAEIbyOcBQSeNww9NZGOXBhuq8+w1fxugfDG1gmB0YBoFhdmAYBIbZgWEQGGYHhkFgmB0YBoFhdmAYBIbZyWB4qVI6mgyv4WUeH7u007lL7vFeWA3n8rUFrZqWK5KchnWvPapOTGFkNDQPOJrhk45Hw2d4Ns+oVPlRz2NhMxyawkTtv2OWAJvhSBwzfjBO2+g/5TLs7BDeSF4eDP0Y+yiX4UydFKtT4pRxa3SKTcVchtQgLYrobhq0Kj7+XIb0aX+fZtipHfH/ScPlZZG5Jq9hk2RYP96lTnFPcxnWpGF52d2eNrPGPc5lOJC5NDrl65Sv1fs16nEuw8v20sdCP+9uTh8NZVSuYVvTnKlBmjAdaqu/uH8Qm2FVWuNUJYSwOu3tLV9tcelNw5SF9yZjRaVixvpwbrZRTKnyuyKysRXOGn/QBqpK25QzptVm9598eyfqXDaPnah+GlNmwr/aGOcqYl3DvJtYzXU7jvU1bbVmVdExE+pP7Qjb6TiiOBFmOPuyD7XyC+djWYadGt2KxE5PzMpWluHtXc6KQZ/rNYK5RpThfWXnrGzp6iRcQ0ky7KbHK+iBup3rtQZD6wZJhq+9HDIsri89BBsUZPguIal0Y871K6ECRY6hXkFaimQeXQjVUHIMNwWkuVax5/q1xcC6Rozh0G+7vYmidaqzCaJ/whBjaEZJr608Y7QIHvBIMbR3/dfB55jr3/hrKCGGxMHN+vmi53rtSW+uEWLYUj1/dsY1169tetc1MgwHaw9HU3TN9Svec0huw4os6CZHcO7dcc/163O+XMNteC0JRfdk0Aby6BNfDcW9i1EquzedI4R36vAYLfy5htnwtnBRvaHo/SZxjN8Nz7UO5ltf97WnMgbqHCfhRbmHKa/hdXl2qxjzQQsaunMNr+FzUlD62W8bORD9TM4gshpe3xVg+Z7BonJlmN55mMhpWGkV4GughtacsbgvLnAa6hXga6B666I9OGsoRsPtMbCa7l2q6OVaAs6uMxpejXDdd+SPSTMP+vyGdri6+bAQui8u8BmaIbwxUdcXkg0dNRTjOf6BNiSOGirrXYxjcXQ+632ag6EPE7kMiU/h4dA1FJfhgUnTzZTRkCOEt8apYcpj+P1E6u4+j+H3E+kCdUmKxZAjkS4QrbMY8nwKC7qGYjFkSaQL9rqGw5AthORhIoMhUyJ9ksPwsDI+Brv97xtWY8mJNUwZYtixYu0qyjhd+yYwDALD7MAwCAyzA8MgMMwODIPAMDtHGxZ1JYvjDRvWajCC7SYRfhsBhvKBIQzlA0MYygeGMJQPDGEoHxjCUD4whKF8YAhD+cAQhvKBIQzlA0MYygeGMJQPDGEoHxjCUD4whKF8YAhD+cAQhvJJM/wpEgyv9U+R8iNaAAAAAAAAAAAAAAAAAP4r/gEYCYE2Xwz6DQAAAABJRU5ErkJggg=="

export default mockPosts;
export type { Post };
