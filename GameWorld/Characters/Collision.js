

function isCharacterColliding(PlayerCharacter) {
    // Convert the player character to useful coordinates
    let pc = PlayerCharacter;
    let PlayerGWCords = convertCharacterToGameWorldCoords(pc.x, pc.y);
    let PlayerCartCords = convertToCartesianCoords(PlayerGWCords.gameWorldX, PlayerGWCords.gameWorldY, pc.game.mapHeight);
    let PlayerCircleInfo = {
        radius: pc.radius,
        cartesianX: PlayerCartCords.cartesianX,
        cartesianY: PlayerCartCords.cartesianY
    }
    // console.log(PlayerCircleInfo);
    pc.currentCircle = PlayerCircleInfo;
    if(pc.superAttacking > 0) {
        PlayerCircleInfo.radius += DRILL_LENGTH;
    }
    let mapHeight = pc.game.mapHeight;
    // The player character cirlce now has its cartesian x and y locations stored in PlayerCircleInfo.

    // Determine if the player character is colliding!
    // for each placeform, call the method which handles that type of placeform
    let attackEquation;
    if(pc.attacking)
        attackEquation = calculateAttackLine(pc, PlayerCircleInfo, mapHeight);

    let placeformsCurrent = [];
    let gloopKeys = Object.keys(pc.game.gloops);
    for (const key of gloopKeys){
        placeformsCurrent = placeformsCurrent.concat(pc.game.gloops[key].placeformManager.placeformsCurrent);
    }
    for (const platform of placeformsCurrent) {
        let result = checkPCPlatformCollision(PlayerCircleInfo, platform);
        // console.log(result);
        if (result) {
            pc[result] = true;
            // if (result === 'colliding')
            //     pc.y = whereShouldMyCharacterBeHoriz(platform.aboveEquation, pc);
            // else if ((result === 'collidingBotRight' || result === 'collidingBotLeft') && !pc['colliding'])
            //     pc.y = whereShouldMyCharacterBeSloped(platform.aboveEquation, pc);
            if (pc.superAttacking > 0)
                platform.removeFromWorld = true;
        }
        if (attackEquation && isLineIntersectingWithLine(attackEquation, platform.equation)) {
            platform.removeFromWorld = true;
        }
    }
    for (const platform of pc.game.entities.genforms) {
        let result = checkPCPlatformCollision(PlayerCircleInfo, platform);
        if (result){
            pc[result] = true;
            if (pc.superAttacking > 0)
                platform.removeFromWorld = true;
        }    
    }

    for (const cookie of pc.game.entities.cookies) {
        let result = isCircleCollidingWithCircle(PlayerCircleInfo, cookie.equation);
        if (result) {
            pc.collectCookie();
            new Audio("./Music/cookie2.wav").play();
            cookie.removeFromWorld = true;
        }
    }
    const pcDistanceFromFloor =  pc.game.surfaceHeight - FLOOR_HEIGHT - (pc.cameraTransform(0) + pc.radius * 2 + 4);
    // console.log(pcDistanceFromFloor);
    // console.log(pc.game.sceneObj.background.name);
    if (pc.game.floor && pcDistanceFromFloor <= 0 && ! pc.external) { // && pc.game.sceneObj.background.name !== 'level1' used for level specific floor behaviour
        pc.y += pcDistanceFromFloor;
        pc.colliding = true;
        // console.log(pc.floorTimer, "a floor timer");
        if (!pc.game.floor.flashing) {
            pc.game.floor.flashing = true;
            pc.floorTimer = 2;
            // console.log(pc.floorTimer);
        } else if (pc.floorTimer <= 0) {
            pc.dead = true;
        } else {
            pc.floorTimer -= pc.game.clockTick;
        }

    } else if (pc.cameraTransform() > pc.game.surfaceHeight && !pc.external) {
        pc.dead = true;
    } else {
        pc.floorTimer = 0;
    }
}

function whereShouldMyCharacterBeHoriz(aboveLine, pc) {
    // we just want to say put the y at the above line y
    return pc.game.mapHeight - aboveLine.yValue;
}
function whereShouldMyCharacterBeSloped(aboveLine, pc) {
    // y = mx + b
    // use x to find y
    // wow it's the 5th grade!
    // console.log('this', pc.currentCircle.cartesianX)
    return pc.game.mapHeight - (aboveLine.mSlope * pc.currentCircle.cartesianX + aboveLine.bOffset) +21;
}

function checkPCPlatformCollision(PlayerCircleInfo, platform) {
    let result;
    if (platform.type === 'center') {
        result = isCircleCollidingWithHorizontalLine(PlayerCircleInfo, platform.equation);
    } else if (platform.type === 'left') {
        result  = isCircleCollidingWithSlopedLine(PlayerCircleInfo, platform.equation);
    } else if (platform.type === 'right') {
        result = isCircleCollidingWithSlopedLine(PlayerCircleInfo, platform.equation);
    } else if (platform.type === 'vert') {
        result = isCircleCollidingWithVert(PlayerCircleInfo, platform.equation);
    }
    // console.log(result);
    return result;
}

//Calculates the coordinates of the line segment coming from the edge of the player at the angle of the attack.
function calculateAttackLine(pc, PlayerCircleInfo, gameWorldHeight) {
    //Calculates how many frames from the end of the animation. This is used to determine the length of the attack line segment.
    let framesUntilDone = pc.currentAttackAnimation.animation.frames - pc.currentAttackAnimation.animation.currentFrame();
    //Calculates the coordinates of edge of player at the angle of attack.
    let playerEdgeX = PlayerCircleInfo.cartesianX + 32 * Math.cos(pc.currentAttackAnimation.angle);
    let playerEdgeY = PlayerCircleInfo.cartesianY - 32 * Math.sin(pc.currentAttackAnimation.angle);
    //These are the cartesian coordinates of the end point of the current attack frame
    let attackPointX = pc.x + pc.currentAttackAnimation.xCalcAttack(framesUntilDone);
    let attackPointY = gameWorldHeight - (pc.y + pc.currentAttackAnimation.yCalcAttack(framesUntilDone));
    //slope and y intercept of the attack line
    let m = (playerEdgeY - attackPointY)/(playerEdgeX - attackPointX);
    let b = playerEdgeY - m * (playerEdgeX);
    let xR = Math.max(playerEdgeX, attackPointX);
    let xL = Math.min(playerEdgeX, attackPointX);
    return {
        mSlope:m,
        bOffset:b,
        xLeft:xL,
        xRight:xR
    }
}


function convertRightSlopedPlatformToEquation(platform, gameWorldHeight) { /* " / " */
    let slope = 1;
    let platformLength = HOR_BLOCK_SIZE;
    let lineOffset = Math.sqrt(2)/2 * PLATFORM_HEIGHT;
    return {
        mSlope: slope,
        // gameB: platform.y + platformLength - (slope * platform.x),
        bOffset: (gameWorldHeight - (platform.y + platformLength) - (slope * platform.x - lineOffset - 2)),
        xLeft: platform.x,
        xRight: (platform.x + platformLength)
    }
}

function convertLeftSlopedPlatformToEquation(platform, gameWorldHeight) { /* " \ " */
    let slope = -1;
    // y = mx + b
    // top left point of this platform is (this.x + 7, this.y) 
    // gameHeight - this.y = (-1) * (this.x + 7) + b 
    let platformLength = HOR_BLOCK_SIZE;
    let lineOffset = Math.sqrt(2)/2 * PLATFORM_HEIGHT;
    return {
        mSlope: slope,
        // gameB: platform.y + (platform.x + Math.sqrt(2) * PLATFORM_HEIGHT),
        bOffset: (gameWorldHeight - platform.y) + (platform.x + lineOffset + 2),
        xLeft: platform.x,
        xRight: platform.x + platformLength,
        // yValue: gameWorldHeight - platform.y - 30
    }
}
function isCircleCollidingWithVert(CircleInfo, LineInfo) {
    // radius and carteisanX and cartesianY in circle
    // lineinfo will have xLeft and xRight, yTop yBottom?
    if (CircleInfo.cartesianX - CircleInfo.radius < LineInfo.xRight // My left is left of the right side of the vert
        && CircleInfo.cartesianX > LineInfo.xRight // My center is right of the right side of the vert
        && isCircleWithinVertLineYAxis(CircleInfo, LineInfo))
        return "collidingLeft"
    if (CircleInfo.cartesianX + CircleInfo.radius > LineInfo.xLeft // My right is right of the left side of the vert
        && CircleInfo.cartesianX < LineInfo.xLeft // My center is left of the left side of the vert
        && isCircleWithinVertLineYAxis(CircleInfo, LineInfo))
        return "collidingRight" 
    return false;
}
function isCircleWithinVertLineYAxis(CircleInfo, LineInfo) {
    return CircleInfo.cartesianY + CircleInfo.radius > LineInfo.yBottom // my top is above their bottom
        && CircleInfo.cartesianY - CircleInfo.radius < LineInfo.yTop     // my bottom is below their top
}

function convertVertPlatformToEquation(platform, gameWorldHeight) {
    return {
        xLeft: platform.x,
        xRight: platform.x + (22 * PLATFORM_SCALE),
        yTop: gameWorldHeight - platform.y,// carteisan
        yBottom: gameWorldHeight - (platform.y + HOR_BLOCK_SIZE),// carteisan

    }
}
function isCircleCollidingWithSlopedLine(CircleInfo, LineInfo) {

    const a = 2;
    const b = 2 * LineInfo.mSlope * (LineInfo.bOffset - CircleInfo.cartesianY) - 2 * CircleInfo.cartesianX;
    const c = CircleInfo.cartesianX * CircleInfo.cartesianX + (LineInfo.bOffset - CircleInfo.cartesianY) * (LineInfo.bOffset - CircleInfo.cartesianY) 
        - CircleInfo.radius * CircleInfo.radius;

    let centerOffset = Math.sqrt(2)/2 * CircleInfo.radius * LineInfo.mSlope;
    let contactY = calcYFromX(LineInfo, CircleInfo.cartesianX + centerOffset);
    let contactYTopEdge = calcYFromX(LineInfo, CircleInfo.cartesianX - centerOffset);

    // let platformThicknessCorrect = LineInfo.mSlope < 0 ? PLATFORM_HEIGHT : PLATFORM_HEIGHT * -1;
    let platformThicknessCorrect = PLATFORM_HEIGHT * LineInfo.mSlope;
    let answer = quadraticFormula(a, b, c);

    /////////////////////////////////////////////////////////////////////////////////////
    // console.log(answer.result1);
    // console.log(answer.result2);

    if (isNaN(answer.result1) && isNaN(answer.result2)) {
        return false;
    }
    //check if player is entirely within the boundaries of the platform
    let centerCollide = CircleInfo.cartesianX >= LineInfo.xLeft 
    && CircleInfo.cartesianX <= LineInfo.xRight;
    let clippingLeft = LineInfo.xLeft - CircleInfo.cartesianX <  CircleInfo.radius * 1.5
    && LineInfo.xLeft - CircleInfo.cartesianX > -CircleInfo.radius;
    let clippingRight = CircleInfo.cartesianX - LineInfo.xRight < CircleInfo.radius * 1.5
    && CircleInfo.cartesianX  - LineInfo.xRight > -CircleInfo.radius;
    let clippingLeftTop = LineInfo.xLeft - CircleInfo.cartesianX <  CircleInfo.radius
    && LineInfo.xLeft - CircleInfo.cartesianX > 0;
    let clippingRightTop = CircleInfo.cartesianX - LineInfo.xRight + platformThicknessCorrect < CircleInfo.radius
    && CircleInfo.cartesianX  - LineInfo.xRight > 0;
    //handle cases where player is at the top or bottom of a platform
    let rightAngled = LineInfo.mSlope === 1 ? true : false;
    let aboveEdge = CircleInfo.cartesianY >= contactY - platformThicknessCorrect;
    let aboveMiddle = CircleInfo.cartesianY >= contactY - platformThicknessCorrect;
    let belowEdge = CircleInfo.cartesianY < contactYTopEdge;
    let belowMiddle = CircleInfo.cartesianY + Math.abs(centerOffset) < contactY;//I think this should be contactYTopEdge but I'll try it later.
        // console.log("12f3YESYEYESYESYESYESYSEYSEYSS")git ;
        // console.log("12f3", CircleInfo.cartesianX >= LineInfo.xLeft);
        // console.log("12f3", CircleInfo.cartesianX <= LineInfo.xRight);
        // console.log("12f3", (CircleInfo.cartesianY - 100) > LineInfo.yValue);
    if (rightAngled) {
        if((centerCollide && aboveMiddle) || (clippingLeft && aboveEdge))
            return 'collidingBotRight';
        else if ((centerCollide && belowMiddle) || ((clippingRightTop) && belowEdge))
            return 'collidingTopLeft';
    } else {
        if((centerCollide && aboveMiddle) || (clippingRight && aboveEdge))
            return 'collidingBotLeft';
        else if ((centerCollide && belowMiddle) || (clippingLeftTop && belowEdge))
            return 'collidingTopRight';
    }
    return false;
}



function convertHorizontalPlatformToEquation(platform, gameWorldHeight) {
    return {
        bOffset: gameWorldHeight - platform.y,
        mSlope: 0,
        yValue: gameWorldHeight - platform.y, 
        xLeft: platform.x, 
        xRight: platform.x + HOR_BLOCK_SIZE
    };
}

function convertHorizontalEquationToAboveEquation(equation) {
    return {
        yValue: equation.yValue + 68 * PLAYER_SCALE, // height of gloop sprite
        xLeft: equation.xLeft, 
        xRight: equation.xRight
    };
}
function convertSlopedEquationToAboveEquation(equation) {
    return {
        mSlope: equation.mSlope,
        bOffset: equation.bOffset + 80,//68,////////
        xLeft: equation.xLeft,
        xRight: equation.xRight,
        yValue: equation.yValue
    }
}

function isCircleCollidingWithHorizontalLine(CircleInfo, LineInfo) { // Char is circle, Platform is a line
    // ax^2 + bx + c = 0
    const a = 1;
    const b = -2 * CircleInfo.cartesianX;
    const c = CircleInfo.cartesianX * CircleInfo.cartesianX + LineInfo.yValue * LineInfo.yValue 
        - 2 * CircleInfo.cartesianY * LineInfo.yValue + CircleInfo.cartesianY * CircleInfo.cartesianY 
        - CircleInfo.radius * CircleInfo.radius;
    let answer = quadraticFormula(a,b,c);

    if (isNaN(answer.result1) && isNaN(answer.result2)) {
        return false;
    } else if ((CircleInfo.cartesianX + CircleInfo.radius >= LineInfo.xLeft) && 
                (CircleInfo.cartesianX - CircleInfo.radius <= LineInfo.xRight) && 
                (CircleInfo.cartesianY - CircleInfo.radius + PLATFORM_HEIGHT) >= LineInfo.yValue - 2) {
        return 'colliding';
    } else if ((CircleInfo.cartesianX + CircleInfo.radius/2 >= LineInfo.xLeft) && 
                (CircleInfo.cartesianX - CircleInfo.radius/2 <= LineInfo.xRight) && 
                (CircleInfo.cartesianY + CircleInfo.radius + PLATFORM_HEIGHT) >= LineInfo.yValue) {
        return 'collidingTop';
    }
}


function isLineIntersectingWithLine(LineInfo1 , LineInfo2) {
    const xIntersect = (LineInfo2.bOffset - LineInfo1.bOffset)/(LineInfo1.mSlope - LineInfo2.mSlope);
    const yIntersect = LineInfo2.mSlope * xIntersect + LineInfo2.bOffset;
    const pointOnL1 = isPointOnLine(LineInfo1, xIntersect, yIntersect);
    const pointOnL2 = isPointOnLine(LineInfo2, xIntersect, yIntersect);
    return pointOnL1 && pointOnL2;
}

//Finds the y corresponding to x on the line with the slope and y intercept of LineInfo. 
//May or may not be on the actual line segment LineInfo.
function calcYFromX(LineInfo, x) {
    return LineInfo.mSlope * x + LineInfo.bOffset;
}

//Determines if the point at (x, y) is on the LineSegment LineInfo
function isPointOnLine(LineInfo, x, y) {
    let y1 = calcYFromX(LineInfo, LineInfo.xLeft);
    let y2 = calcYFromX(LineInfo, LineInfo.xRight);
    // console.log(y1, y2);
    let yMin = Math.min(y1, y2);
    let yMax = Math.max(y1, y2);
    return LineInfo.xLeft <= x && LineInfo.xRight >= x &&
        yMin <= y && yMax >= y;
}

function isCircleCollidingWithCircle(PlayerCircleInfo, OtherCircleInfo) {
    // console.log(PlayerCircleInfo, OtherCircleInfo);
    let dx = PlayerCircleInfo.cartesianX - OtherCircleInfo.cartesianX;
    let dy = PlayerCircleInfo.cartesianY - OtherCircleInfo.cartesianY;
    let distance = Math.sqrt(dx * dx + dy * dy);
    if(distance < PlayerCircleInfo.radius + OtherCircleInfo.radius){
           return true;
    }
    return false;
}


function convertCharacterToGameWorldCoords(thisX, thisY) {
    // Assumes the circle character is a 64x68 sprite with 4 dead pixels on top
    return { gameWorldX: thisX + /*32.5*/PLAYER_RADIUS, gameWorldY: thisY + /*36.5*/ PLAYER_RADIUS + PLAYER_SCALE * 4 };
}

function convertToCartesianCoords(gameWorldX, gameWorldY, gameHeight) {
    return { cartesianX: gameWorldX, cartesianY: gameHeight - gameWorldY };
}

function quadraticFormula(a, b, c) {
    var result1 = (-1 * b + Math.sqrt(Math.pow(b, 2) - (4 * a * c))) / (2 * a);
    var result2 = (-1 * b - Math.sqrt(Math.pow(b, 2) - (4 * a * c))) / (2 * a);
    // console.log(result1);
    return {result1: result1, result2: result2};
}