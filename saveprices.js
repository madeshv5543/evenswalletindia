const Price = require('./models/price');
const request = require('request');
const moment =require('moment-timezone');
function savePrice(){

    request.get('https://min-api.cryptocompare.com/data/histoday?fsym=ETH&tsym=USD&limit=30&aggregate=1&e=CCCAGG',(err, res, body)=>{
        if(err ){
            console.log("cryptocompare err", err);
            return;
        }
        let resdata = JSON.parse(body);
        let data = resdata.Data;
        let newArray = data.map( n=> {
            let date = moment.tz(parseInt(n.time)*1000,'Asia/Kolkata').format('DD-MMM-YYYY');
           return obj =  {
               date:  date,
               value: n.close,
               timestamp: new Date(date).getTime()
           }
        })
        if(newArray.length) {
            Price.deleteMany({},(err)=>{
                if(err) {
                    return
                }else{
                    Price.insertMany(newArray, (err,res)=>{
                        console.log("err in insert",err);
                        return;
                    })
                }
            })
        }
    })
}

function checkPrice (){
    let date = moment(new Date()).tz('Asia/Kolkata').format('DD-MMM-YYYY');
    Price.findOne({date:date},(err, res)=>{
        if(err) {
            console.log("err in check price",err)
            return;
        };
        if(!res) {
           return savePrice()
        }else {
            console.log("price upto date")
            return
        }
    })
}
module.exports = checkPrice