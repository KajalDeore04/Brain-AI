'use client';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Download } from 'lucide-react';

function ViewNotes() {
  const { courseId } = useParams();
  const [notes, setNotes] = useState();
  const [stepCount, setStepCount] = useState(0);
  const route = useRouter();

  useEffect(() => {
    GetNotes();
  }, []);

  const GetNotes = async () => {
    const result = await axios.post('/api/study-type', {
      courseId: courseId,
      studyType: 'notes'
    });
    setNotes(result.data);
  };

  const downloadPDF = async () => {
    const content = document.getElementById('notes-content');
    if (!content) return;

    const canvas = await html2canvas(content);
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 190; 
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
    pdf.save(`notes_${courseId}.pdf`);
  };

  return notes && (
    <div className="p-6 max-w-4xl mx-auto">
      <div className='flex gap-2 items-center mb-6'>
        {stepCount !== 0 && (
          <Button variant='outline' size='sm' onClick={() => setStepCount(stepCount - 1)}>
            Previous
          </Button>
        )}
        {notes?.map((item, index) => (
          <div 
            key={index} 
            className={`w-full h-2 rounded-full ${index < stepCount ? 'bg-primary' : 'bg-gray-200'}`}
          />
        ))}
        <Button variant='outline' size='sm' onClick={() => setStepCount(stepCount + 1)} disabled={stepCount >= notes.length}>
          Next
        </Button>
      </div>

       {/* Download Button */}
       <div className="flex justify-end">
        <Button onClick={downloadPDF} >
         <Download/> Download as PDF
        </Button>
      </div>

      <div className="prose prose-lg max-w-none">
        <div 
          id="notes-content"
          className="notes-content"
          dangerouslySetInnerHTML={{ 
            __html: (notes[stepCount]?.notes || '').replace('```html', ' ').replace('```',' ')
          }}
        />
        {notes?.length === stepCount && (
          <div className='flex items-center gap-10 flex-col justify-center'>
            <h2>End of Notes</h2>
            <Button onClick={() => route.back()}>Go to Course Page</Button>
          </div>
        )}
      </div>

     

      <style jsx global>{`
  .notes-content h2 {
    font-size: 1.875rem;
    font-weight: 700;
    margin-bottom: 1.2rem;
    color: #2563eb; /* Blue */
    text-decoration: underline;
  }
  .notes-content h3 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 1.5rem 0 1rem;
    color: #92400e; /* Yellow-800 */
  }
  .notes-content p {
    margin: 1rem 0;
    line-height: 1.8;
    color: #4b5563; /* Gray-600 */
  }
  .notes-content ul {
    margin: 1rem 0;
    padding-left: 2rem;
    list-style-type: disc; /* Dots for list */
    color: #1f2937; /* Gray-800 */
  }
  .notes-content li {
    margin: 0.5rem 0;
  }
  .notes-content strong {
    color: #f59e0b; /* Amber */
    font-weight: 700;
  }
  .notes-content code {
    background-color: #f3f4f6; /* Light gray */
    padding: 0.2rem 0.4rem;
    border-radius: 5px;
    color: #d97706; /* Amber-700 */
    font-family: 'Courier New', monospace;
  }
`}</style>

    </div>
  );
}

export default ViewNotes;
