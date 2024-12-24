import { useState, useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';
import html2canvas from 'html2canvas';
import './App.css';

// Basic 3D cube component
function Box() {
  return (
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="green" />
    </mesh>
  );
}

// Separate mesh component for the content face
function ContentFace({ content }) {
  const contentRef = useRef();
  const materialRef = useRef();

  useEffect(() => {
    if (contentRef.current) {
      // Create a hidden div with our content
      const tempDiv = document.createElement('div');
      tempDiv.style.width = '1024px';
      tempDiv.style.height = '768px';
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.background = 'black';
      tempDiv.style.color = '#00ff00';
      tempDiv.style.padding = '20px';
      tempDiv.innerHTML = content;
      document.body.appendChild(tempDiv);

      // Convert the div to a texture
      html2canvas(tempDiv).then(canvas => {
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        
        if (materialRef.current) {
          materialRef.current.map = texture;
          materialRef.current.needsUpdate = true;
        }
        
        document.body.removeChild(tempDiv);
      });
    }
  }, [content]);

  return (
    <mesh position={[2, 0, -2]} rotation={[0, -Math.PI / 2, 0]}>
      <boxGeometry args={[4, 3, 0.1]} />
      <meshStandardMaterial 
        ref={materialRef}
        color="#ffffff"
        transparent
        opacity={1}
        emissive="#ffffff"
        emissiveIntensity={0.2}
      />
    </mesh>
  );
}

// Basic 3D scene component
function Scene({ currentFace }) {
  const { rotation } = useSpring({
    from: { rotation: [0, 0, 0] },
    to: { rotation: [0, Math.PI / 2, 0] },
    config: { duration: 1000 },
    delay: 500
  });

  const introContent = `
    <div class="p-6 text-green-400">
      <h1 class="text-2xl mb-4">Introduction</h1>
      <div class="space-y-4">
        <p>
          Hello! I'm a software developer with a passion for creating innovative solutions 
          and exploring new technologies.
        </p>
        <p>
          My expertise includes:
        </p>
        <ul class="list-disc list-inside space-y-2 ml-4">
          <li>Full-stack web development</li>
          <li>Cloud architecture and deployment</li>
          <li>UI/UX design</li>
          <li>Performance optimization</li>
        </ul>
      </div>
    </div>
  `;

  return (
    <Canvas 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        pointerEvents: 'none',
        zIndex: 0
      }}
      camera={{ position: [0, 0, 5], fov: 75 }}
    >
      <ambientLight intensity={1.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <pointLight position={[-10, -10, -10]} intensity={1} />
      
      <animated.group rotation={rotation}>
        {/* Terminal Face (Front) */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[4, 3, 0.1]} />
          <meshStandardMaterial color="green" emissive="green" emissiveIntensity={0.2} />
        </mesh>

        {/* Introduction Face (Right) */}
        <ContentFace content={introContent} />
      </animated.group>
    </Canvas>
  );
}

function App() {
  const [text, setText] = useState('');
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [show3D, setShow3D] = useState(false);
  const [currentFace, setCurrentFace] = useState('terminal');
  
  const TYPING_SPEED = 30;
  const welcomeMessage = "Welcome! Please type 'help' to get started";
  const helpMenu = `Available commands:
1. Introduction    - Learn more about me
2. Experience     - View my work experience
3. Achievements   - See my accomplishments
4. Projects       - Browse my projects
5. Education      - View my educational background
6. Contact        - Get in touch with me

Type a number or command to continue...
Type 'clear' to reset the terminal`;

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
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShow3D(false);
        setCurrentFace('terminal');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && input.trim()) {
        const newCommand = { command: input, output: '', cursorPos: null };
        
        if (input.toLowerCase() === 'clear') {
          setCommandHistory([]);
          setInput('');
          return;
        }

        // Toggle 3D scene when typing 'introduction' or '1'
        if (input.toLowerCase() === 'introduction' || input === '1') {
          console.log('Setting show3D to true');
          setShow3D(true);
          setCurrentFace('introduction');
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

  console.log('show3D state:', show3D); // Debug log

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
    <div 
      className="min-h-screen font-mono p-4" 
      style={{ 
        backgroundColor: '#000000',
        color: '#00ff00'
      }}
    >
      {show3D && <Scene currentFace={currentFace} />}
      
      <div style={{ 
        position: 'relative', 
        zIndex: 1,
        opacity: currentFace === 'terminal' ? 1 : 0,
        transition: 'opacity 0.5s ease-in-out'
      }}>
        <div className="typing-text" style={{ whiteSpace: 'pre-line' }}>
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
    </div>
  );
}

export default App;
