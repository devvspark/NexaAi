import { Hash, Sparkles } from "lucide-react";
import React, { useState, useRef } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import Markdown from "react-markdown";
import { useAuth } from "@clerk/clerk-react";
import htmlToPdfmake from "html-to-pdfmake";
import pdfMake from "pdfmake/build/pdfmake";
import "pdfmake/build/vfs_fonts"; // registers the fonts

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const BlogTitles = () => {
  const blogCategories = [
    "General",
    "Technology",
    "Business",
    "Health",
    "Lifestyle",
    "Education",
    "Travel",
    "Food",
  ];

  const [selectedCategory, setSelectedCategory] = useState("General");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [lastId, setLastId] = useState(null);

  const { getToken } = useAuth();
  const contentRef = useRef();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const prompt = `Generate a blog title for the keyword ${input} category ${selectedCategory}`;

      const { data } = await axios.post(
        "/api/ai/generate-blog-title",
        { prompt },
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
          lineHeight: 0.8, // tighter line spacing
        },
        styles: {
          h1: { fontSize: 18, bold: true, margin: [0, 6, 0, 4] },
          h2: { fontSize: 15, bold: true, margin: [0, 5, 0, 3] },
          p: { margin: [0, 2, 0, 2] }, // reduced paragraph spacing
          li: { margin: [0, 1, 0, 1] }, // list item tighter spacing
        },
      };
  
      pdfMake.createPdf(docDefinition).download("Blog-title.pdf");
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
          <Sparkles className="w-6 text-[#8E37EB]" />
          <h1 className="text-xl font-semibold">AI Title Generator</h1>
        </div>

        <p className="mt-6 text-sm font-medium">Keyword</p>
        <input
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type="text"
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300"
          placeholder="The future of artificial intelligence is..."
          required
        />

        <p className="mt-4 text-sm font-medium">Category</p>
        <div className="mt-3 flex gap-3 flex-wrap sm:max-w-9/12">
          {blogCategories.map((item) => (
            <span
              onClick={() => setSelectedCategory(item)}
              className={`text-xs px-4 py-1 border rounded-full cursor-pointer ${
                selectedCategory === item
                  ? "bg-purple-50 text-purple-700 border-purple-200"
                  : "text-gray-500 border-gray-300"
              }`}
              key={item}
            >
              {item}
            </span>
          ))}
        </div>

        <br />
        <button
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#C341F6] to-[#8E37EB] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer"
        >
          {loading ? (
            <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin"></span>
          ) : (
            <Hash className="w-5" />
          )}
          Generate Title
        </button>
      </form>

      {/* Right column */}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 max-h-[600px]">
        <div className="flex items-center gap-3">
          <Hash className="w-5 h-5 text-[#8E37EB]" />
          <h1 className="text-xl font-semibold">Generated Title</h1>
        </div>

        {!content ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
              <Hash className="w-9 h-9" />
              <p>Enter a topic and click "Generate Title" to get started</p>
            </div>
          </div>
        ) : (
          <div className="mt-3 h-full overflow-y-scroll text-sm text-slate-600">
            <div ref={contentRef} className="reset-tw">
              <Markdown>{content}</Markdown>
            </div>

            {/* ✅ Show only when content is generated */}
            <button onClick={handleDownloadPDF}
              className=" mt-4 w-full bg-[#226BFF] text-white text-sm py-2 rounded-md cursor-pointer"
            >
              Download PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogTitles;
