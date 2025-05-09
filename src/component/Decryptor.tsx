import { useState, useEffect } from 'react';
import './Decryptor.css';

interface GameProps {
  onWin: () => void;
  onClose: () => void;
}

const MiniGame = ({ onWin, onClose }: GameProps) => {
  const [starPosition, setStarPosition] = useState({ x: 50, y: 50 });
  const [timeLeft, setTimeLeft] = useState(10);
  const [isPlaying, setIsPlaying] = useState(true);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const moveStar = () => {
      setStarPosition({
        x: Math.random() * 200,
        y: Math.random() * 200
      });
    };

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleMiss();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    // Move star every 500ms instead of 1000ms to make it faster
    const starInterval = setInterval(moveStar, 500);

    return () => {
      clearInterval(timer);
      clearInterval(starInterval);
    };
  }, [isPlaying, gameOver]);

  const handleMiss = () => {
    setLives(prev => {
      const newLives = prev - 1;
      if (newLives <= 0) {
        setGameOver(true);
      }
      return newLives;
    });
  };

  const handleStarClick = () => {
    onWin();
    setIsPlaying(false);
  };

  const handleGameAreaClick = (e: React.MouseEvent) => {
    // Only count as miss if clicking the game area itself, not its children
    if (e.target === e.currentTarget) {
      handleMiss();
    }
  };

  const handleRestart = () => {
    setLives(3);
    setTimeLeft(10);
    setGameOver(false);
    setIsPlaying(true);
  };

  return (
    <div className="mini-game-overlay">
      <div className="mini-game">
        <h2>Catch the Star!</h2>
        <div className="game-stats">
          <p>Time left: {timeLeft}s</p>
          <div className="lives">
            {[...Array(lives)].map((_, i) => (
              <span key={i} className="heart">❤️</span>
            ))}
          </div>
        </div>
        {gameOver ? (
          <div className="game-over">
            <h3>Game Over!</h3>
            <p className="game-over-message">น้องน้องจับดาวให้ได้ถึงจะรู้คำใบ้นะ :3 ลองใหม่อีกครั้งนะT-T</p>
            <button className="restart-button" onClick={handleRestart}>
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="game-area" onClick={handleGameAreaClick}>
              <div
                className="star"
                style={{
                  left: `${starPosition.x}%`,
                  top: `${starPosition.y}%`
                }}
                onClick={handleStarClick}
              >
                ⭐
              </div>
            </div>
            <button className="close-button" onClick={onClose}>
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const Decryptor = () => {
  const [encryptedText, setEncryptedText] = useState('');
  const [decryptedText, setDecryptedText] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [showGame, setShowGame] = useState(false);

  const caesarDecrypt = (text: string, shift: number) => {
    return text
      .split('')
      .map(char => {
        if (char.match(/[a-z]/i)) {
          const code = char.charCodeAt(0);
          const isUpperCase = code >= 65 && code <= 90;
          const base = isUpperCase ? 65 : 97;
          return String.fromCharCode(((code - base - shift + 26) % 26) + base);
        }
        return char;
      })
      .join('');
  };

  const handleDecrypt = () => {
    setShowGame(true);
  };

  const handleGameWin = () => {
    setIsAnimating(true);
    
    // Step 1: Caesar decryption with shift 8
    const decrypted = caesarDecrypt(encryptedText, 8);
    
    // Step 2: Reverse the decrypted text
    const reversed = decrypted.split('').reverse().join('');
    setDecryptedText(reversed);

    // Reset animation state after animation completes
    setTimeout(() => setIsAnimating(false), 1000);
    setShowGame(false);
  };

  return (
    <div className="decryptor-container">
      <h1 className="title">เครื่องแก้คำใบ้!!</h1>
      
      <div className="input-section">
        <textarea
          value={encryptedText}
          onChange={(e) => setEncryptedText(e.target.value)}
          placeholder="ใส่คำใบ้ตรงนี้ได้เลยครับน้อง"
          className="input-field"
        />
        <button 
          onClick={handleDecrypt}
          className="decrypt-button"
          disabled={!encryptedText}
        >
          แก้คำใบ้
        </button>
      </div>

      <div className="results-section">
        <div className={`result-card ${isAnimating ? 'animate' : ''}`}>
          <h2>แก้ได้ว่า?</h2>
          <p>{decryptedText}</p>
        </div>
      </div>

      {showGame && (
        <MiniGame
          onWin={handleGameWin}
          onClose={() => setShowGame(false)}
        />
      )}
    </div>
  );
};

export default Decryptor; 