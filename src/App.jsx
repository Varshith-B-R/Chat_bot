import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import { MdDelete } from "react-icons/md";  // Import the delete icon

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState({ title: "", interactions: [] });
  const [generatingAnswer, setGeneratingAnswer] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [modelInfo, setModelInfo] = useState("Model: Hustlers 0.1"); 
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef(null);
  const chatContainerRef = useRef(null);

  const welcomeMessage = `
Yo, hustlers and grinders!

Welcome to the Hustle Zone, where dreams become realities and obstacles get crushed. I'm HustlerBot, your virtual motivator and chief hype man, here to guide you on your quest for success.

Buckle up, 'cause this journey is not for the faint of heart. You'll have to outwork the competition, stay focused like a laser, and embrace the grind like a boss. But fear not, I'll be there every step of the way, dropping knowledge bombs and keeping you pumped.

Together, we'll unlock your potential, turn setbacks into stepping stones, and conquer the world, one hustle at a time. So, let's get this party started! Let's hustle hard, hustle smart, and make our dreams a reality.

Hustle on, my friends! Let's do this!
  `;

  useEffect(() => {
    // Scroll to the bottom whenever a new message is added
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [currentSession.interactions]);

  async function generateAnswer(e) {
    e.preventDefault();
    setGeneratingAnswer(true);
    setIsTyping(true);
    setAnswer("Loading your answer... \n It might take up to 10 seconds");
    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${import.meta.env.VITE_API_GENERATIVE_LANGUAGE_CLIENT}`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: question }] }],
        },
      });

      const newAnswer = response.data.candidates[0].content.parts[0].text;
      setAnswer(newAnswer);
      const newInteraction = { question, answer: newAnswer, timestamp: new Date().toLocaleTimeString() };

      // Generate a new session title based on the first question
      if (currentSession.interactions.length === 0) {
        const title = question.length > 0 ? question.slice(0, 30) + "..." : `Session ${sessions.length + 1}`;
        setCurrentSession((prevSession) => ({
          ...prevSession,
          title,
          interactions: [{ question: "HustleBot", answer: welcomeMessage, timestamp: new Date().toLocaleTimeString() }, newInteraction],
        }));
      } else {
        setCurrentSession((prevSession) => ({
          ...prevSession,
          interactions: [...prevSession.interactions, newInteraction],
        }));
      }
    } catch (error) {
      console.log(error);
      setAnswer("Sorry - Something went wrong. Please try again!");
    }

    setIsTyping(false);
    setGeneratingAnswer(false);
    setQuestion("");
  }

  function startNewSession() {
    if (currentSession.interactions.length > 0) {
      setSessions([...sessions, currentSession]);
    }
    setCurrentSession({
      title: "",
      interactions: [{ question: "HustleBot", answer: welcomeMessage, timestamp: new Date().toLocaleTimeString() }],
    }); // Reset current session with welcome message
  }

  function deleteSession(index) {
    setSessions(sessions.filter((_, i) => i !== index));
  }

  function regenerateAnswer(index) {
    const questionToRegenerate = currentSession.interactions[index].question;
    setQuestion(questionToRegenerate);
    generateAnswer({ preventDefault: () => {} });
  }

  return (
    <div className={`h-screen flex flex-col ${darkMode ? "bg-[#343541]" : "bg-[#FAFAFA]"} text-${darkMode ? "[#F7F7F8]" : "black"}`}>
      <header className={`${darkMode ? "bg-[#1E1E1E]" : "bg-[#F2F2F2]"} p-4 flex justify-between items-center`}>
  <div className="flex items-center">
    <img src="public/IMG_2344.PNG" alt="Logo" className="w-8 h-8 mr-4" /> {/* Logo image */}
    <h1 className="text-2xl font-bold text-[#10A37F]">Hustle-Bot</h1>
  </div>
  <div className="flex items-center">
    <p className="mr-4">{modelInfo}</p>
    <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-md bg-[#10A37F] text-white">
      {darkMode ? "Light Mode" : "Dark Mode"}
    </button>
  </div>
</header>


      <main className="flex-1 flex">
        <div className={`${darkMode ? "bg-[#1E1E1E]" : "bg-[#F2F2F2]"} w-1/4 p-4 overflow-y-auto sessions-list`}>
          <h2 className="text-xl font-bold text-[#10A37F] mb-4">Sessions</h2>
          <button
            onClick={startNewSession}
            className="bg-[#10A37F] text-white p-2 rounded-md hover:bg-[#0e8a6d] transition-all duration-300 mb-4"
          >
            Start New Session
          </button>
          {sessions.map((session, index) => (
            <div
              key={index}
              className={`${darkMode ? "bg-[#2D2D2D]" : "bg-[#E0E0E0]"} p-4 rounded-lg flex justify-between items-center cursor-pointer hover:bg-[#3C3C3C] transition-all duration-200 mb-2 session-item`}
              onClick={() => setCurrentSession(session)}
            >
              <p className="truncate flex-1">{session.title}</p>
              <MdDelete
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSession(index);
                }}
                className="text-red-500 hover:text-red-700 cursor-pointer"
              />
            </div>
          ))}
        </div>

        <div className="flex-1 flex flex-col p-6">
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto">
            <div className="mb-6">
              {currentSession.interactions.map((chat, index) => (
                <div key={index} className="mb-4">
                  <div className="flex justify-end mb-2">
                    <div className={`${darkMode ? "bg-[#2D2D2D]" : "bg-[#F0F0F0]"} rounded-lg p-4 max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl break-words`}>
                      <p>{chat.question}</p>
                      <span className="text-gray-500 text-xs">{chat.timestamp}</span>
                    </div>
                  </div>
                  <div className="flex justify-start mb-2">
                    <div className={`${darkMode ? "bg-[#1E1E1E]" : "bg-[#FFFFFF]"} rounded-lg p-4 w-full flex items-start break-words`}>
                      <img
                        src="public/IMG_2344.PNG"
                        alt="Logo"
                        className="w-8 h-8 mr-2"
                      />
                      <div className="flex-1">
                        <ReactMarkdown
                          className="prose prose-invert"
                          components={{
                            code({ node, inline, className, children, ...props }) {
                              const match = /language-(\w+)/.exec(className || "");
                              return !inline && match ? (
                                <SyntaxHighlighter
                                  style={dracula}
                                  language={match[1]}
                                  PreTag="div"
                                  {...props}
                                >
                                  {String(children).replace(/\n$/, "")}
                                </SyntaxHighlighter>
                              ) : (
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              );
                            },
                          }}
                        >
                          {chat.answer}
                        </ReactMarkdown>
                        <button
                          onClick={() => regenerateAnswer(index)}
                          className="text-xs text-[#10A37F] mt-2 underline"
                        >
                          Regenerate Answer
                        </button>
                      </div>
                      <span className="text-gray-500 text-xs">{chat.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={generateAnswer} className="mt-6 flex">
            <textarea
              ref={textareaRef}
              className={`${darkMode ? "bg-[#2D2D2D] text-white" : "bg-[#F0F0F0] text-black"} p-4 rounded-lg flex-1 resize-none`}
              rows="2"
              placeholder="Type your question here..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  generateAnswer(e);
                }
              }}
            />
            <button
              type="submit"
              disabled={generatingAnswer}
              className={`ml-4 p-4 rounded-lg text-white ${generatingAnswer ? "bg-gray-500 cursor-not-allowed" : "bg-[#10A37F] hover:bg-[#0e8a6d]"}`}
            >
              {generatingAnswer ? "Generating..." : "Submit"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default App;
