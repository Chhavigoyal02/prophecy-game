# Foundations of AI Project

**Prophecies Game**  

To play the game online, visit: [https://prophecy-game.netlify.app/](https://prophecy-game.netlify.app/)  

To run locally:
1. Clone the repo: `git clone https://github.com/Chhavigoyal02/prophecy-game.git`
2. Navigate to the project directory: `cd prophecy-game`
3. Install dependencies: `npm install`
4. Run: `npm run dev`

   
---

## Features  

1. **Game Modes**:  
   - **Single Player**: Compete against an AI bot with adjustable strategies.  
   - **Multiplayer**: Play with a friend and challenge each other.
     
2. **AI Strategies**:  
   - **Random Bot**: Makes moves randomly.  
   - **Optimal Bot**: Implements an optimized minimax algorithm with alpha beta pruning.

---
**NOTE:**
To toggle between the Random and Optimal Bot in Single Player Mode:
In [line 26 of Grid.jsx](./src/components/Grid.jsx#L26), replace `OptimalBot()` with `RandomBot()` or the other way around to switch between them.
