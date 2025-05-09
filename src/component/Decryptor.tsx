import { useState, useEffect } from 'react';
import './Decryptor.css';

interface GameProps {
  onWin: () => void;
  onClose: () => void;
  encryptedText: string;
}

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

const MiniGame = ({ onWin, onClose, encryptedText }: GameProps) => {
  const [starPosition, setStarPosition] = useState({ x: 50, y: 50 });
  const [timeLeft, setTimeLeft] = useState(10);
  const [isPlaying, setIsPlaying] = useState(true);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [level, setLevel] = useState(1);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [isSpeedBoost, setIsSpeedBoost] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);

  const getLevelSpeed = (level: number) => {
    const baseSpeed = 650;
    const speedMultiplier = Math.max(0.4, 1 - (level - 1) * 0.15);
    return Math.round(baseSpeed * speedMultiplier);
  };

  useEffect(() => {
    if (!isPlaying || gameOver || showLevelComplete) return;

    const moveStar = () => {
      setStarPosition({
        x: Math.random() * 90,
        y: Math.random() * 90
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

    // Use 250ms speed for the first second, then normal level speed
    const starInterval = setInterval(moveStar, isSpeedBoost ? 250 : getLevelSpeed(level));

    // Reset speed boost after 1 second
    const speedBoostTimer = setTimeout(() => {
      setIsSpeedBoost(false);
    }, 1000);

    return () => {
      clearInterval(timer);
      clearInterval(starInterval);
      clearTimeout(speedBoostTimer);
    };
  }, [isPlaying, gameOver, level, showLevelComplete, isSpeedBoost]);

  const handleMiss = () => {
    setLives(prev => {
      const newLives = prev - 1;
      if (newLives <= 0) {
        setGameOver(true);
      }
      return newLives;
    });
  };

  const handleWin = () => {
    setShowCongrats(true);
    // Wait for animation to complete before showing decrypted text
    setTimeout(() => {
      onWin();
      setIsPlaying(false);
    }, 3000);
  };

  const handleStarClick = () => {
    if (level < 5) {
      setShowLevelComplete(true);
    } else {
      handleWin();
    }
  };

  const handleNextLevel = () => {
    setLevel(prev => prev + 1);
    setTimeLeft(10);
    setLives(3); // Reset hearts
    setShowLevelComplete(false);
    // Set random star position for the new level
    setStarPosition({
      x: Math.random() * 90,
      y: Math.random() * 90
    });
    // Activate speed boost for the first second
    setIsSpeedBoost(true);
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
    setIsSpeedBoost(true); // Activate speed boost on restart too
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

  const renderCongrats = () => (
    <div className="congrats-overlay">
      <div className="congrats-content">
        <h2>🎉 Congratulations! 🎉</h2>
        <div className="confetti-container">
          {[...Array(50)].map((_, i) => (
            <div key={i} className="confetti" style={{
              '--delay': `${Math.random() * 2}s`,
              '--x': `${Math.random() * 100}%`,
              '--color': `hsl(${Math.random() * 360}, 100%, 50%)`
            } as React.CSSProperties} />
          ))}
        </div>
        <p className="decrypted-text">
          {caesarDecrypt(encryptedText, 8).split('').reverse().join('')}
        </p>
      </div>
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
        ) : showCongrats ? (
          renderCongrats()
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

  const handleGameWin = () => {
    setIsAnimating(true);
    const decrypted = caesarDecrypt(encryptedText, 8);
    const reversed = decrypted.split('').reverse().join('');
    setDecryptedText(reversed);
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
          onClick={() => setShowGame(true)}
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
          encryptedText={encryptedText}
        />
      )}
    </div>
  );
};

export default Decryptor; 