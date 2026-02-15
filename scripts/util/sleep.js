// function sleep(ms){
//     lock = true
//     while(lock){
//     }
//     setTimeout((ms)=>{
//         lock = false
//     })
// }

function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}

module.exports = sleep