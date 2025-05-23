// src/game/OptimalBot.js
export class OptimalBot {
  constructor() {
    this.maxDepth = 3;
    this.timeLimit = 2000; // 2 seconds time limit
  }

  makeMove(grid, getUnavailableNumbers) {
    try {
      const moves = this.getValidMoves(grid, getUnavailableNumbers);
      if (moves.length === 0) return null;

      let bestMove = null;
      let bestScore = -Infinity;
      const startTime = Date.now();

      for (const move of moves) {
        for (const value of move.values) {
          // Skip X unless it's the only option
          if (value === 'X' && move.values.length > 1) continue;

          const newGrid = grid.map(row => [...row]);
          newGrid[move.row][move.col] = value;

          const score = this.minimax(
            newGrid,
            this.maxDepth,
            -Infinity,
            Infinity,
            false,
            getUnavailableNumbers,
            startTime
          );

          if (score > bestScore) {
            bestScore = score;
            bestMove = { row: move.row, col: move.col, value };
          }
        }
      }

      return bestMove || this.makeFallbackMove(moves[0]);
    } catch (error) {
      console.error('Error in makeMove:', error);
      return this.makeFallbackMove(grid, getUnavailableNumbers);
    }
  }

  minimax(grid, depth, alpha, beta, isMaximizing, getUnavailableNumbers, startTime) {
    if (depth === 0 || this.isGameOver(grid) || Date.now() - startTime > this.timeLimit) {
      return this.evaluatePosition(grid);
    }

    const moves = this.getValidMoves(grid, getUnavailableNumbers);

    if (isMaximizing) {
      let maxScore = -Infinity;
      for (const move of moves) {
        for (const value of move.values) {
          if (value === 'X' && move.values.length > 1) continue;

          const newGrid = grid.map(row => [...row]);
          newGrid[move.row][move.col] = value;

          const score = this.minimax(
            newGrid,
            depth - 1,
            alpha,
            beta,
            false,
            getUnavailableNumbers,
            startTime
          );

          maxScore = Math.max(maxScore, score);
          alpha = Math.max(alpha, score);
          if (beta <= alpha) break;
        }
      }
      return maxScore;
    } else {
      let minScore = Infinity;
      for (const move of moves) {
        for (const value of move.values) {
          if (value === 'X' && move.values.length > 1) continue;

          const newGrid = grid.map(row => [...row]);
          newGrid[move.row][move.col] = value;

          const score = this.minimax(
            newGrid,
            depth - 1,
            alpha,
            beta,
            true,
            getUnavailableNumbers,
            startTime
          );

          minScore = Math.min(minScore, score);
          beta = Math.min(beta, score);
          if (beta <= alpha) break;
        }
      }
      return minScore;
    }
  }

  evaluatePosition(grid) {
    let score = 0;
    const rows = grid.length;
    const cols = grid[0].length;

    // Evaluate rows
    for (let i = 0; i < rows; i++) {
      score += this.evaluateLine(grid[i]);
    }

    // Evaluate columns
    for (let j = 0; j < cols; j++) {
      const column = grid.map(row => row[j]);
      score += this.evaluateLine(column);
    }

    return score;
  }

  evaluateLine(line) {
    const numbers = line.filter(cell => !isNaN(cell) && cell !== 'X');
    const numberCount = numbers.length;
    let score = 0;

    // If line is complete
    if (line.every(cell => cell !== null)) {
      numbers.forEach(num => {
        if (parseInt(num) === numberCount) {
          score += numberCount * 10; // Higher weight for completed correct prophecies
        }
      });
    } else {
      // Evaluate potential prophecies
      numbers.forEach(num => {
        const target = parseInt(num);
        const remainingSpaces = line.filter(cell => cell === null).length;
        const potentialNumbers = remainingSpaces; // Maximum additional numbers possible

        // If prophecy could still be correct
        if (numberCount <= target && numberCount + potentialNumbers >= target) {
          score += 5; // Reward for maintaining potential
        }
        
        // Extra points for prophecies close to completion
        if (target === numberCount) {
          score += 3;
        }
      });
    }

    return score;
  }

  getValidMoves(grid, getUnavailableNumbers) {
    const moves = [];
    const rows = grid.length;
    const cols = grid[0].length;

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (grid[i][j] === null) {
          const unavailable = getUnavailableNumbers(i, j, grid);
          const validValues = ['1', '2', '3', '4', '5', 'X'].filter(
            value => !unavailable.has(value)
          );

          if (validValues.length > 0) {
            // Prioritize numbers that could lead to correct prophecies
            const weight = this.calculateMoveWeight(grid, i, j, validValues);
            moves.push({
              row: i,
              col: j,
              values: this.orderMoves(validValues, grid, i, j),
              weight
            });
          }
        }
      }
    }

    return moves.sort((a, b) => b.weight - a.weight);
  }

  calculateMoveWeight(grid, row, col, validValues) {
    let weight = 0;
    const currentRow = grid[row];
    const currentCol = grid.map(r => r[col]);

    // Analyze row potential
    const rowNumbers = currentRow.filter(cell => !isNaN(cell) && cell !== 'X' && cell !== null);
    const rowPotential = this.analyzePotential(rowNumbers, validValues);
    weight += rowPotential;

    // Analyze column potential
    const colNumbers = currentCol.filter(cell => !isNaN(cell) && cell !== 'X' && cell !== null);
    const colPotential = this.analyzePotential(colNumbers, validValues);
    weight += colPotential;

    return weight;
  }

  analyzePotential(existingNumbers, validValues) {
    let potential = 0;
    const numberCount = existingNumbers.length;

    validValues.forEach(value => {
      if (value !== 'X') {
        const target = parseInt(value);
        if (target === numberCount + 1) {
          potential += 5; // High potential for immediate prophecy
        } else if (target > numberCount) {
          potential += 2; // Some potential for future prophecy
        }
      }
    });

    return potential;
  }

  orderMoves(moves, grid, row, col) {
    return moves.sort((a, b) => {
      // Prioritize numbers over X
      if (a === 'X' && b !== 'X') return 1;
      if (b === 'X' && a !== 'X') return -1;
      
      // Sort numbers by potential value
      if (a !== 'X' && b !== 'X') {
        const aVal = parseInt(a);
        const bVal = parseInt(b);
        // Prefer numbers that are closer to current count
        const currentCount = this.getCurrentNumberCount(grid, row, col);
        return Math.abs(aVal - currentCount) - Math.abs(bVal - currentCount);
      }
      return 0;
    });
  }

  getCurrentNumberCount(grid, row, col) {
    const rowCount = grid[row].filter(cell => !isNaN(cell) && cell !== 'X' && cell !== null).length;
    const colCount = grid.map(r => r[col]).filter(cell => !isNaN(cell) && cell !== 'X' && cell !== null).length;
    return Math.max(rowCount, colCount);
  }

  makeFallbackMove(moves) {
    // Choose the first non-X value if available
    const move = Array.isArray(moves) ? moves[0] : moves;
    const value = move.values.find(v => v !== 'X') || move.values[0];
    return {
      row: move.row,
      col: move.col,
      value
    };
  }

  isGameOver(grid) {
    return grid.every(row => row.every(cell => cell !== null));
  }
}