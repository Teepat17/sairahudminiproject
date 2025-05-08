import { useState } from 'react';
import './Decryptor.css';

const Decryptor = () => {
  const [encryptedText, setEncryptedText] = useState('');
  const [decryptedText, setDecryptedText] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

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
    setIsAnimating(true);
    
    // Step 1: Caesar decryption with shift 8
    const decrypted = caesarDecrypt(encryptedText, 8);
    
    // Step 2: Reverse the decrypted text
    const reversed = decrypted.split('').reverse().join('');
    setDecryptedText(reversed);

    // Reset animation state after animation completes
    setTimeout(() => setIsAnimating(false), 1000);
  };

  return (
    <div className="decryptor-container">
      <h1 className="title">Text Decryptor</h1>
      
      <div className="input-section">
        <textarea
          value={encryptedText}
          onChange={(e) => setEncryptedText(e.target.value)}
          placeholder="Enter encrypted text here..."
          className="input-field"
        />
        <button 
          onClick={handleDecrypt}
          className="decrypt-button"
          disabled={!encryptedText}
        >
          Decrypt
        </button>
      </div>

      <div className="results-section">
        <div className={`result-card ${isAnimating ? 'animate' : ''}`}>
          <h2>Decrypted Text</h2>
          <p>{decryptedText}</p>
        </div>
      </div>
    </div>
  );
};

export default Decryptor; 