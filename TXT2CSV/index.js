console.log(`
.########.##.....##.########..........#######...........######...######..##.....##
....##.....##...##.....##............##.....##.........##....##.##....##.##.....##
....##......##.##......##...................##.........##.......##.......##.....##
....##.......###.......##.............#######..........##........######..##.....##
....##......##.##......##............##................##.............##..##...##.
....##.....##...##.....##............##................##....##.##....##...##.##..
....##....##.....##....##....#######.#########.#######..######...######.....###...`)


console.log(`\n------------------ Ishfaq Ahmed ------------------`)
console.log(`----------- Github: @IshfaqAhmedProg -------------\n\n\n`)
//imports
var fs = require('fs')
    , es = require('event-stream');
var cliProgress = require('cli-progress');
const { convertArrayToCSV } = require('convert-array-to-csv');
const prompt = require('prompt-sync')();
//runstream
function createChunks(totalLinesInChunk, totalLines, totalNumberOfChunks) {
    //initialise
    var progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    var lineNr = 0;
    var chunksCreated = 0;
    progressBar.start(totalLinesInChunk, 0);
    var lineHolder = [];
    var s = fs.createReadStream('sample.txt')
        .pipe(es.split())
        .pipe(es.mapSync(function (line) {
            var formattedLine = line.toString().split(/\t/g);
            if (formattedLine.length != 1)
                lineHolder.push(formattedLine)
            formattedLine = []
            lineNr += 1;
            lineHolder.length != 0 && progressBar.update(lineHolder.length)
            if (lineHolder.length == totalLinesInChunk) {
                s.pause();
                writeToFile(lineHolder, lineNr);
                chunksCreated += 1;
                console.log("\nChunks created: ", chunksCreated);
                lineHolder = [];
                console.log("Lines remaining: ", (totalLines - chunksCreated * totalLinesInChunk))
                s.resume();
            } else if (lineHolder.length == (totalLines - chunksCreated * totalLinesInChunk) && chunksCreated == totalNumberOfChunks - 1) {
                writeToFile(lineHolder, lineNr);
                chunksCreated += 1;
                console.log("\nChunks created: ", chunksCreated);
                lineHolder = [];
            }
        })
            .on('error', function (err) {
                console.log('\nError while reading file.', err);
            })
            .on('end', function () {
                console.log('\nRead entire file. Ctrl+C to exit')
            })
        );
}
function getTotalLines() {
    return new Promise((resolve, reject) => {
        var i;
        var count = 0;
        console.log("Counting total number of lines. Please wait...")
        fs.createReadStream('sample.txt')
            .on('data', function (chunk) {
                for (i = 0; i < chunk.length; ++i)
                    if (chunk[i] == 10) count++;
            })
            .on('error', function (err) {
                console.log('\nError while reading file.');
                resolve(err);
            })
            .on('end', function () {
                resolve(count);
            });
    })
}
function writeToFile(lineHolder, lineNr) {
    var dir = './output';
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    const csvData = convertArrayToCSV(lineHolder);
    fs.writeFile(`output/chunk${lineNr}.csv`, csvData, (err) => {
        if (err) throw err;
    });
}
async function main() {
    // get total line count
    const totalLines = await getTotalLines();
    console.log("Total number of lines found : ", totalLines);

    //get chunk size from user
    let chunkSize;
    let totalNumberOfChunks;
    let chunkSizeCorrect = false;
    var maxChunkSize = 325000;
    while (!chunkSizeCorrect) {
        console.log(`Please enter the number of lines each chunk should have (from 2 - ${maxChunkSize} lines)`)
        chunkSize = prompt('> ')
        chunkSize = Number(chunkSize);
        if (chunkSize >= 2 && chunkSize <= maxChunkSize) {
            chunkSizeCorrect = true;
            totalNumberOfChunks = Math.ceil(totalLines / chunkSize)
        }
        else {
            console.log(`The number you have input is out of the range (2 - ${maxChunkSize})`)
        }
    }
    console.log("Total number of chunks : ", totalNumberOfChunks);
    createChunks(chunkSize, totalLines, totalNumberOfChunks);

}
main();