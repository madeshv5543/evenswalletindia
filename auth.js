const config = require('config');
const walletUtils = require('./utils/wallet');
const lightwallet = require("eth-lightwallet");
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken'); 
const checkprice = require('./saveprices');

function createToken(user, res) {
    return jwt.sign(user, config.secret, {
        expiresIn:86400
    })
}

function encryptSeed(seed, password) {
    const encrypt = require('./utils/crypto');
    return encrypt.encrypt('aes256', password, seed.toString());
}

function decryptSeed (seed, password) {
    const encrypt = require('./utils/crypto');
    return encrypt.decrypt('aes256',password,seed)
}
 
module.exports = function(router) {
    router.post('/signUp',
        (req, res, next) => {
            if(!req.body.hasOwnProperty('email')) {
               next({message: 'Email is Required.', status:400, type: "Failure"})
            };
            if(!req.body.hasOwnProperty('password')) {
                next({message: 'Password is Required.', status:400, type: "Failure"})
            };
            if(!req.body.hasOwnProperty('country')) {
                next({message: 'Country is Required.', status:400, type: "Failure"})
            };
            if(req.body.password != req.body.confirmPassword) {
                next({message: 'password and Confirmpassowrd  is Mismatch.', status:400, type: "Failure"})
            }
            next();
        },
        function(req, res, next) {
            const User = require('./models/user');
            req.body.email = req.body.email.toLowerCase();
            const { email, firstName, lastName, password, country} = req.body;
            User.findOne({'email':email})
            .then(
                user => {
                    if(user){
                        return res.json({ message: 'This Email already Exists.', status: 400, type: "Failure"})
                    }else{
                        const seed  = lightwallet.keystore.generateRandomSeed();
                        const wallet = walletUtils.getWallet(seed);
                        const data = {
                            address: walletUtils.getWalletAddress(wallet),
                            pubkey: walletUtils.getWalletPublicKey(wallet),
                            seed
                        };
                        const seedHash = encryptSeed(data.seed, password);
                        const user = new User({
                            email,
                            firstName,
                            lastName,
                            password,
                            country,
                            address:data.address,
                            seed:seedHash
                        })
                        user.save()
                        .then( result => {
                                token = createToken({address: data.address, seed: seedHash, phrase:password}, res);
                                res.json({data, token, status: 200, type: 'Success'});
                            },err=>{
                                res.json({message: err, status: 400, type: "Failure"})
                            }
                        )
                    }
                },
                err =>{
                    res.json({message: err, status: 500, type: "Failure"})
                }
            )
        }
    )

    router.post('/login',
        (req,res,next) => {
            if( !('address' in req.body) ){
                next({message: 'Email is Required', status:400, type: 'failure'})
            };
            if( !('password' in req.body) ){
                next({message: 'Password is Required', status:400, type: 'failure'})
            }
            next()
        },
        (req,res,next) => {
            req.body.address = req.body.address.toLowerCase();
            const {address : email, password } = req.body;
            const User = require('./models/user');

            User.findOne({'email':email})
                .then((user) => {
                    console.log("user",user)
                    if(!user){
                      return  res.json(
                            {
                                message: 'User not found with this email.',
                                status: 404,
                                type: 'failure'
                            }
                        )
                    }

                    bcrypt.compare(password,user.password,
                        (passwordErr, isMatch) => {
                            if (!isMatch || passwordErr){
                                    res.json( { message: 'Password is Incorrect.', status:400, type: 'failure' })
                                }else{
                                    let seedhash = user.seed;
                                    let seed = decryptSeed(seedhash, password);
                                    const wallet = walletUtils.getWallet(seed);
                                    const data = {
                                        address: walletUtils.getWalletAddress(wallet),
                                        pubkey: walletUtils.getWalletPublicKey(wallet),
                                        seed: seedhash
                                    };
                                    token = createToken({address: data.address, seed: seedhash, phrase:password}, res);
                                    checkprice();
                                    res.json({data, token, status: 200, type: 'success'})
                                }
                        }
                    ) 
                },
                err => {
                    res.json( { message: 'Email or Password is incorrect.', status:400, type: 'failure'})
                }
                
            )

        }
    )
}
