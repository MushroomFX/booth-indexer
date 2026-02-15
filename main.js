const util = require("./scripts/util");
const getPage = require("./scripts/getPages");
const getItem = require("./scripts/getItem");
const fs = require('fs');

const firstItemEver = "item_213104";

// load db
;(async () => {
    await util.db.load();
    
    // some pages are still pending
    if(util.db.get(firstItemEver) == undefined){
        let newItems = true
        let pageIndex = 1
        while(newItems){
            const items = await getPage(1)
            console.log(items,pageIndex)
            pageIndex++
            items.forEach((item)=>{
                if(item == firstItemEver){
                    newItems = false
                } else {
                    util.db.update(item, { status: ['pending'] });
                }
            })
            await util.sleep(5000)
        }
    } else {
        let newItems = true
        let pageIndex = 1
        while(newItems){
            const items = await getPage(1)
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
            await util.sleep(5000)
        }
        
    }
    //update db
    await util.db.write();
})();