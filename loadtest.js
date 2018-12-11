
 Web3 = require('web3')
 web3 = new Web3(new Web3.providers.HttpProvider("https://u0bsywdzl6:gwX-Ez4DR75Br6aWAgIrOvbzY17ST1ptKbXdlqOpyzs@u0axpwa7cm-u0wderkdd6-rpc.us-east-2.kaleido.io"));
//  web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io"));
 const Tx = require('ethereumjs-tx');

// var sender = "0xf282eb21ed0e0403615cac42940b9e032cb2f0f9";
// var sender = "0xef5a98e1af3c093d15e379bd4b75fe98a572e959";
// var sender ="0x2bd8edc972e93023b0040cdc7182e237ad307a7c"
var sender = "0x7dDF0ECE39A7d18AB1E95DEc8997D6361B87155b";


// var reciver = "0x65aFFcb196831dc9b7B72085d22cBBfFB5F81733";
var reciver ="0x57147417854afe512a333AA7fE3d757Bff8e1488";
// var reciver ="0xCF2506AE4dc1FD27b0ecE5806BDaC9BAebd27522";
// var reciver = "0xf282eb21ed0e0403615cac42940b9e032cb2f0f9"

// var tokenAbi =[
//   {
//     "constant": true,
//     "inputs": [],
//     "name": "name",
//     "outputs": [
//       {
//         "name": "",
//         "type": "string"
//       }
//     ],
//     "payable": false,
//     "stateMutability": "view",
//     "type": "function"
//   },
//   {
//     "constant": false,
//     "inputs": [
//       {
//         "name": "_spender",
//         "type": "address"
//       },
//       {
//         "name": "_value",
//         "type": "uint256"
//       }
//     ],
//     "name": "approve",
//     "outputs": [
//       {
//         "name": "",
//         "type": "bool"
//       }
//     ],
//     "payable": false,
//     "stateMutability": "nonpayable",
//     "type": "function"
//   },
//   {
//     "constant": true,
//     "inputs": [],
//     "name": "totalSupply",
//     "outputs": [
//       {
//         "name": "",
//         "type": "uint256"
//       }
//     ],
//     "payable": false,
//     "stateMutability": "view",
//     "type": "function"
//   },
//   {
//     "constant": false,
//     "inputs": [
//       {
//         "name": "_from",
//         "type": "address"
//       },
//       {
//         "name": "_to",
//         "type": "address"
//       },
//       {
//         "name": "_value",
//         "type": "uint256"
//       }
//     ],
//     "name": "transferFrom",
//     "outputs": [
//       {
//         "name": "",
//         "type": "bool"
//       }
//     ],
//     "payable": false,
//     "stateMutability": "nonpayable",
//     "type": "function"
//   },
//   {
//     "constant": true,
//     "inputs": [],
//     "name": "INITIAL_SUPPLY",
//     "outputs": [
//       {
//         "name": "",
//         "type": "uint256"
//       }
//     ],
//     "payable": false,
//     "stateMutability": "view",
//     "type": "function"
//   },
//   {
//     "constant": true,
//     "inputs": [],
//     "name": "decimals",
//     "outputs": [
//       {
//         "name": "",
//         "type": "uint8"
//       }
//     ],
//     "payable": false,
//     "stateMutability": "view",
//     "type": "function"
//   },
//   {
//     "constant": false,
//     "inputs": [
//       {
//         "name": "_spender",
//         "type": "address"
//       },
//       {
//         "name": "_subtractedValue",
//         "type": "uint256"
//       }
//     ],
//     "name": "decreaseApproval",
//     "outputs": [
//       {
//         "name": "",
//         "type": "bool"
//       }
//     ],
//     "payable": false,
//     "stateMutability": "nonpayable",
//     "type": "function"
//   },
//   {
//     "constant": true,
//     "inputs": [
//       {
//         "name": "_owner",
//         "type": "address"
//       }
//     ],
//     "name": "balanceOf",
//     "outputs": [
//       {
//         "name": "",
//         "type": "uint256"
//       }
//     ],
//     "payable": false,
//     "stateMutability": "view",
//     "type": "function"
//   },
//   {
//     "constant": true,
//     "inputs": [],
//     "name": "symbol",
//     "outputs": [
//       {
//         "name": "",
//         "type": "string"
//       }
//     ],
//     "payable": false,
//     "stateMutability": "view",
//     "type": "function"
//   },
//   {
//     "constant": false,
//     "inputs": [
//       {
//         "name": "_to",
//         "type": "address"
//       },
//       {
//         "name": "_value",
//         "type": "uint256"
//       }
//     ],
//     "name": "transfer",
//     "outputs": [
//       {
//         "name": "",
//         "type": "bool"
//       }
//     ],
//     "payable": false,
//     "stateMutability": "nonpayable",
//     "type": "function"
//   },
//   {
//     "constant": false,
//     "inputs": [
//       {
//         "name": "_spender",
//         "type": "address"
//       },
//       {
//         "name": "_addedValue",
//         "type": "uint256"
//       }
//     ],
//     "name": "increaseApproval",
//     "outputs": [
//       {
//         "name": "",
//         "type": "bool"
//       }
//     ],
//     "payable": false,
//     "stateMutability": "nonpayable",
//     "type": "function"
//   },
//   {
//     "constant": true,
//     "inputs": [
//       {
//         "name": "_owner",
//         "type": "address"
//       },
//       {
//         "name": "_spender",
//         "type": "address"
//       }
//     ],
//     "name": "allowance",
//     "outputs": [
//       {
//         "name": "",
//         "type": "uint256"
//       }
//     ],
//     "payable": false,
//     "stateMutability": "view",
//     "type": "function"
//   },
//   {
//     "inputs": [],
//     "payable": false,
//     "stateMutability": "nonpayable",
//     "type": "constructor"
//   },
//   {
//     "anonymous": false,
//     "inputs": [
//       {
//         "indexed": true,
//         "name": "owner",
//         "type": "address"
//       },
//       {
//         "indexed": true,
//         "name": "spender",
//         "type": "address"
//       },
//       {
//         "indexed": false,
//         "name": "value",
//         "type": "uint256"
//       }
//     ],
//     "name": "Approval",
//     "type": "event"
//   },
//   {
//     "anonymous": false,
//     "inputs": [
//       {
//         "indexed": true,
//         "name": "from",
//         "type": "address"
//       },
//       {
//         "indexed": true,
//         "name": "to",
//         "type": "address"
//       },
//       {
//         "indexed": false,
//         "name": "value",
//         "type": "uint256"
//       }
//     ],
//     "name": "Transfer",
//     "type": "event"
//   }
// ];
// var tokenAddress="0x8e3baf986041432ad47825f42667edbdfc176ad6";

// var smartContract = web3.eth.contract(tokenAbi).at(tokenAddress);


// var privatekey = "4ACE7EB4FCAE097B4A0071B31F266FB704F0464B1573573A5A4CA2BA5EB74B1B";
// var privatekey = "3562D6DB76D7CFD1D9D9294609C414E87128ED075C020203CC296DFC3EAA969B";
// var privatekey = "B2C4ABB7E61F66088A064A4A8548AECE7A508D06077B2D022C3DBBFFF5431901";
var privatekey = "640E4055170D9FF2B503CC1B1CF3A21C7BEF53809D61062387DA0BBD720DFC80"


console.log(web3.eth.getTransactionCount(sender))
var secret = new Buffer(privatekey, 'hex');
var transArray = []
// for(let i=1;i<2;i++) {
  // console.log("loop",i)
    // var amount = 1*i*1e18;
    // var data = smartContract.transfer.getData(reciver, amount, {from: sender});
    
       var rawTransaction = {  
        "nonce":web3.toHex(web3.eth.getTransactionCount(sender)),
        // "nonce":"0xa7",
        "gasPrice":0, 
        "gasLimit":"0xdac0",
        "to":reciver,
        "value":1,
        data:'0x',
        privateFor:["0x69F1C363e34Ad4A4D29A5eef2cd87348A5314f7f"]
        // chainId:4
    }
    var tx = new Tx(rawTransaction);
    tx.sign(secret);
    var serializedTx = tx.serialize();
    var sendString = serializedTx.toString('hex');
    web3.eth.sendRawTransaction(`0x${sendString}`,function(err,result){
        if(!err){
            var txhas = result;
            console.log({status:'Success',recepit:result})
        }else{
            console.log("err",err)
            console.log({status:'Failure',recepit:null})
        }
    })
    // transArray.push(`0x${sendString}`)
// }




