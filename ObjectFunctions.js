import ObjectFactory from './ObjectFactory.js';

export default class ObjectFunctions {
    // Blocks fall straight down and nothing else
    static BlockFall(gameGrid, x, y) {
        let nextX = x + 1;
        let nextY = y;
        let gridSize = gameGrid.size;

        if (nextX < gridSize) {
            switch (gameGrid.grid[nextX][nextY].objectID) {
                case 9:
                    // collision with laser. The block is destroyed.
                    return {x : [x], y: [y], objects: [ObjectFactory.CreateObject(10, 0)]};

                case 10:
                    // empty space. Block moves down into the space
                    return { x: [x, nextX], y: [y, nextY], objects: [ObjectFactory.CreateObject(10, 0), this] };
            }
        }

        return null;
    }

    // The laser gun shoots a laser each turn
    static LaserFire(gameGrid, x, y) {
        let move = ObjectFunctions.GetMovementFromOrientation(this.orientation);
        let xMove = move.x;
        let yMove = move.y;

        let nextX = x + xMove;
        let nextY = y + yMove;
        let gridSize = gameGrid.size;


        if (nextX >= 0 && nextX < gridSize && nextY >= 0 && nextY < gridSize) {
            let gridObject = gameGrid.grid[nextX][nextY];
            switch (gridObject.objectID) {
                case 0:
                    // block is right next to laser gun. Block is destroyed.
                    return { x: [nextX], y: [nextY], objects: [ObjectFactory.CreateObject(10, gridObject.orientation)] };

                case 2:
                    // idle sensor is next to laser gun. It is activated.
                    return { x: [nextX], y: [nextY], objects: [ObjectFactory.CreateObject(3, gridObject.orientation)] };

                case 3:
                    // active sensor is next to laser gun. It is deactivated.
                    return { x: [nextX], y: [nextY], objects: [ObjectFactory.CreateObject(2, gridObject.orientation)] };

                case 10:
                    // empty space is next to laser gun. A laser is spawned in the empty space.
                    return { x: [nextX], y: [nextY], objects: [ObjectFactory.CreateObject(9, this.orientation)] };

                default:
                    return null;
            }
        }

        return null;
    }

    static Laser(gameGrid, x, y) {
        let move = ObjectFunctions.GetMovementFromOrientation(this.orientation);
        let xMove = move.x;
        let yMove = move.y;

        let nextX = x + xMove;
        let nextY = y + yMove;

        let gridSize = gameGrid.size;

        if (nextX >= 0 && nextX < gridSize && nextY >= 0 && nextY < gridSize) {
            let gridObject = gameGrid.grid[nextX][nextY];
            switch (gridObject.objectID) {
                case 0:
                    //console.log("laser killed block");
                    return { x: [x, nextX], y: [x, nextY], objects: [ObjectFactory.CreateObject(10, this.orientation), ObjectFactory.CreateObject(10, gridObject.orientation)] };

                case 2:
                    //console.log('laser turned sensor on');
                    return { x: [x, nextX], y: [y, nextY], objects: [ObjectFactory.CreateObject(10, this.orientation), ObjectFactory.CreateObject(3, gridObject.orientation, gridObject)] };

                case 3:
                    //console.log('laser turned sensor off');
                    return { x: [x, nextX], y: [y, nextY], objects: [ObjectFactory.CreateObject(10, this.orientation), ObjectFactory.CreateObject(2, gridObject.orientation, gridObject)] };

                case 9:
                    //console.log('laser hit another laser');
                    return { x: [nextX], y: [nextY], objects: [ObjectFactory.CreateObject(9, gridObject.orientation)] };

                case 10:
                    //console.log('laser hit nothing');
                    return { x: [nextX], y: [nextY], objects: [ObjectFactory.CreateObject(9, this.orientation)] };
            }
        }
        else {
            return { x: [x], y: [y], objects: [ObjectFactory.CreateObject(10, this.orientation)] };
        }
    }

    static PistonPush(gameGrid, x, y) {
        let move = ObjectFunctions.GetMovementFromOrientation(this.orientation);
        let xMove = move.x;
        let yMove = move.y;

        let nextX = x + xMove;
        let nextY = y + yMove;
        let pistonArm = this.createObject;
        let gridSize = gameGrid.size;

        if (nextX >= 0 && nextX < gridSize && nextY >= 0 && nextY < gridSize) {
            let gridObject = gameGrid.grid[nextX][nextY];
            switch (gridObject.objectID) {
                case 0:
                    // pushing the block
                    if (nextX + xMove >= 0 && nextX + xMove < gridSize) {
                        let pushTo = gameGrid.grid[nextX + xMove][nextY + yMove];
                        if (pushTo.objectID === 10) {
                            // there is room to push and empty space at the destination. Push the block.
                            return { x: [nextX + xMove, nextX], y: [nextY + yMove, nextY], objects: [gameGrid.grid[nextX][nextY], pistonArm] };
                        }
                        else if (pushTo.objectID === 1) {
                            // there is room to push and the exit is the destination. 'Push' the block, set game state to 'won'.
                            gameGrid.won = true;
                            return {x: [nextX], y:[nextY], objects: [ObjectFactory.CreateObject(8, this.orientation)]};
                        }
                    }
                case 10:
                    // empty space next to the piston. Create the piston arm there.
                    return { x: [nextX], y: [nextY], objects: [ObjectFactory.CreateObject(8, this.orientation)] };

                default:
                    return null;
            }
        }

        return null;
    }

    static PistonRetract(gameGrid, x, y) {
        let move = ObjectFunctions.GetMovementFromOrientation(this.orientation);
        let xMove = move.x;
        let yMove = move.y;

        let nextX = x + xMove;
        let nextY = y + yMove;

        if (nextX >= 0 && nextX < gameGrid.size && nextY >= 0 && nextY < gameGrid.size) {
            let adjacentObject = gameGrid.grid[nextX][nextY];
            if (adjacentObject.objectID === 8) {
                // if an inactive piston has an arm next to it, retract the arm.
                return { x: [nextX], y: [nextY], objects: [ObjectFactory.CreateObject(10, this.orientation)] };
            }
        }

        return null;
    }

    static Exit(gameGrid, x, y) {
        // if a block is above the exit, the game is won.
        if (gameGrid.grid[x - 1][y].objectID === 0) {
            gameGrid.won = true;
            return { x: [x - 1], y: [y], objects: [{ objectID: 10, orientation: 0 }] };
        }
    }

    static SensorIdle(gameGrid, x, y) {
        // check all adjacent tiles for a block
        let positionsToCheck = { x: [], y: [] };
        let gridSize = gameGrid.size;

        if (x - 1 >= 0) {
            positionsToCheck.x.push(x - 1);
            positionsToCheck.y.push(y);
        }

        if (x + 1 < gridSize) {
            positionsToCheck.x.push(x + 1);
            positionsToCheck.y.push(y);
        }

        if (y - 1 >= 0) {
            positionsToCheck.y.push(y - 1);
            positionsToCheck.x.push(x);
        }

        if (y + 1 < gridSize) {
            positionsToCheck.y.push(y + 1);
            positionsToCheck.x.push(x);
        }

        for (let i = 0; i < positionsToCheck.x.length; i++) {
            let checkX = positionsToCheck.x[i];
            let checkY = positionsToCheck.y[i];
            let gridObject = gameGrid.grid[checkX][checkY];
            if (gridObject.objectID === 0) {
                // if there's a block, turn this sensor on
                return { x: [x], y: [y], objects: [ObjectFactory.CreateObject(3, this.orientation, this)] };
            }
        }
    }

    static SensorConnect(sensor, objectToConnect) {
        sensor.connectedObject = objectToConnect;
    }

    static SensorToggle() {
        if (this.connectedObject) {
            ObjectFunctions.ToggleState(this.connectedObject);
        }
    }

    static SensorOff() {
        if (this.connectedObject) {
            ObjectFunctions.ToggleState(this.connectedObject);
        }

        ObjectFunctions.ToggleState(this);
    }

    static GetMovementFromOrientation(orientation) {
        let xMove = (orientation & 1) === 0 ? 0 : 1;
        let yMove = (orientation & 1) === 1 ? 0 : 1;
        xMove = (orientation & 2) === 0 ? xMove : -xMove;
        yMove = (orientation & 2) === 2 ? -yMove : yMove;

        return { x: xMove, y: yMove };
    }

    static ToggleState(object) {
        if (object.objectID === 2 || object.objectID === 4 || object.objectID == 6) {
            object = ObjectFactory.CreateObject(object.objectID + 1, object.orientation, object);
        }
        else if (object.objectID === 3 || object.objectID === 5 || object.objectID === 7) {
            object = ObjectFactory.CreateObject(object.objectID - 1, object.orientation, object);
        }
    }
}