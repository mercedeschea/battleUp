


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
    let mapHeight = pc.game.mapHeight;
    // The player character cirlce now has its cartesian x and y locations stored in PlayerCircleInfo.

    // Determine if the player character is colliding!
    // for each placeform, call the method which handles that type of placeform

    for (const platform of pc.placeformManager.placeformsCurrent) {
        if (platform.type === 'center') {
            let equation = convertHorizontalPlatformToEquation(platform, mapHeight);
            if (isCircleCollidingWithHorizontalLine(PlayerCircleInfo, equation))
                pc.colliding = true;
        } else if (platform.type === 'left') {
            let equation = convertLeftSlopedPlatformToEquation(platform, mapHeight);
            if(isCircleCollidingWithSlopedLine(PlayerCircleInfo, equation)) 
                pc.colliding = true;
        } else {
            let equation = convertRightSlopedPlatformToEquation(platform, mapHeight);
            if(isCircleCollidingWithSlopedLine(PlayerCircleInfo, equation))
                pc.colliding = true;
        }
    }

    for (const gen of genForms) {
        let equation = convertHorizontalPlatformToEquation(gen, mapHeight);
        if (isCircleCollidingWithHorizontalLine(gen, equation))
            pc.colliding = true;
    }

    // let collidePlaceform = pc.placeformManager.placeformsCurrent[0];
    // // Convert the horizontal platform
    // let PlatformCartCords = convertHorizontalPlatformToEquation(collidePlaceform.x, collidePlaceform.y, pc.game.mapHeight);

    // pc.colliding = isCircleCollidingWithHorizontalLine(PlayerCircleInfo, PlatformCartCords);
}




function convertRightSlopedPlatformToEquation(platform, gameWorldHeight) {
    let slope = 1;
    // y = mx + b
    // top right point of this platform is (this.x + 80, this.y) 
    // gameHeight - this.y = (1) * (this.x + 80) + b 
    return {
        mSlope: slope,
        bOffset: (gameWorldHeight - platform.y) - (platform.x + 80),
        xLeft: platform.x,
        xRight: platform.x + 83
    }
}

function convertLeftSlopedPlatformToEquation(platform, gameWorldHeight) {
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
    const b = -2 * CircleInfo.cartesianX + LineInfo.mSlope * (LineInfo.bOffset - CircleInfo.cartesianY);
    const c = CircleInfo.cartesianX * CircleInfo.cartesianX + (LineInfo.bOffset - CircleInfo.cartesianY) * (LineInfo.bOffset - CircleInfo.cartesianY) 
        - CircleInfo.radius * CircleInfo.radius;
        
    console.log('a', a);
    console.log('b', b);
    console.log('c', c);

    let answer = quadraticFormula(a, b, c);
    if (isNaN(answer.result1) && isNaN(answer.result2)) {
        console.log(answer.result1, answer.result2);
        console.log("no");
        return false;
    } else if ((CircleInfo.cartesianX >= LineInfo.xLeft) && (CircleInfo.cartesianX <= LineInfo.xRight)) {// && (CircleInfo.cartesianY -25) >= LineInfo.yValue - 100) {
        console.log("12f3YESYEYESYESYESYESYSEYSEYSS");
        console.log("12f3", CircleInfo.cartesianX >= LineInfo.xLeft);
        console.log("12f3", CircleInfo.cartesianX <= LineInfo.xRight);
        console.log("12f3", (CircleInfo.cartesianY - 100) > LineInfo.yValue);
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
    } else if ((CircleInfo.cartesianX >= LineInfo.xLeft) && (CircleInfo.cartesianX <= LineInfo.xRight) && (CircleInfo.cartesianY -25) >= LineInfo.yValue) {
        // console.log("YESYEYESYESYESYESYSEYSEYSS");
        // console.log("1", CircleInfo.cartesianX >= LineInfo.xLeft);
        // console.log("2", CircleInfo.cartesianX <= LineInfo.xRight);
        // console.log("3", (CircleInfo.cartesianY - 100) > LineInfo.yValue);
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