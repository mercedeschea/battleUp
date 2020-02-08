

/* TODO
handling needs to care about being above/below a platform for which side to put you on 
*/
function isCharacterColliding(PlayerCharacter) {
    // Convert the player character to useful coordinates
    let pc = PlayerCharacter;
    let PlayerGWCords = convertCharacterToGameWorldCoords(pc.x, pc.y);
    let PlayerCartCords = convertToCartesianCoords(PlayerGWCords.gameWorldX, PlayerGWCords.gameWorldY, pc.game.mapHeight);
    let PlayerCircleInfo = { // rebuild this simple circle each time we update()
        radius: pc.radius,
        cartesianX: PlayerCartCords.cartesianX,
        cartesianY: PlayerCartCords.cartesianY
    }
    let mapHeight = pc.game.mapHeight;

    for (const platform of pc.placeformManager.placeformsCurrent) {
        if (platform.type === 'center') {
            let equation = convertHorizontalPlatformToEquation(platform, mapHeight);
            if (isCircleCollidingWithHorizontalLine(PlayerCircleInfo, equation)) {
                pc.colliding = true;
                pc.collidingWithHoriz = true;
                pc.y -= 10;
            }
        } else if (platform.type === 'left') {
            let equation = convertLeftSlopedPlatformToEquation(platform, mapHeight);
            if(isCircleCollidingWithSlopedLine(PlayerCircleInfo, equation)) {
                pc.colliding = true;
                pc.collidingWithLeftSlope = true;
            }
        } else {
            let equation = convertRightSlopedPlatformToEquation(platform, mapHeight);
            if(isCircleCollidingWithSlopedLine(PlayerCircleInfo, equation)) {
                pc.colliding = true;
                pc.collidingWithRightSlope = true;
            }
        }
    }

    for (const gen of genForms) {
        let equation = convertHorizontalPlatformToEquation(gen, mapHeight);
        if (isCircleCollidingWithHorizontalLine(PlayerCircleInfo, equation)) {
            pc.colliding = true;
            pc.collidingWithHoriz = true;
        }    
    }
}




function convertRightSlopedPlatformToEquation(platform, gameWorldHeight) { /* " / " */
    let slope = 1;
    /*
    Line equation using bottom left point: 
    y = m x + b
    max - (this.y + 80) = (slope)(this.x) + b
    b = max - (this.y + 80) - (slope)(this.x)
    */
    return {
        mSlope: slope,
        bOffset: (gameWorldHeight - (platform.y + 80) - (slope * platform.x)),
        xLeft: platform.x,
        xRight: (platform.x + 80)
    }
}

function convertLeftSlopedPlatformToEquation(platform, gameWorldHeight) { /* " \ " */
    let slope = -1;
    // y = mx + b
    // top left point of this platform is (this.x + 7, this.y) 
    // gameHeight - this.y = (-1) * (this.x + 7) + b 
    return {
        mSlope: slope,
        bOffset: (gameWorldHeight - platform.y) + (platform.x + 7),
        xLeft: platform.x,
        xRight: platform.x + 83,
        yValue: gameWorldHeight - platform.y - 30
    }
}

function isCircleCollidingWithSlopedLine(CircleInfo, LineInfo) {
    const a = 2;
    const b = 2 * LineInfo.mSlope * (LineInfo.bOffset - CircleInfo.cartesianY) - 2 * CircleInfo.cartesianX;
    const c = CircleInfo.cartesianX * CircleInfo.cartesianX + (LineInfo.bOffset - CircleInfo.cartesianY) * (LineInfo.bOffset - CircleInfo.cartesianY) 
        - CircleInfo.radius * CircleInfo.radius;

    let answer = quadraticFormula(a, b, c);
    if (isNaN(answer.result1) && isNaN(answer.result2)) {
        return false;
    } else if ((CircleInfo.cartesianX >= LineInfo.xLeft) && (CircleInfo.cartesianX <= LineInfo.xRight)) {
        return true;
    }
}



function convertHorizontalPlatformToEquation(platform, gameWorldHeight) {
    return {
        yValue: gameWorldHeight - platform.y, 
        xLeft: platform.x, 
        xRight: platform.x + 119
    };
}

function isCircleCollidingWithHorizontalLine(CircleInfo, LineInfo) { // Char is circle, Platform is a line
    const a = 1;
    const b = -2 * CircleInfo.cartesianX;
    const c = CircleInfo.cartesianX * CircleInfo.cartesianX + LineInfo.yValue * LineInfo.yValue 
        - 2 * CircleInfo.cartesianY * LineInfo.yValue + CircleInfo.cartesianY * CircleInfo.cartesianY 
        - CircleInfo.radius * CircleInfo.radius;

    let answer = quadraticFormula(a,b,c);

    if (isNaN(answer.result1) && isNaN(answer.result2)) {
        return false;
    } else if ((CircleInfo.cartesianX >= LineInfo.xLeft) && (CircleInfo.cartesianX <= LineInfo.xRight) && (CircleInfo.cartesianY -25) >= LineInfo.yValue) {
        return true;
    }
}


function convertCharacterToGameWorldCoords(thisX, thisY) {
    // Assumes the circle character is a 64x68 sprite with 4 dead pixels on top
    return { gameWorldX: thisX + 32.5, gameWorldY: thisY + 36.5 };
}

function convertToCartesianCoords(gameWorldX, gameWorldY, gameHeight) {
    return { cartesianX: gameWorldX, cartesianY: gameHeight - gameWorldY };
}

function quadraticFormula(a, b, c) {
    var result1 = (-1 * b + Math.sqrt(Math.pow(b, 2) - (4 * a * c))) / (2 * a);
    var result2 = (-1 * b - Math.sqrt(Math.pow(b, 2) - (4 * a * c))) / (2 * a);
    return {result1: result1, result2: result2};
}