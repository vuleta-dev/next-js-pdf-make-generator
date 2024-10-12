"use client"

import { useState } from "react";

export default function Home() {

  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (id: number) => {
    setDownloading(true);
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: id, // If you need to paas ID
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `document-${id}.pdf`; // Name based od ID
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      } else {
        console.log('An unknown error occurred');
      }
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div 
      className="flex items-center justify-center h-screen"
    >
      <button 
        className="bg-blue-500 p-2 text-white rounded-md hover:bg-green-800"
        onClick={() => handleDownload(1)} 
        disabled={downloading}
      >
        {downloading ? 'Downloading...' : 'Download PDF'}
      </button>
    </div>
  );
}
