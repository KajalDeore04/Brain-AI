"use client";
import YouTube from "react-youtube";

const VideoPlayer = ({ videoId }) => {
  const opts = {
    height: "390",
    width: "640",
    playerVars: {
      autoplay: 0,
    },
  };

  return (
    <div className="flex justify-center my-6">
      {videoId ? (
        <YouTube videoId={videoId} opts={opts} />
      ) : (
        <p>No video available for this course.</p>
      )}
    </div>
  );
};

export default VideoPlayer;