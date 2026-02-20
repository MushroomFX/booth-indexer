const util = require("./util");
const fs = require("fs");
const path = require("path");

async function getItem(id,full = false){
    try {
        const response = await fetch(`https://booth.pm/en/items/${id}`, {
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Cookie": "adult=t"
            }
        });

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const result = await response.text();
        _writedata(id,result,full)

    } catch (error) {
        console.error(error.message);
        throw error;
    }
}

async function _writedata(id,result,full){
    const htmlJSON = util.nodeDOM.praseHTML(result);
    const itemDir = path.join(__dirname, `../data/items/${id}`);

    const item = `item_${id}`

    if (!fs.existsSync(itemDir)){
        fs.mkdirSync(itemDir, {recursive: true});
    }
    if(full == true){
        await Promise.all([
            _saveIamges(htmlJSON,itemDir),
            _saveDetails(htmlJSON,itemDir),
            _savePrice(htmlJSON,itemDir),
            _saveJSON(htmlJSON,itemDir),
            _saveHTML(result,itemDir)
        ]).then(()=>{
            util.db.update(item, { status: 'fetched' });
        });;
    } else {
        await Promise.all([
            _saveJSON(htmlJSON,itemDir),
            _saveHTML(result,itemDir)
        ]).then(()=>{
            util.db.update(item, { status: 'fetched' });
        });
    }
}

async function _saveIamges(htmlJSON,itemDir){
        const downloadFolder = path.join(itemDir, `./images`);
        const imageQuery = util.nodeDOM.querySelectorAll(htmlJSON,".market-item-detail-item-image");
        
        let i = 0;

        for (const el of imageQuery) {
            const url = el["attributes"]["data-origin"];
            util.downloadImage(url, downloadFolder, `${i}.png`);
            i++;
        }
}

function _saveDetails(htmlJSON,itemDir){}
function _savePrice(htmlJSON,itemDir){}

async function _saveJSON(htmlJSON,itemDir){
    const fileName = path.join(itemDir, 'index.json');
    fs.promises.writeFile(fileName,JSON.stringify(htmlJSON));
}
async function _saveHTML(html,itemDir){
    const fileName = path.join(itemDir, 'index.html');
    fs.promises.writeFile(fileName,html);
}

module.exports = getItem;