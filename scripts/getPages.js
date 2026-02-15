const util = require("./util");

const url = (page) => {
    return `https://booth.pm/en/items?adult=include&in_stock=true&page=${page}&sort=new&tags%5B%5D=VRChat`
}

async function getPage(page){
    try {
        const response = await fetch(url(page), {
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Cookie": "adult=t"
            }
        });

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const result = await response.text();
        
        const htmlJSON = util.nodeDOM.praseHTML(result);
        const query = util.nodeDOM.querySelectorAll(htmlJSON,".item-card__wrap");
        
        const ids = []
        query.forEach(el => {
            ids.push(el["attributes"]["id"]);
        });

        return ids;

    } catch (error) {
        console.error(error.message);
        throw error;
    }
}

module.exports = getPage;
