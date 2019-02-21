const fs = require("fs");
const dir = "./emo_mod/";
let code = (dir, fileNameIn) => {
    const fileNameOut = "_" + fileNameIn;
    const iBuffer = fs.readFileSync(dir + fileNameIn);
    const oBuffer = new Buffer(iBuffer.length);
    for (let i = 0; i < iBuffer.length; i++) {
        oBuffer.writeInt8(73 ^ iBuffer.readInt8(i), i);
    }
    return "data:image/png;base64," + oBuffer.toString("base64");
}
const base64Array = []
fs.readdirSync(dir).forEach(el => {
    if (el.substr(-3) == "png") base64Array.push(code(dir, el));
});
fs.writeFileSync(dir + "out.json", JSON.stringify(base64Array));