const FONT_URL = "url(./Sprites/PressStart2P-Regular.ttf)";
const LEVEL_EP = "static/"
class AssetManager {
    constructor() {
        this.successCount = 0;
        this.errorCount = 0;
        this.cache = [];
        this.downloadQueue = [];
        this.serverDownloadQueue = [];
        this.serverCache = [];
        this.font = null;
    }

    queueServerDownload(fileName) {
        console.log("Queueing " + fileName);
        this.serverDownloadQueue.push(fileName);
    }

    queueDownload(path) {
        console.log("Queueing " + path);
        this.downloadQueue.push(path);
    }
    isDone() {
        return this.downloadQueue.length + this.serverDownloadQueue.length + 1 === this.successCount + this.errorCount;
    }
    downloadAll(callback) {
        for (var i = 0; i < this.downloadQueue.length; i++) {
            var img = new Image();
            var that = this;
            var path = this.downloadQueue[i];
            console.log(path);
            img.addEventListener("load", function () {
                console.log("Loaded " + this.src);
                that.successCount++;
                if (that.isDone())
                    callback();
            });
            img.addEventListener("error", function () {
                console.log("Error loading " + this.src);
                that.errorCount++;
                if (that.isDone())
                    callback();
            });
            img.src = path;
            this.cache[path] = img;
        }
        for (const fileName of this.serverDownloadQueue) {
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.addEventListener('load', function () {
                console.log("Loaded " + fileName);
                that.successCount++;
                that.interpretFile(fileName, this);
                if (that.isDone())
                    callback();
            });
            xmlhttp.addEventListener('error', function () {
                console.log("Error loading " + fileName);
                that.errorCount++;
                if (that.isDone())
                    callback();
            });
            xmlhttp.open("GET", BACKEND_URL + LEVEL_EP + fileName, false);
            xmlhttp.send();
        }
        this.font = new FontFace('mainFont', FONT_URL, {});
        this.font.load().then(function(loadedFont){
            console.log('font loaded');
            that.successCount++;
            document.fonts.add(loadedFont);
            if(that.isDone())
                callback();
        });
        
    }
    getAsset(path) {
        return this.cache[path];
    }
    getServerAsset(fileName) {
        return this.serverCache[fileName];
    }

    interpretFile(fileName, xmlHttpObj) {
        let result = xmlHttpObj.responseText;
        result = result.split('\n');
        // console.log(result);
        let mapInfo = [];
        let yIndex = 0;
        for (const line of result) {
          if(line[0] === '!' || line.length === 0) {
            continue;
          }
          mapInfo[yIndex] = [];
          let curLine = line.split("  ");
          curLine.shift();
          // console.log(curLine);
          for (const cell of curLine) {
            mapInfo[yIndex].push(cell);
          }  
          yIndex++;
        }
        // console.log(mapInfo);
        this.serverCache[fileName] = mapInfo;
    }
}



