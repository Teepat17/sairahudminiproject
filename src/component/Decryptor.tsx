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
  const [isSpeedBoost, setIsSpeedBoost] = useState(false);
  const [direction, setDirection] = useState({ x: 1, y: 1 });
  const [speed, setSpeed] = useState({ x: 2, y: 2 });

  const getLevelSpeed = (level: number) => {
    const baseSpeed = 650;
    const speedMultiplier = Math.max(0.4, 1 - (level - 1) * 0.15);
    return Math.round(baseSpeed * speedMultiplier);
  };

  useEffect(() => {
    if (!isPlaying || gameOver || showLevelComplete) return;

    const moveStar = () => {
      setStarPosition(prev => {
        let newX = prev.x + speed.x * direction.x;
        let newY = prev.y + speed.y * direction.y;

        // Bounce off walls
        if (newX <= 0 || newX >= 90) {
          setDirection(prev => ({ ...prev, x: -prev.x }));
          newX = newX <= 0 ? 0 : 90;
        }
        if (newY <= 0 || newY >= 90) {
          setDirection(prev => ({ ...prev, y: -prev.y }));
          newY = newY <= 0 ? 0 : 90;
        }

        return { x: newX, y: newY };
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
  }, [isPlaying, gameOver, level, showLevelComplete, isSpeedBoost, direction, speed]);

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
    // Set random initial position and direction
    setStarPosition({
      x: Math.random() * 90,
      y: Math.random() * 90
    });
    setDirection({
      x: Math.random() > 0.5 ? 1 : -1,
      y: Math.random() > 0.5 ? 1 : -1
    });
    // Increase speed with each level
    setSpeed({
      x: 2 + (level * 0.5),
      y: 2 + (level * 0.5)
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
    setSpeed({ x: 2, y: 2 });
    setDirection({
      x: Math.random() > 0.5 ? 1 : -1,
      y: Math.random() > 0.5 ? 1 : -1
    });
    setIsSpeedBoost(true);
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