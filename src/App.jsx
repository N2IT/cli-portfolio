import { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [text, setText] = useState('');
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [isResponseTyping, setIsResponseTyping] = useState(false);

  // Add ref for the container
  const containerRef = useRef(null);
  const inputLineRef = useRef(null);

  // Welcome message
  const welcomeMessage = `Welcome to my interactive terminal portfolio!
Type 'help' to see available commands.`;

  // Content for different menu items
  const menuContent = {
    introduction: `Hello! I'm a software developer with a passion for creating innovative solutions 
    and exploring new technologies.

    My expertise includes:
    • Full-stack web development
    • Cloud architecture and deployment
    • UI/UX design
    • Performance optimization`,

    projects: `Here are some of my key projects:

    1. Project One
       • Description of first project
       • Technologies used
       • Key achievements

    2. Project Two
       • Description of second project
       • Technologies used
       • Key achievements`,

    skills: `Technical Skills:

    Languages:
    • JavaScript/TypeScript
    • Python
    • Java
    
    Frameworks:
    • React
    • Node.js
    • Express
    
    Tools:
    • Git
    • Docker
    • AWS`,

    contact: `Let's connect!

    • Email: tonyeder11@gmail.com
    • GitHub: https://github.com/N2IT
    • LinkedIn: https://www.linkedin.com/in/tony-eder/
    
    Feel free to reach out for collaborations or opportunities!`
  };

  const helpMenu = `
Available commands:

1. introduction - Learn about me
2. projects    - View my portfolio
3. skills      - See my technical skills
4. contact     - Get in touch
5. clear       - Clear the terminal
6. help        - Show this menu
`;

  // Add scroll into view function
  const scrollToBottom = () => {
    if (inputLineRef.current) {
      inputLineRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Update typeText to scroll after animation
  const typeText = (text, onUpdate, onCursorMove) => {
    setIsTyping(true);
    setIsResponseTyping(true);
    
    return new Promise((resolve) => {
      let currentPos = 0;
      const interval = setInterval(() => {
        if (currentPos <= text.length) {
          onUpdate(text.slice(0, currentPos));
          onCursorMove(currentPos - 1);
          currentPos++;
          scrollToBottom(); // Scroll while typing
        } else {
          clearInterval(interval);
          onCursorMove(null);
          setIsTyping(false);
          setIsResponseTyping(false);
          scrollToBottom(); // Ensure we're scrolled to bottom after typing
          resolve();
        }
      }, 30);
    });
  };

  // Initial welcome message effect
  useEffect(() => {
    let mounted = true;
    setIsTyping(true);  // Ensure we're in typing state
    setIsResponseTyping(true);  // Prevent input cursor from showing

    typeText(
      welcomeMessage, 
      (result) => { 
        if (mounted) setText(result); 
      },
      (pos) => { 
        if (mounted) setCursorPosition(pos); 
      }
    );

    return () => {
      mounted = false;
      setText('');
      setCursorPosition(null);
      setIsTyping(false);
      setIsResponseTyping(false);
    };
  }, []);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && input.trim()) {
        setIsResponseTyping(true);
        const newCommand = { command: input, output: '', cursorPos: null };
        
        if (input.toLowerCase() === 'clear') {
          setCommandHistory([]);
          setInput('');
          setIsResponseTyping(false); // Allow input cursor after clear
          return;
        }

        setCommandHistory(prev => [...prev, newCommand]);
        const currentIndex = commandHistory.length;

        // Handle different commands
        const command = input.toLowerCase();
        if (menuContent[command] || command === '1' || command === '2' || 
            command === '3' || command === '4') {
          let content = '';
          
          // Map numbered commands to content
          if (command === '1') content = menuContent.introduction;
          else if (command === '2') content = menuContent.projects;
          else if (command === '3') content = menuContent.skills;
          else if (command === '4') content = menuContent.contact;
          else content = menuContent[command];

          typeText(
            content,
            (result) => {
              setCommandHistory(prev => {
                const updated = [...prev];
                updated[currentIndex] = {
                  ...updated[currentIndex],
                  output: result
                };
                return updated;
              });
            },
            (pos) => {
              setCommandHistory(prev => {
                const updated = [...prev];
                updated[currentIndex] = {
                  ...updated[currentIndex],
                  cursorPos: pos
                };
                return updated;
              });
            }
          );
        } else if (command === 'help') {
          typeText(
            helpMenu,
            (result) => {
              setCommandHistory(prev => {
                const updated = [...prev];
                updated[currentIndex] = {
                  ...updated[currentIndex],
                  output: result
                };
                return updated;
              });
            },
            (pos) => {
              setCommandHistory(prev => {
                const updated = [...prev];
                updated[currentIndex] = {
                  ...updated[currentIndex],
                  cursorPos: pos
                };
                return updated;
              });
            }
          );
        }
        
        setInput('');
        scrollToBottom();
      } else if (e.key === 'Backspace') {
        setInput(prev => prev.slice(0, -1));
      } else if (e.key.length === 1) {
        setInput(prev => prev + e.key);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [input, commandHistory]);

  const renderTextWithCursor = (text, cursorPos) => {
    if (cursorPos === null) return text;
    return (
      <>
        {text.slice(0, cursorPos + 1)}
        <div className="cursor"></div>
        {text.slice(cursorPos + 1)}
      </>
    );
  };

  return (
    <div 
      ref={containerRef}
      className="min-h-screen font-mono p-4 overflow-y-auto" 
      style={{ 
        backgroundColor: '#000000',
        color: '#00ff00',
        maxHeight: '100vh',
        height: '100vh',  // Force full viewport height
        position: 'fixed', // Keep the container fixed
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflowY: 'auto'
      }}
    >
      <div className="pb-20"> {/* Add padding at bottom for better scrolling */}
        <div 
          className="typing-text" 
          style={{ 
            whiteSpace: 'pre-line',
            minWidth: '600px',
            lineHeight: '1.5',
            marginBottom: '1rem'
          }}
        >
          {renderTextWithCursor(text, cursorPosition)}
        </div>
        
        {commandHistory.map((entry, index) => (
          <div key={index} className="mt-2">
            <div className="flex items-center">
              <span>$</span>
              <span className="ml-2">{entry.command}</span>
            </div>
            {entry.output && (
              <div 
                style={{ 
                  whiteSpace: 'pre-line',
                  minWidth: '600px',
                  lineHeight: '1.5'
                }} 
                className="mt-1"
              >
                {renderTextWithCursor(entry.output, entry.cursorPos)}
              </div>
            )}
          </div>
        ))}

        <div 
          ref={inputLineRef}
          className="flex items-center mt-4"
        >
          <span>$</span>
          <span className="ml-2">{input}</span>
          {!isTyping && !isResponseTyping && cursorPosition === null && <div className="cursor"></div>}
        </div>
      </div>
    </div>
  );
}

export default App;
