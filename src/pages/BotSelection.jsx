import React from 'react';
import { useNavigate } from 'react-router-dom';
import Buttons from '../components/Buttons';

const BotSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="game-title mb-8">Choose Your Opponent</h1>
      <div className="flex flex-col space-y-4 w-full max-w-xs">
        <Buttons 
          text="Random Bot" 
          onClick={() => navigate('/game/single-player/random')}
          otherClass="text-lg"
        />
        <Buttons 
          text="Optimal Bot" 
          onClick={() => navigate('/game/single-player/optimal')}
          otherClass="text-lg"
        />
        <Buttons 
          text="Back" 
          onClick={() => navigate('/')}
          otherClass="text-lg bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700"
        />
      </div>
    </div>
  );
};

export default BotSelection; 