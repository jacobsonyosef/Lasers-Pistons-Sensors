import ObjectFactory from './ObjectFactory.js';

export default class GameGrid {   
    constructor(n) {
        this.grid = {};
        this.size = n;
        this.won = false;

        for (let i = 0; i < n; i++) {
            this.grid[i] = [];
            for (let j = 0; j < n; j++) {
                this.grid[i][j] = {};
            }
        }
    }

    setObjectAt(x, y, object) {
        this.grid[x][y] = object;
    }

    loadLevel(levelGrid, orientationMatrix) {
        for (let i = 0; i < levelGrid.length; i++) {
            for (let j = 0; j < levelGrid.length; j++) {
                this.grid[i][j] = ObjectFactory.CreateObject(levelGrid[i][j], orientationMatrix[i][j]);
            }
        }
    }

    getObjectAt(x, y) {
        return this.grid[x][y];
    }

    getObjectsByID(id) {
        let objects = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j].objectID === id) {
                    objects.push({object: this.grid[i][j], position: {x: i, y: j}});
                }
            }
        }

        return objects;
    }
}