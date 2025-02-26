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
      {videoId ? <div className="font-medium text-2xl">
        <p className="my-4">Video suggested for you 👇🏻</p>
        <YouTube videoId={videoId} opts={opts} />
      </div> : (
        <p>No video available for this course.</p>
      )}
    </div>
  );
};

export default VideoPlayer;