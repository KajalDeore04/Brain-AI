import axios from "axios";
const YOUTUBE_BASE_URL = "https://www.googleapis.com/youtube/v3";

const getVideos = async (query) => {
  const params = {
    part: "snippet",
    q: query,
    maxResults: 5, // Increase the number of results to improve chances of finding a full video
    type: "video",
    videoDuration: "medium", // Filter for medium-length videos (4-20 minutes)
    key: process.env.NEXT_PUBLIC_YOUTUBE_API_KEY,
  };

  try {
    console.log("Fetching videos with params:", params);
    const response = await axios.get(YOUTUBE_BASE_URL + "/search", { params });
    console.log("YouTube API Response:", response.data);
    return response.data.items;
  } catch (error) {
    console.error("Error fetching videos from YouTube API:", error.response?.data || error.message);
    throw new Error("Failed to fetch videos from YouTube API");
  }
};

module.exports = {
  getVideos,
};