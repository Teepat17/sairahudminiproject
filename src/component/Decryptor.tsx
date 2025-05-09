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
  const [level, setLevel] = useState(1);
  const [showLevelComplete, setShowLevelComplete] = useState(false);

  const getLevelSpeed = (level: number) => {
    const baseSpeed = 1000;
    const speedMultiplier = Math.max(0.4, 1 - (level - 1) * 0.15);
    return Math.round(baseSpeed * speedMultiplier);
  };

  useEffect(() => {
    if (!isPlaying || gameOver || showLevelComplete) return;

    const moveStar = () => {
      setStarPosition({
        x: Math.random() * 100,
        y: Math.random() * 100
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

    const starInterval = setInterval(moveStar, getLevelSpeed(level));

    return () => {
      clearInterval(timer);
      clearInterval(starInterval);
    };
  }, [isPlaying, gameOver, level, showLevelComplete]);

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
    if (level < 5) {
      setShowLevelComplete(true);
    } else {
      onWin();
      setIsPlaying(false);
    }
  };

  const handleNextLevel = () => {
    setLevel(prev => prev + 1);
    setTimeLeft(10);
    setLives(3); // Reset hearts
    setShowLevelComplete(false);
    // Set random star position for the new level
    setStarPosition({
      x: Math.random() * 100,
      y: Math.random() * 100
    });
  };

  const handleGameAreaClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleMiss();
    }
  };

  const handleRestart = () => {
    setLives(3);
    setTimeLeft(10);
    setGameOver(false);
    setIsPlaying(true);
    setLevel(1);
    setShowLevelComplete(false);
  };

  const renderLevelComplete = () => (
    <div className="level-complete">
      <h3>Level {level} Complete! 🎉</h3>
      <p>Next Level: {level + 1}</p>
      <p>Difficulty: {level === 5 ? 'Final Level!' : `Star speed: ${getLevelSpeed(level + 1)}ms`}</p>
      <button className="next-level-button" onClick={handleNextLevel}>
        Continue to Level {level + 1}
      </button>
    </div>
  );

  return (
    <div className="mini-game-overlay">
      <div className="mini-game">
        <h2>Catch the Star!</h2>
        <div className="game-stats">
          <p>Level: {level}/5</p>
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
        ) : showLevelComplete ? (
          renderLevelComplete()
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