const config = require('config');
const provider =   config.get('etheriumhost'); 
const rinky = config.get('provider')
const apikey = config.get('apiKey');
const Tx = require('ethereumjs-tx');
const web3 = require('./utils/web3.singleton')(`${provider}`);
const mainNetwork = require('./utils/mainnetwork')(`${rinky}/${apikey}`)
const contractAddress = config.get('contractAddress');
const icontractAddress = config.get('indcontractAddress');
const thaicontractAddress = config.get('thaicontractAddress');
const keycontractAddress = config.get('keycontractAddress');
const usdcontractAddress = config.get('usdcontractAddress');
const abi = config.get('abi');
const tokenOneAbi = config.get('indabi');
const tokenTwoAbi = config.get('thaiabi');
const tokenThreeAbi = config.get('keyabi');
const walletUtils = require('./utils/wallet');
const lightwallet = require("eth-lightwallet");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); 
const Transaction = require('./models/transaction');
const  Price = require('./models/price');
const upload = require('./utils/upload');
function getBalance(address) {
    return web3.eth.getBalance(address);
}
function getMainBalance(address){
    return mainNetwork.eth.getBalance(address);
}
const User = require('./models/user');
var inContract =  web3.eth.contract(tokenOneAbi).at(icontractAddress)
var thaiContract = web3.eth.contract(tokenOneAbi).at(thaicontractAddress)
var keyContract = web3.eth.contract(tokenThreeAbi).at(keycontractAddress)
var usdContract = web3.eth.contract(tokenOneAbi).at(usdcontractAddress)
var smartcontract = mainNetwork.eth.contract(abi);
var newContract = smartcontract.at(contractAddress);
const encrypt = require('./utils/crypto');
function checkhex (word) {
    console.log('before add', word)
    if(word.length % 2 != 0){
        let  w1 = word.substring(0, 2);
        let w2 = word.substring(2, word.length);
        return w1+'0'+w2;
    }else{
        return word;
    }
}

function createToken(user, res) {
    return jwt.sign(user, config.secret, {
        expiresIn:86400
    })
}

function encryptSeed(seed, password) {
    return encrypt.encrypt('aes256', password, seed.toString());
}

function decryptSeed (seed, password) {
    return encrypt.decrypt('aes256',password,seed)
}

function validateReqBody(req, res, next) {
    if(!req.body.hasOwnProperty('idProoftype')){
       return  res.json({message: 'Please select the ID Proof Type'})
    }
    if(!req.body.hasOwnProperty('addproofType')){
        return  res.json({message: 'Please select the Address Proof Type'})
    }
     if(!req.body.hasOwnProperty('addproofTypefile')){
        return  res.json({message: 'Please select the image for Address Proof'})
    }
     if(!req.body.hasOwnProperty('idProoftypefile')){
        return  res.json({message: 'Please select the image for ID Proof Type'})
    }
    if(!req.body.hasOwnProperty('idproofDocNo')){
        return  res.json({message: 'Please enter id proof document No'})
    }
    if(!req.body.hasOwnProperty('addproofDocNo')){
        return  res.json({message: 'Please enter add proof document No'})
    }
    next()
}
 
function transfer(from,to,amount) {
    return web3.eth.sendTransaction({
        from:from,
        to:to,
        value: web3.utils.toWei(amount,'ether'),
        gasPrice: '0x098bca5a00',
        gasLimit: '0x0153df'
    })
}

const verify = require('./verify');

module.exports = function(router) {
    router.get('/getbalance',
        verify,
        function(req, res) {
            const {address} = req.user;
            let amount =mainNetwork.fromWei(getMainBalance(address),"ether")
            res.json({balance: amount, address})
        }
    );

    router.get('/tokenOneBalance',
        verify,
        function(req, res) {
            const {address} = req.user;
            let tokenOneSym = inContract.symbol();
            let tokenOneBalance = inContract.balanceOf(address) / 1e18;
            let tokenAddress = icontractAddress;
            res.json({balance: tokenOneBalance, address, tokenOneSym, tokenAddress})
        }
    )
     
    router.get('/tokenTwoBalance',
        verify,
        function(req, res) {
            const {address} = req.user;
            let tokenTwoSym = thaiContract.symbol();
            let tokenTwoBalance = thaiContract.balanceOf(address) / 1e18;
            let tokenAddress = thaicontractAddress;
            res.json({balance: tokenTwoBalance, address, tokenTwoSym, tokenAddress})
        }
    )

    router.get('/tokenThreeBalance',
        verify,
        function(req, res) {
            const {address} = req.user;
            let tokenThreeSym = keyContract.symbol();
            let tokenThreeBalance = keyContract.balanceOf(address) / 1e18;
            let tokenAddress = keycontractAddress;
            res.json({balance: tokenThreeBalance, address, tokenThreeSym, tokenAddress})
        }
    )

    router.get('/tokenFourBalance',
        verify,
        function(req, res) {
            const {address} = req.user;
            let tokenFourSym = usdContract.symbol();
            let tokenFourBalance = usdContract.balanceOf(address) / 1e18;
            let tokenAddress = usdcontractAddress;
            res.json({balance: tokenFourBalance, address, tokenFourSym, tokenAddress})
        }
    )

    router.get('/allBalance',
        verify,
        function(req, res) {
            const {address} = req.user;
            let tokenOneSym = inContract.symbol();
            let tokenTwoSym = thaiContract.symbol();
            let tokenThreeSym = keyContract.symbol()
            let tokenFourSym = usdContract.symbol()
            let eth = mainNetwork.eth.getBalance(address) / 1e18;
            let tokenOne = inContract.balanceOf(address) / 1e18;
            let tokenTwo = thaiContract.balanceOf(address) / 1e18;
            let tokenThree = keyContract.balanceOf(address) / 1e18;
            let tokenFour = usdContract.balanceOf(address) / 1e18;
            let ens = newContract.balanceOf(address) / 1e18 ;
            res.json(
                {
                    eth,
                    tokenOne,
                    tokenTwo,
                    tokenThree,
                    tokenFour,
                    ens,
                    address,
                    tokenOneSym,
                    tokenTwoSym,
                    tokenThreeSym,
                    tokenFourSym
                }
            )
        }
    )

    router.post('/transfer',
        verify,
        function(req, res) {
            const {address, seed, phrase} = req.user;
            const seedw = decryptSeed(seed, phrase);
            const wallet = walletUtils.getWallet(seedw);
            const skey = walletUtils.getWalletPrivateKey(wallet)
            let to = req.body.transferTo;
            let amount = req.body.amount;
            let gasprice = req.body.gasprice;
            var secret = new Buffer(skey, 'hex');
            gasprice = web3.fromDecimal(parseInt(gasprice ) *1e9 );
            var rawTransaction = {  
                "nonce": checkhex(mainNetwork.toHex(mainNetwork.eth.getTransactionCount(address))),
                "gasPrice": gasprice, 
                "gasLimit": "0x5208",
                "to": to,
                "value": checkhex(mainNetwork.toHex(mainNetwork.toWei(amount,'ether'))),
                data : "0x",
            }
            var tx = new Tx(rawTransaction);
            tx.sign(secret);
            var serializedTx = tx.serialize();
            let sendString = serializedTx.toString('hex');
            mainNetwork.eth.sendRawTransaction(`0x${sendString}`,
                function(err, result) {
                    if(!err) {
                        res.json({status: 'Success', recepit: result})
                    }else{
                        console.log("err",err)
                        res.json({status: 'Failure',recepit: null})
                    }
                }
            )
        }
    )

    router.get('/evensBalance',
        verify,
        function(req, res) {
            const {address} = req.user;
            let evensbalance = newContract.balanceOf(address) / 1e18 ;
            console.log("evens ",evensbalance, newContract.balanceOf(address))
            res.json(
                {
                    balance: evensbalance,
                    address
                }
            )
        }
    )
    router.get('/checkAdddress/:address',
        verify,
        function(req,res) {
            let checkadd = req.params.address;
            res.json({status: web3.isAddress(checkadd)}) 
        }
    )

    router.post('/sendEns',
        verify,
        function(req, res) {
            const {address, seed, phrase} = req.user;
            const seedw = decryptSeed(seed, phrase);
            const wallet = walletUtils.getWallet(seedw);
            const skey = walletUtils.getWalletPrivateKey(wallet)
            console.log("private key", skey)
            let { transferTo: to, amount, gasprice } = req.body;
            gasprice = web3.fromDecimal(parseInt(gasprice ) *1e9 );
            amount= amount * 1e18;
            var secret = new Buffer(skey, 'hex');
            var rawTransaction = {  
                "nonce": checkhex( mainNetwork.toHex (mainNetwork.eth.getTransactionCount(address) ) ),
                "gasPrice":gasprice, 
                "gasLimit":"0xdac0",
                "to": contractAddress,
                "value": '0x00',
                data : newContract.transfer.getData(to, amount, {from: address})
            }
            var tx = new Tx(rawTransaction);
            tx.sign(secret);
            var serializedTx = tx.serialize();
            let sendString = serializedTx.toString('hex');
            mainNetwork.eth.sendRawTransaction(`0x${sendString}`,
                function(err, result) {
                    if(!err) {
                        res.json({status: 'Success', recepit: result})
                    }else {
                        console.log("err",err)
                        res.json({status:' Failure', recepit: null})
                    }
                }
            )
        }
    )

    router.post('/sendTokenOne',
        verify,
        function(req, res) {
            const {address, seed, phrase} = req.user;
            const seedw = decryptSeed(seed, phrase);
            const wallet = walletUtils.getWallet(seedw);
            const skey = walletUtils.getWalletPrivateKey(wallet)
            let { transferTo: to, amount} = req.body;
            amount= amount * 1e18;
            const secret = new Buffer(skey, 'hex');
            const rawTransaction = {  
                "nonce": checkhex(web3.toHex(web3.eth.getTransactionCount(address))),
                "gasPrice": 0, 
                "gasLimit": "0x0153df",
                "to": icontractAddress,
                "value": '0x00',
                data : inContract.transfer.getData(to, amount, {from: address})
            }
            const tx = new Tx(rawTransaction);
            tx.sign(secret);
            const serializedTx = tx.serialize();
            let sendString = serializedTx.toString('hex');
            web3.eth.sendRawTransaction(`0x${sendString}`,
                function(err, result) {
                    if(!err) {
                        let txhash = result;
                        let newTransaction = new Transaction({
                            hash: result,
                            from: address,
                            token: icontractAddress,
                            nonce: web3.eth.getTransactionCount(address),
                            to: req.body.transferTo,
                            value: req.body.amount,
                            timestamp: Date.now()
                        })
                        newTransaction.save((err, result) => {
                            res.json({status: 'Success', recepit: txhash})
                        })
                    }else{
                        console.log("err",err)
                        res.json({status:'Failure', recepit: null})
                    }
                }
            )
        }
    )

    router.post('/sendTokenTwo',
        verify,
        function(req, res) {
            const {address, seed, phrase} = req.user;
            const seedw = decryptSeed(seed, phrase);
            const wallet = walletUtils.getWallet(seedw);
            const skey = walletUtils.getWalletPrivateKey(wallet)
            let { transferTo: to, amount} = req.body;
            amount= amount * 1e18;
            console.log("amount",thaiContract.address)
            const secret = new Buffer(skey, 'hex');
            const rawTransaction = {  
                "nonce": checkhex(web3.toHex(web3.eth.getTransactionCount(address))),
                "gasPrice": 0, 
                "gasLimit": "0x0153df",
                "to": thaicontractAddress,
                "value":'0x00',
                data :thaiContract.transfer.getData(to, amount, {from: address})
            }
            const tx = new Tx(rawTransaction);
            console.log("raw",rawTransaction)
            tx.sign(secret);
            const serializedTx = tx.serialize();
            const sendString = serializedTx.toString('hex');
            web3.eth.sendRawTransaction(`0x${sendString}`,
                function(err,result) {
                    if(!err){
                        let txhash = result;
                        let newTransaction = new Transaction({
                            hash: result,
                            from: address,
                            token: thaicontractAddress,
                            nonce: web3.eth.getTransactionCount(address),
                            to: req.body.transferTo,
                            value: req.body.amount,
                            timestamp: Date.now()
                        })
                        newTransaction.save((err, result) => {
                            res.json({status: 'Success', recepit: txhash})
                        })
                    }else{
                        res.json({status: 'Failure', recepit: null})
                    }
                }
            )
        }
    )

    router.post('/sendTokenThree',  
        verify,
        function(req, res) {
            const {address, seed, phrase} = req.user;
            const seedw = decryptSeed(seed, phrase);
            const wallet = walletUtils.getWallet(seedw);
            const skey = walletUtils.getWalletPrivateKey(wallet)
            let { transferTo: to,amount} = req.body;
            amount= amount * 1e18;
            console.log("amount", amount, to)
            var secret = new Buffer(skey, 'hex');
            var rawTransaction = {  
                "nonce": checkhex(web3.toHex(web3.eth.getTransactionCount(address))),
                "gasPrice": 0, 
                "gasLimit": "0x0153df",
                "to": keycontractAddress,
                "value": '0x00',
                data : keyContract.transfer.getData(to, amount, {from: address})
            }
            console.log("rew",rawTransaction)
            var tx = new Tx(rawTransaction);
            tx.sign(secret);
            var serializedTx = tx.serialize();
            let sendString = serializedTx.toString('hex');
            web3.eth.sendRawTransaction(`0x${sendString}`,
                function(err,result) {
                    if(!err) {
                        let txhash = result;
                        let newTransaction = new Transaction({
                            hash: result,
                            from: address,
                            token: keycontractAddress,
                            nonce: web3.eth.getTransactionCount(address),
                            to: req.body.transferTo,
                            value: req.body.amount,
                            timestamp: Date.now()
                        })
                        newTransaction.save((err, result) => {
                            res.json({status: 'Success', recepit: txhash})
                        })
                    }else{
                        console.log("err",err)
                        res.json({status: 'Failure', recepit: null})
                    }
                }
            )
        }
    )

    router.post('/sendTokenFour',  
        verify,
        function(req, res) {
            const {address, seed, phrase} = req.user;
            const seedw = decryptSeed(seed, phrase);
            const wallet = walletUtils.getWallet(seedw);
            const skey = walletUtils.getWalletPrivateKey(wallet)
            let { transferTo: to,amount} = req.body;
            amount= amount * 1e18;
            console.log("amount", amount, to)
            var secret = new Buffer(skey, 'hex');
            var rawTransaction = {  
                "nonce": checkhex(web3.toHex(web3.eth.getTransactionCount(address))),
                "gasPrice": 0, 
                "gasLimit": "0x0153df",
                "to": usdcontractAddress,
                "value": '0x00',
                data : usdContract.transfer.getData(to, amount, {from: address})
            }
            console.log("rew",rawTransaction)
            var tx = new Tx(rawTransaction);
            tx.sign(secret);
            var serializedTx = tx.serialize();
            let sendString = serializedTx.toString('hex');
            web3.eth.sendRawTransaction(`0x${sendString}`,
                function(err,result) {
                    if(!err) {
                        let txhash = result;
                        let newTransaction = new Transaction({
                            hash: result,
                            from: address,
                            token: usdcontractAddress,
                            nonce: web3.eth.getTransactionCount(address),
                            to: req.body.transferTo,
                            value: req.body.amount,
                            timestamp: Date.now()
                        })
                        newTransaction.save((err, result) => {
                            res.json({status: 'Success', recepit: txhash})
                        })
                    }else{
                        console.log("err",err)
                        res.json({status: 'Failure', recepit: null})
                    }
                }
            )
        }
    )

    router.post('/uploadImage',
    verify,
    upload.any(),
    function(req, res){
        try{
            if(req.files.length) {
                res.json({data: req.files[0].filename})
            }else{
                res.json({message: 'Image cannot upload', status: 400, type: 'Failure'})
            }
        }catch(err) {
            res.json({message: 'Image cannot upload', status: 400, type: 'Failure'})
        }
      }
    )

    router.post('/kyc',
      verify,
      validateReqBody,
      function(req, res) {
        const { address } = req.user;
        let data = req.body;
        User.findOneAndUpdate({'address' : address},data)
        .then(
            userdetails => {
                return res.json({message : 'Kyc Details Updated Successfully.', status: 200, type: 'Success'})
            },
            err => {
                return res.json({ message : 'Cannot update kyc Details', status: 400, type: 'Failure'})
            }
        )
      }
    )

    router.get('/ethusdprice',
        verify,
        (req,res) =>{
            Price.find({},{date:1,value:1},(err,docs)=>{
                if(err){
                    return res.json({status: 'Failure', data:[]})
                }
                if(!docs.length){
                    return res.json({status: 'Failure', data:[]})
                }
                return res.json({status: 'Success', data:docs})
            })
        }
    )



    router.get('/user',
        verify,
        function(req, res) {
            const { address } = req.user;
            const User = require('./models/user');
            User.findOne({'address': address},{_id: 0, password: 0, seed: 0})
            .then(
                user => {
                    if(!user) {
                        res.json({message: 'User not found.', status: 204, type: 'Failure' })
                    }else {
                        res.json({data: user, status: 200, type: 'Success'})
                    }
                },
                err => {
                    res.json({message: err, status: 400, type: "Failure"})
                }
            )
        }
    )

    router.post('/changePassword',
        verify,
        (req,res,next) => {
            if( !('oldpassword' in req.body) ){
                next({message: 'Oldpassword is Required', status:400, type: 'failure'})
            };
            if( !('password' in req.body) ){
                next({message: 'Password is Required', status:400, type: 'failure'})
            };
            if( !('confirmpassword' in req.body) ){
                next({message: 'confirm Password is Required', status:400, type: 'failure'})
            }
            if( req.body.password !== req.body.confirmpassword) {
                next({message:  'Password and Confirmpassword  is Mismatch', status:400, type: 'failure'})
            }
            next()
        },
        (req,res) => {
            const { address, seed, phrase } = req.user;
            const {oldpassword, password, confirmpassword} = req.body;
            const User = require('./models/user');
            User.findOne({'address': address})
            .then(
                user => {
                    if(!user) {
                      return  res.json({message: 'User not found.', status: 204, type: 'Failure' })
                    }else {
                        bcrypt.compare(oldpassword, user.password,
                            (passwordErr, isMatch) => {
                                if (!isMatch || passwordErr){
                                   return res.json( { message: 'Current Password is Incorrect.', status:400, type: 'failure' })
                                }else{
                                    const seedw = decryptSeed(seed, phrase);
                                    const seedHash = encryptSeed(seedw, password);
                                    user.password = password;
                                    user.seed = seedHash;
                                    user.save()
                                    .then(
                                        doc =>{
                                          return  res.json( { message: 'Password changed Successfully.', status:200, type: 'Success' })
                                        },
                                        err => {
                                           return res.json( { message: 'Something went wrong. Try after sometime', status:400, type: 'failure' })
                                        }
                                    )
                                }
                            })
                    }
                },
                err => {
                    return res.json({message: err, status: 400, type: "Failure"})
                }
            )
        }
    )


    router.post('/recoverAccount',
     (req, res)=> {
        let {seed, password, confirmPassword} = req.body;
        if(password != confirmPassword) {
            return res.json({ message: 'Password and confirm password is mismatch', status: 400, type:'Failure'})
        }
        let wallet = walletUtils.getWallet(seed);
        if(!wallet){
            return res.json({ message: 'seed is incorrect', status: 400, type:'Failure'})
        }
        const address = walletUtils.getWalletAddress(wallet);
        let seedhash = encryptSeed(seed, password);
        User.findOne({address: address})
        .then(
            userdetails =>{
                if(!userdetails) {
                    return res.json({ message: 'Cannot find the user details', status: 404, type:'Failure'})
                }else{
                    userdetails.password = password;
                    userdetails.seed = seedhash;
                    userdetails.save(function(err, user){
                        if(err){
                            return res.json({message: 'Password is not update', status: 400, type:'Failure'})
                        }else{
                            return res.json({message: 'User account password changed. Login with new password', status: 200, type:'Suucess'})
                        }
                    })
                }
            },
            err =>{
                return res.json({ message: 'Cannot find the user details', status: 404, type:'Failure'})
            }
        )
     }
    )

    router.post('/profile',
        verify,
        (req, res) => {
            const {address} = req.user;
            let data = req.body;
            User.findOneAndUpdate({'address' : address },data)
            .then(
                userdetails => {
                    return res.json({message : 'Profile Details Updated Successfully.', status: 200, type: 'Success'})
                },
                err => {
                    return res.json({ message : 'Cannot update Profile Details', status: 400, type: 'Failure'})
                }
            )
        }
    )
}
