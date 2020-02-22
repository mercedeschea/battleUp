

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
    for (const platform of pc.game.entities.placeforms) {
        let result = checkPCPlatformCollision(PlayerCircleInfo, platform);
        if (result) {
            pc[result] = true;
            if (pc.superAttacking > 0)
                platform.removeFromWorld = true;
            // console.log(result);
        }
        // if (result === 'fromBelow') {
        //     if (platform.type === 'left' || platform.type === 'right') 
        //         pc.currentPlatform = platform;
        // } else if (result === 'fromBelow') {
        //     pc.collidingAbove = true;
        // }
        if (attackEquation) {
            // console.log("attack: ", attackEquation, "platform: ",
            // platformEquation, "player:", PlayerCartCords.cartesianY);
            if(isLineIntersectingWithLine(attackEquation, platform.equation))
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
        // let result = checkPCPlatformCollision(PlayerCircleInfo, platform);
        // if (result === 'fromAbove') {
        //     pc.colliding = true;
        //     if (platform.type === 'left' || platform.type === 'right') 
        //         pc.currentPlatform = platform;
        // } else if (result === 'fromBelow') {
        //     pc.collidingAbove = true;
        // }
           
    }

    for (const cookie of pc.game.entities.cookies) {
        let result = isCircleCollidingWithCircle(PlayerCircleInfo, cookie.equation);
        // console.log(cookie, result);
        if (result) {
            pc.collectCookie();
            cookie.removeFromWorld = true;
        }
    }
    const pcDistanceFromFloor =  pc.game.surfaceHeight - FLOOR_HEIGHT - (pc.cameraTransform(0) + pc.radius * 2 + 4);
    // console.log(pcDistanceFromFloor);
    console.log(pc.game.sceneObj.background.name);
    if (pc.game.floor && pcDistanceFromFloor <= 0 && pc.game.sceneObj.background.name !== 'level1') {
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

    } else {
        pc.floorTimer = 0;
    }



    // let collidePlaceform = pc.placeformManager.placeformsCurrent[0];
    // // Convert the horizontal platform
    // let PlatformCartCords = convertHorizontalPlatformToEquation(collidePlaceform.x, collidePlaceform.y, pc.game.mapHeight);

    // pc.colliding = isCircleCollidingWithHorizontalLine(PlayerCircleInfo, PlatformCartCords);
}

function checkPCPlatformCollision(PlayerCircleInfo, platform) {
    let result;
    if (platform.type === 'center') {
        result = isCircleCollidingWithHorizontalLine(PlayerCircleInfo, platform.equation);

    } else if (platform.type === 'left') {
        result  = isCircleCollidingWithSlopedLine(PlayerCircleInfo, platform.equation);
    } else {
        // console.log("right equation", equation);
        // console.log("pc coords", PlayerCircleInfo);
        result = isCircleCollidingWithSlopedLine(PlayerCircleInfo, platform.equation);
        
    }
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
    /*
    Bottom Left : (this.x, Max - (this.y + 80))
    Top Right : (this.x + 80, Max - this.y)
    Slope : 1
    */
    /*key mapped arrays javascriptkey mapped arrays javascrikey mapped arrays javascriptpt
    Line equation using bottom left point: 
    y = m x + b
    max - (this.y + 80) = (slope)(this.x) + b
    b = max - (this.y + 80) - (slope)(this.x)
    */
    /* 
    Line equation using top right:
    y = mx + b 
    max - this.y = (slope)(this.x + 80) + b
    b = max - this.y - (slope)(this.x + 80)
    SAME LINE
    */
    // console.log("platform.y", platform.y);
    // console.log("platform.x", platform.x);
    // console.log("gameWorldHeight", gameWorldHeight);
    // console.log("platform real y", gameWorldHeight - (platform.y + 80));
    return {
        mSlope: slope,
        gameB: platform.y + 80 - (slope * platform.x),
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
        gameB: platform.y + (platform.x + 7),
        bOffset: (gameWorldHeight - platform.y) + (platform.x + 7),
        xLeft: platform.x,
        xRight: platform.x + 83,
        yValue: gameWorldHeight - platform.y - 30
    }
}

function isCircleCollidingWithSlopedLine(CircleInfo, LineInfo) {
    // CircleInfo gives me the x0, y0, r
    // LineInfo gives me the slope, bOffset
    // a = 2
    // b = 2 (bOffset) (slope) - 2 (slope) (y0)
    // c = bOffset^2 + x0^2 + y0^2 - r^2 - 2*x0 - 2*bOffset*x0
    // https://www.wolframalpha.com/input/?i=%28%28s+*+x+%2B+b%29+-+y%29+%5E+2 lol
    // console.log('li', LineInfo);
    // console.log('ci', CircleInfo);
/*
    const a = 2;
    const b = 2 * LineInfo.bOffset * LineInfo.mSlope - 2 * LineInfo.mSlope * CircleInfo.cartesianY;
    const c = LineInfo.bOffset * LineInfo.bOffset + CircleInfo.cartesianX * CircleInfo.cartesianX 
        - CircleInfo.radius * CircleInfo.radius + CircleInfo.cartesianY * CircleInfo.cartesianY
        - 2 * CircleInfo.cartesianX - 2 * LineInfo.bOffset * CircleInfo.cartesianY;

        console.log('a', a);
        console.log('b', b);
        console.log('c', c);*/

    const a = 2;
    const b = 2 * LineInfo.mSlope * (LineInfo.bOffset - CircleInfo.cartesianY) - 2 * CircleInfo.cartesianX;
    const c = CircleInfo.cartesianX * CircleInfo.cartesianX + (LineInfo.bOffset - CircleInfo.cartesianY) * (LineInfo.bOffset - CircleInfo.cartesianY) 
        - CircleInfo.radius * CircleInfo.radius;
        
    // console.log('a', a);
    // console.log('b', b);
    // console.log('c', c);
    // let lineYLeft = calcYFromX(LineInfo, LineInfo.xLeft);
    // let lineYRight = calcYFromX(LineInfo, LineInfo.xRight);

    // console.log(lineYLeft, lineYRight);
    // lineYMin = Math.min(lineYLeft, lineYRight);
    // lineYMax = Math.max(lineYLeft, lineYRight);
    let centerOffset = Math.sqrt(2)/2 * CircleInfo.radius * LineInfo.mSlope;
    let contactY = calcYFromX(LineInfo, CircleInfo.cartesianX + centerOffset);
    let contactYTopEdge = calcYFromX(LineInfo, CircleInfo.cartesianX - centerOffset);

    // let platformThicknessCorrect = LineInfo.mSlope < 0 ? PLATFORM_HEIGHT : PLATFORM_HEIGHT * -1;
    let platformThicknessCorrect = PLATFORM_HEIGHT * LineInfo.mSlope;
    let answer = quadraticFormula(a, b, c);
    if (isNaN(answer.result1) && isNaN(answer.result2)) {
        // console.log(answer.result1, answer.result2);
        // console.log("no");
        return false;
    }
    //check if player is entirely within the boundaries of the platform
    let centerCollide = CircleInfo.cartesianX >= LineInfo.xLeft 
    && CircleInfo.cartesianX <= LineInfo.xRight;
    let clippingLeft = LineInfo.xLeft - CircleInfo.cartesianX <  CircleInfo.radius
    && LineInfo.xLeft - CircleInfo.cartesianX > 0;
    let clippingRight = CircleInfo.cartesianX - LineInfo.xRight + platformThicknessCorrect < CircleInfo.radius
    && CircleInfo.cartesianX  - LineInfo.xRight > 0;
    // let clippingLeftTop = LineInfo.xLeft - CircleInfo.cartesianX + PLATFORM_HEIGHT <  CircleInfo.radius
    // && LineInfo.xLeft - CircleInfo.cartesianX > 0;
    // let clippingRightTop = CircleInfo.cartesianX - LineInfo.xRight + PLATFORM_HEIGHT < CircleInfo.radius
    // && CircleInfo.cartesianX  - LineInfo.xRight > 0;
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
        else if ((centerCollide && belowMiddle) || ((clippingRight) && belowEdge))
            return 'collidingTopLeft';
    } else {
        if((centerCollide && aboveMiddle) || (clippingRight && aboveEdge))
            return 'collidingBotLeft';
        else if ((centerCollide && belowMiddle) || (clippingLeft && belowEdge))
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
        xRight: platform.x + 119
    };
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
        // console.log("no");
        return false;
    } else if ((CircleInfo.cartesianX + CircleInfo.radius >= LineInfo.xLeft) && (CircleInfo.cartesianX - CircleInfo.radius <= LineInfo.xRight) && (CircleInfo.cartesianY - CircleInfo.radius + PLATFORM_HEIGHT) >= LineInfo.yValue) {
        // console.log("YESYEYESYESYESYESYSEYSEYSS");
        // console.log("1", CircleInfo.cartesianX >= LineInfo.xLeft);
        // console.log("2", CircleInfo.cartesianX <= LineInfo.xRight);
        // console.log("3", (CircleInfo.cartesianY - 100) > LineInfo.yValue);
        return 'colliding';
    } else if ((CircleInfo.cartesianX + CircleInfo.radius/2 >= LineInfo.xLeft) && (CircleInfo.cartesianX - CircleInfo.radius/2 <= LineInfo.xRight) && (CircleInfo.cartesianY + CircleInfo.radius + PLATFORM_HEIGHT) >= LineInfo.yValue) {
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
    return { gameWorldX: thisX + 32.5, gameWorldY: thisY + 36.5 };
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