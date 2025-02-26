'use client'
import DashboardHeader from '@/app/dashboard/_components/DashboardHeader';
import axios from 'axios';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import CourseIntroCard from './_components/CourseIntroCard';
import StudyMaterialSection from './_components/StudyMaterialSection';
import ChapterList from './_components/ChapterList';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function Course() {
    const { courseId } = useParams();
    const [course, setCourse] = useState();
    const [notes, setNotes] = useState([]);

    useEffect(() => {
        GetCourse();
        GetNotes();
    }, []);

    const GetCourse = async () => {
        const result = await axios.get('/api/courses?courseId=' + courseId);
        setCourse(result.data.result);
    };

    const GetNotes = async () => {
        const result = await axios.post('/api/study-type', {
            courseId: courseId,
            studyType: 'notes'
        });
        setNotes(result.data);
    };

    const downloadPDF = async () => {
        if (!notes.length) return alert("No notes available to download!");

        const pdf = new jsPDF('p', 'mm', 'a4');
        let pageAdded = false; // Track if a page has been added

        for (let i = 0; i < notes.length; i++) {
            const noteContent = document.createElement('div');
            noteContent.innerHTML = notes[i].notes.replace('```html', '').replace('```', '');
            noteContent.style.width = '800px';
            noteContent.style.padding = '20px';
            noteContent.style.background = '#fff';

            document.body.appendChild(noteContent); // Temporarily add to DOM

            const canvas = await html2canvas(noteContent, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');

            const imgWidth = 190;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            if (pageAdded) pdf.addPage();
            pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
            pageAdded = true; // Ensure pages are added properly

            document.body.removeChild(noteContent); // Clean up
        }

        pdf.save(`all_notes_${courseId}.pdf`);
    };

    return (
        <div>
            {/* Course Intro */}
            <CourseIntroCard course={course} />

            {/* Study Materials Options */}
            <StudyMaterialSection courseId={courseId} course={course} />

            {/* Chapter List */}
            <ChapterList course={course} />

            {/* Download Notes Button */}
            <div className="mt-6 flex justify-center">
                <Button onClick={downloadPDF} variant="outline">
                    Download All Notes as PDF
                </Button>
            </div>
        </div>
    );
}

export default Course;
