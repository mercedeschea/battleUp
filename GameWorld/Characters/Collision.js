

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

    for (const platform of pc.placeformManager.placeformsCurrent) {
        let equation = platform.equation;
        let aboveLine = platform.ABOVEequation;
        if (platform.type === 'center') {
            if (isCircleCollidingWithHorizontalLine(PlayerCircleInfo, equation, pc)) {
                pc.colliding = true;
                pc.collidingWithHoriz = true;
                console.log("colliding with horiz");
                pc.y = pc.game.mapHeight - aboveLine.yValue;
            }
        } else if (platform.type === 'left') {
            if(isCircleCollidingWithSlopedLine(PlayerCircleInfo, equation, pc)) {
                pc.colliding = true;
                pc.collidingWithLeftSlope = true;
            }
        } else {
            if(isCircleCollidingWithSlopedLine(PlayerCircleInfo, equation, pc)) {
                pc.colliding = true;
                pc.collidingWithRightSlope = true;
            }
        }
    }

    for (const gen of genForms) {
        let equation = gen.equation;
        if (isCircleCollidingWithHorizontalLine(PlayerCircleInfo, equation, pc)) {
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

function convertHorizontalPlatformToEquation(platform, gameWorldHeight) {
    return {
        yValue: gameWorldHeight - platform.y, 
        xLeft: platform.x, 
        xRight: platform.x + 119
    };
}
function convertHorizontalPlatformToEquationABOVE(platform, gameWorldHeight) {
    return {
        yValue: gameWorldHeight - platform.y + 68, // 50 magic number rn
        xLeft: platform.x, 
        xRight: platform.x + 119
    };
}


function isCircleCollidingWithSlopedLine(CircleInfo, LineInfo, pc) {
    const a = 2;
    const b = 2 * LineInfo.mSlope * (LineInfo.bOffset - CircleInfo.cartesianY) - 2 * CircleInfo.cartesianX;
    const c = CircleInfo.cartesianX * CircleInfo.cartesianX + (LineInfo.bOffset - CircleInfo.cartesianY) * (LineInfo.bOffset - CircleInfo.cartesianY) 
        - CircleInfo.radius * CircleInfo.radius;

    let answer = quadraticFormula(a, b, c);
    let result1 = answer.result1;
    let result2 = answer.result2;
    if (isNaN(answer.result1) && isNaN(answer.result2)) {
        return false;
    } else if (((!isNaN(answer.result1) && isNaN(answer.result2)) || (isNaN(answer.result1) && !isNaN(answer.result2))) // one root
    // && ((CircleInfo.cartesianX >= LineInfo.xLeft) && (CircleInfo.cartesianX <= LineInfo.xRight))) {
    && ((result1 >= LineInfo.xLeft && result1 <= LineInfo.xRight) || (result2 >= LineInfo.xLeft && result2 <= LineInfo.xRight))) {    
        return true;
    } else {// ((CircleInfo.cartesianX >= LineInfo.xLeft) && (CircleInfo.cartesianX <= LineInfo.xRight)) {
        let toReturn = false;
        if (!isNaN(result1))
            toReturn = toReturn || (result1 >= LineInfo.xLeft && result1 <= LineInfo.xRight)
        if (!isNaN(result2))
            toReturn = toReturn || (result2 >= LineInfo.xLeft && result2 <= LineInfo.xRight)
        return toReturn;
    }
}

function isCircleCollidingWithHorizontalLine(CircleInfo, LineInfo, pc) { // Char is circle, Platform is a line
    const a = 1;
    const b = -2 * CircleInfo.cartesianX;
    const c = CircleInfo.cartesianX * CircleInfo.cartesianX + LineInfo.yValue * LineInfo.yValue 
        - 2 * CircleInfo.cartesianY * LineInfo.yValue + CircleInfo.cartesianY * CircleInfo.cartesianY 
        - CircleInfo.radius * CircleInfo.radius;

    let answer = quadraticFormula(a,b,c);
    // console.log("answer", answer);
    // console.log("CircleInfo", CircleInfo);
    // console.log("LineInfo", LineInfo);

    if (isNaN(answer.result1) && isNaN(answer.result2)) {
        // console.log("no collision");
        return false; // no roots
    } else if (((!isNaN(answer.result1) && isNaN(answer.result2)) || (isNaN(answer.result1) && !isNaN(answer.result2))) // one root
        && ((CircleInfo.cartesianX >= LineInfo.xLeft) && (CircleInfo.cartesianX <= LineInfo.xRight) )){//&& (CircleInfo.cartesianY -25) >= LineInfo.yValue)) {
        console.log("PERFECT COLLISION");    
        pc.y = pc.game.mapHeight - (LineInfo.yValue +50);

        return true;  // perfect collision
    } else if ((CircleInfo.cartesianX >= LineInfo.xLeft) && (CircleInfo.cartesianX <= LineInfo.xRight) && (CircleInfo.cartesianY -15) >= LineInfo.yValue) {
        pc.needsMovingUp = true;
        // console.log("doing it");
        // pc.y = pc.game.mapHeight - (LineInfo.yValue +68);
        
        // set the pc to the correct coords for a perfect collision 
        // let newY = CircleInfo.cartesianY - Math.sqrt( -(CircleInfo.cartesianX^2) + (CircleInfo.cartesianX ^2) + CircleInfo.radius^2);
        // let diff = (CircleInfo.cartesianY - newY);
        // console.log("diff:", diff - 100)
        // pc.y -= diff;
        // console.log('idea for new y', pc.game.mapHeight - newY);
        // console.log('current this.y', pc.y);



        return true;  // two roots / imperfect collision / needs handling
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