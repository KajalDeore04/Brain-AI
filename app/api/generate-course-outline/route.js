import { courseOutline } from "@/configs/AiModal";
import { db } from "@/configs/db";
import { STUDY_MATERIAL_TABLE } from "@/configs/schema";
import { inngest } from "@/inngest/client";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { courseId, topic, studyType, difficultyLevel, createdBy } = await req.json();

    const PROMPT = `Generate a study material for ${topic} for ${studyType} and level of difficulty will be ${difficultyLevel} with summary of course, list of chapters along with summary for each chapter, emoji for each chapter, topic list in each chapter, all results in JSON format`;

    console.time("AI Response Time");
    const timeout = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms));
    const aiResp = await courseOutline.sendMessage(PROMPT);
    console.timeEnd("AI Response Time");

    const aiResult = JSON.parse(aiResp.response?.text() || "{}");

    console.time("Database Insertion Time");
    const dbResult = await db.insert(STUDY_MATERIAL_TABLE).values({
      courseId,
      courseType: studyType,
      createdBy,
      topic,
      difficultyLevel,
      courseLayout: aiResult,
    }).returning({ resp: STUDY_MATERIAL_TABLE });
    console.timeEnd("Database Insertion Time");

    console.time("Inngest Call Time");
    const result = await inngest.send({
      name: "notes.generate",
      data: {
        course: dbResult[0].resp,
      },
    });
    console.timeEnd("Inngest Call Time");

    console.log(result);

    return NextResponse.json({ result: dbResult[0] });
  } catch (error) {
    console.error("Error in POST function:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}