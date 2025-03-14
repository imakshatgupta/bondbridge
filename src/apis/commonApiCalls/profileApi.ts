import axios from 'axios';
import mockPosts from "@/constants/posts";
import {
  FetchUserProfileResponse,
  UserPostsResponse,
} from "../apiTypes/profileTypes";

export const fetchUserProfile = async (
  userId: string,
  currentUserId: string
): Promise<FetchUserProfileResponse> => {
  try {
    const token = localStorage.getItem('token');
    console.log("userId", userId);
    console.log("currentUserId", currentUserId);
    console.log("token", token);
    const response = await axios.get('http://18.144.2.16/api/showProfile', {
      headers: {
        'token': token,
        'userid': currentUserId,
      },
      params: {
        'other': userId,
      }
    });

    const userData = response.data.result[0];
    // console.log("userData", userData);
    const isCurrentUser = currentUserId === userId;

    return {
      success: true,
      data: {
        username: userData.name,
        email: isCurrentUser ? userData.email : "",
        followers: userData.followers || 0,
        following: userData.followings || 0,
        avatarSrc: userData.avatar || userData.profilePic || "/profile/user.png",
        isCurrentUser
      },
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return {
      success: false,
      data: {
        username: "Unknown User",
        email: "",
        followers: 0,
        following: 0,
        avatarSrc: "/profile/user.png",
        isCurrentUser: false,
      },
    };
  }
};

export const fetchUserPosts = async (
  userId: string,
  isCurrentUser: boolean
): Promise<UserPostsResponse> => {
  try {
    const token = localStorage.getItem('token');
    const currentUserId = localStorage.getItem('userId');

    const params = isCurrentUser ? {} : {
      'userId': userId
    }
    const response = await axios.get('http://18.144.2.16/api/get-posts', {
      headers: {
        'token': token,
        'userid': currentUserId,
      },
      params: params
    });

    const posts = response.data.posts.map((post: any) => ({
      id: post._id,
      imageSrc: post.data.media[0]?.url || '',
      content: post.data.content,
      createdAt: post.createdAt,
      author: {
        name: post.name,
        profilePic: post.profilePic
      },
      stats: {
        commentCount: post.commentCount,
        reactionCount: post.reactionCount,
        hasReacted: post.reaction.hasReacted,
        reactionType: post.reaction.reactionType
      }
    }));

    return {
      posts,
    };
  } catch (error) {
    console.error("Error fetching user posts:", error);
    return {
      posts: [],
    };
  }
};
