console.log(`.########.##.....##.########..........#######...........######...######..##.....##
....##.....##...##.....##............##.....##.........##....##.##....##.##.....##
....##......##.##......##...................##.........##.......##.......##.....##
....##.......###.......##.............#######..........##........######..##.....##
....##......##.##......##............##................##.............##..##...##.
....##.....##...##.....##............##................##....##.##....##...##.##..
....##....##.....##....##....#######.#########.#######..######...######.....###...`)


import LineByLineReader from 'line-by-line';
import { createWriteStream } from 'fs';


async function processLineByLine(file) {
    var lr = new LineByLineReader(file, {
        skipEmptyLines: true
    });
    var lineCount = 0;
    const writeStream = createWriteStream('output.csv')
    lr.on('error', function (err) {
        console.log(err)
        // 'err' contains error object
    });
    lr.on('line', function (line) {
        lineCount += 1
        var formattedLine = line.toString().replace(/\t/g, ",");
        console.log(formattedLine);
        if (lineCount < 2000) {
            writeStream.write(formattedLine + '\n');
        }
        // 'line' contains the current line without the trailing newline character.
    });

    lr.on('end', function () {
        console.log('end')
        // All lines are read, file is closed now.
    });
}
async function writeLines(){
    
}
processLineByLine('sample.txt');