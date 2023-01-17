console.log(`.########.##.....##.########..........#######...........######...######..##.....##
....##.....##...##.....##............##.....##.........##....##.##....##.##.....##
....##......##.##......##...................##.........##.......##.......##.....##
....##.......###.......##.............#######..........##........######..##.....##
....##......##.##......##............##................##.............##..##...##.
....##.....##...##.....##............##................##....##.##....##...##.##..
....##....##.....##....##....#######.#########.#######..######...######.....###...`)

import { createReadStream, createWriteStream } from 'fs';
import { createInterface } from 'readline';

async function processLineByLine(file) {
    const readStream = createReadStream(file);
    const rl = createInterface({
        input: readStream,
        crlfDelay: Infinity
    });
    var lineCount = 0;
    var fileName = "chunk";
    var numberOfChunk = 1;
    // Note: we use the crlfDelay option to recognize all instances of CR LF
    // ('\r\n') in input.txt as a single line break.
    const writeStream = createWriteStream(`${fileName}.csv`)

    for await (const line of rl) {
        // Each line in input.txt will be successively available here as `line`.
        lineCount += 1
        console.log(lineCount);
        var formattedLine = line.toString().replace(/\t/g, ",");
        if (lineCount < 1000) {
            writeStream.write(formattedLine + '\n');
        }
    }
}

processLineByLine('sample.txt');