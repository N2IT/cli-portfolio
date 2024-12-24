import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [text, setText] = useState('')
  const [input, setInput] = useState('')
  const [commandHistory, setCommandHistory] = useState([])
  const [cursorPosition, setCursorPosition] = useState(0)
  const [isTyping, setIsTyping] = useState(true)
  
  const TYPING_SPEED = 30; // Consistent typing speed in milliseconds
  const welcomeMessage = "Welcome! Please type 'help' to get started"
  const helpMenu = `
Available commands:
1. Introduction    - Learn more about me
2. Experience     - View my work experience
3. Achievements   - See my accomplishments
4. Projects       - Browse my projects
5. Education      - View my educational background
6. Contact        - Get in touch with me

Type a number or command to continue...
Type 'clear' to reset the terminal`

  const typeText = async (text, callback, updateCursor) => {
    setIsTyping(true);
    let result = '';
    
    for (let i = 0; i < text.length; i++) {
      await new Promise(resolve => setTimeout(resolve, TYPING_SPEED));
      result += text[i];
      updateCursor(i);
      callback(result);
    }
    updateCursor(null);
    setIsTyping(false);
  };

  useEffect(() => {
    let mounted = true;
    typeText(
      welcomeMessage, 
      (result) => { if (mounted) setText(result); },
      (pos) => { if (mounted) setCursorPosition(pos); }
    );
    return () => {
      mounted = false;
      setText('');
      setCursorPosition(null);
      setIsTyping(false);
    };
  }, []);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && input.trim()) {
        const newCommand = { command: input, output: '', cursorPos: null };
        
        // Handle clear command
        if (input.toLowerCase() === 'clear') {
          setCommandHistory([]);
          setInput('');
          return;
        }
        
        setCommandHistory(prev => [...prev, newCommand]);
        
        if (input.toLowerCase() === 'help') {
          const newHistory = [...commandHistory, newCommand];
          const currentIndex = newHistory.length - 1;
          
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
        <div className="cursor" style={{ display: 'inline-block' }}></div>
        {text.slice(cursorPos + 1)}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono p-4">
      <div className="typing-text">
        {renderTextWithCursor(text, cursorPosition)}
      </div>
      
      {commandHistory.map((entry, index) => (
        <div key={index} className="mt-2">
          <div className="flex items-center">
            <span>$</span>
            <span className="ml-2">{entry.command}</span>
          </div>
          {entry.output && (
            <div style={{ whiteSpace: 'pre-line' }} className="mt-1">
              {renderTextWithCursor(entry.output, entry.cursorPos)}
            </div>
          )}
        </div>
      ))}

      <div className="flex items-center mt-4">
        <span>$</span>
        <span className="ml-2">{input}</span>
        {!isTyping && cursorPosition === null && <div className="cursor"></div>}
      </div>
    </div>
  )
}

export default App
