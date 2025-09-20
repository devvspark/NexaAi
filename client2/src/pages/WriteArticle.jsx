import { Edit, Sparkles } from "lucide-react";
import React, { useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import Markdown from "react-markdown";
import html2pdf from "html2pdf.js"; // ✅ Import for frontend PDF download
import jsPDF from "jspdf";
import htmlToPdfmake from "html-to-pdfmake";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";


axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const WriteArticle = () => {
  const articleLength = [
    { length: 800, text: "short(500-800 words)" },
    { length: 1200, text: "Medium(800-1200 words)" },
    { length: 1600, text: "long(1200+ words)" },
  ];

  const [selectedLength, setSelectedLength] = useState(articleLength[0]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [lastId, setLastId] = useState(null);

  const { getToken } = useAuth();
  const contentRef = useRef(); // ✅ reference to capture content for PDF

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const prompt = `Write an article about ${input} in ${selectedLength.text}`;
      const { data } = await axios.post(
        "/api/ai/generate-article",
        { prompt, length: selectedLength.length },
        {
          headers: { Authorization: `Bearer ${await getToken()}` },
        }
      );

      if (data.success) {
        setContent(data.content);
        setLastId(data.id || null);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };


  const handleDownloadPDF = () => {
    try {
      const articleHtml = contentRef.current.innerHTML;
      const pdfContent = htmlToPdfmake(articleHtml);
  
      const docDefinition = {
        pageSize: "A4",
        pageMargins: [30, 40, 30, 40], // reduced margins (left, top, right, bottom)
        content: pdfContent,
        defaultStyle: {
          fontSize: 12,
          lineHeight: 1.2, // tighter line spacing
        },
        styles: {
          h1: { fontSize: 18, bold: true, margin: [0, 6, 0, 4] },
          h2: { fontSize: 15, bold: true, margin: [0, 5, 0, 3] },
          p: { margin: [0, 2, 0, 2] }, // reduced paragraph spacing
          li: { margin: [0, 1, 0, 1] }, // list item tighter spacing
        },
      };
  
      pdfMake.createPdf(docDefinition).download("Article.pdf");
    } catch (err) {
      toast.error("Failed to generate PDF");
    }
  };

  return (
    <div className="h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700">
      {/* Left column */}
      <form
        onSubmit={onSubmitHandler}
        className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 text-[#4A7AFF]" />
          <h1 className="text-xl font-semibold">Article Configuration</h1>
        </div>

        <p className="mt-6 text-sm font-medium">Article Topic</p>
        <input
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type="text"
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300"
          placeholder="The future of artificial intelligence is..."
          required
        />

        <p className="mt-4 text-sm font-medium">Article Length</p>
        <div className="mt-3 flex gap-3 flex-wrap sm:max-w-9/12">
          {articleLength.map((item, index) => (
            <span
              onClick={() => setSelectedLength(item)}
              className={`text-xs px-4 py-1 border rounded-full cursor-pointer ${
                selectedLength.text === item.text
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "text-gray-500 border-gray-300"
              }`}
              key={index}
            >
              {item.text}
            </span>
          ))}
        </div>

        <br />
        <button
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#226BFF] to-[#65ADFF] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer"
        >
          {loading ? (
            <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin"></span>
          ) : (
            <Edit className="w-5" />
          )}
          Generate article
        </button>
      </form>

      {/* Right column */}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 max-h-[600px]">
        <div className="flex items-center gap-3">
          <Edit className="w-5 h-5 text-[#447AFF]" />
          <h1 className="text-xl font-semibold">Generated article</h1>
        </div>

        {!content ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
              <Edit className="w-9 h-9" />
              <p>Enter a topic and click "Generate article" to get started</p>
            </div>
          </div>
        ) : (
          <div className="mt-3 h-full overflow-y-scroll text-sm text-slate-600">
            <div ref={contentRef} className="reset-tw">
              <Markdown>{content}</Markdown>
            </div>

            {/* ✅ Show only when article is generated */}
            <button onClick={handleDownloadPDF} className="mt-4 w-full bg-[#226BFF] text-white text-sm py-2 rounded-md">
              Download Pdf
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WriteArticle;
