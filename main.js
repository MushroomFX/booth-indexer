const util = require("./scripts/util");
const getPage = require("./scripts/getPages");
const getItem = require("./scripts/getItem");
const fs = require('fs');

const config = {
    pageSLeepFull: 15_000,
    pageSLeepNew: 5_000
}

const firstItemEver = "item_213104";

// load db
;(async () => {
    util.db.backup();
    await util.db.load();

    // some pages are still pending
    if(util.db.get(firstItemEver) == undefined){
        let newItems = true
        let pageIndex = 1
        while(newItems){
            const items = await getPage(pageIndex)
            console.log(items,pageIndex)
            pageIndex++
            items.forEach((item)=>{
                if(item == firstItemEver){
                    newItems = false
                }
                util.db.update(item, { status: ['pending'] });
            })
            if(pageIndex % 10 == 0){
                await util.db.write();
            }
            await util.sleep(config.pageSLeepFull)
        }
    } else {
        let newItems = true
        let pageIndex = 1
        while(newItems){
            const items = await getPage(pageIndex)
            newItems = false
            pageIndex++
            items.forEach((item)=>{
                if(util.db.get(item) == undefined){
                    util.db.update(item, { status: ['pending'] });
                    newItems = true
                }
                if(item == firstItemEver){
                    newItems = false
                }
            })
            await util.sleep(config.pageSLeepNew)
        }
        
    }
    //update db
    await util.db.write();
})();