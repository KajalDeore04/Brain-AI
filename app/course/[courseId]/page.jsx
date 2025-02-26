"use client";
import DashboardHeader from "@/app/dashboard/_components/DashboardHeader";
import axios from "axios";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import CourseIntroCard from "./_components/CourseIntroCard";
import StudyMaterialSection from "./_components/StudyMaterialSection";
import ChapterList from "./_components/ChapterList";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Download } from "lucide-react";
import VideoPlayer from "./_components/VideoPlayer"; // Import the VideoPlayer component
import { STUDY_MATERIAL_TABLE } from "@/configs/schema";
import { db } from "@/configs/db";
import { eq } from "drizzle-orm";
import service from "@/configs/service"; // Import the service module

function Course({ content }) {
  const { courseId } = useParams();
  const [course, setCourse] = useState();
  const [notes, setNotes] = useState([]);
  const [videoId, setVideoId] = useState(""); // State to store the video ID

  useEffect(() => {
    GetCourse();
  }, []);

  useEffect(() => {
    if (course) {
      GetNotes();
      GetVideo(); // Fetch video when course data is available
    }
  }, [course]);

  const GetCourse = async () => {
    const result = await axios.get("/api/courses?courseId=" + courseId);
    setCourse(result.data.result);
  };

  const GetNotes = async () => {
    const result = await axios.post("/api/study-type", {
      courseId: courseId,
      studyType: "notes",
    });
    setNotes(result.data);
  };

  const GetVideo = async () => {
    try {
      // Fetch video ID using the getVideos function
      const videoResponse = await service.getVideos(course.courseLayout.course_title);
      console.log("Video API Response:", videoResponse);

      let videoId = "";
      if (videoResponse?.length > 0) {
        videoId = videoResponse[0]?.id?.videoId;
      }

      if (videoId) {
        setVideoId(videoId); // Set the video ID in state

        // Save video ID to the database
        await db.insert(STUDY_MATERIAL_TABLE).values({
          courseId: course.courseLayout.courseId,
          videoId: videoId,
        }).returning("*");

        console.log("Video ID saved to database:", videoId);
      } else {
        console.warn("No video found for course:", course.courseLayout.course_title);
      }
    } catch (error) {
      console.error("Error fetching videos or inserting into DB:", error);
    }
  };

  const downloadPDF = async () => {
    if (!notes.length) return alert("No notes available to download!");

    const pdf = new jsPDF("p", "mm", "a4");
    let pageAdded = false;

    for (let i = 0; i < notes.length; i++) {
      const noteContent = document.createElement("div");
      noteContent.innerHTML = notes[i].notes
        .replace("```html", "")
        .replace("```", "");
      noteContent.style.width = "800px";
      noteContent.style.padding = "20px";
      noteContent.style.background = "#fff";

      document.body.appendChild(noteContent);

      const canvas = await html2canvas(noteContent, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (pageAdded) pdf.addPage();
      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
      pageAdded = true;

      document.body.removeChild(noteContent);
    }

    pdf.save(`all_notes_${courseId}.pdf`);
  };

  return (
    <div>
      {/* Course Intro */}
      <CourseIntroCard course={course} />

      {/* Study Materials Options */}
      <StudyMaterialSection courseId={courseId} course={course} />
      <div className="mt-6 flex justify-center">
        <Button onClick={downloadPDF}>
          <Download /> Download All Notes as PDF
        </Button>
      </div>

      {/* Video */}
      <VideoPlayer videoId={videoId} />

      {/* Chapter List */}
      <ChapterList course={course} />
    </div>
  );
}

export default Course;