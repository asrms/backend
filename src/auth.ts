import express from 'express';
import { DashboardService } from './dashboard-service';
import { prisma } from './prisma';
import { hashSync, compareSync } from 'bcrypt';
import { userInfo } from 'os';
import { User } from '@prisma/client';
import { getJwtKeys } from './key';
import jwt from 'jsonwebtoken';
import {body, validationResult } from 'express-validator';

const auth = express();

async function verifyEmailAndPassword(email: string, password: string): Promise<User | null> {

    const user = await prisma.user.findUnique({
        where: {
            email: email
        }
    });

    if(!user){
        return null;
    }

   if(!compareSync(password,user.passwordHash)){
    return null;
   }

   return user;
    
    
}

function getExpTime(min: number){
    const now = Math.trunc(new Date().getTime() / 1000);
    return now + min * 60;
}

async function generateJwt(user:User): Promise<string> {

    const payLoad = {
        aud: 'access',
        exp: getExpTime(2 * 60),
        id: user.id,
        email: user.email
    };

    const {privateKey} = await getJwtKeys();
    return jwt.sign(payLoad,privateKey, {algorithm: 'RS256'} )
    
}

auth.post('/login', body('email').isEmail(), body('password').isString(), async (req,res) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).send({errors: errors.array()});
    }
    const {email, password} = req.body;
    const user = await verifyEmailAndPassword(email, password);

    if(!user){
        return res.status(401).send({msg: 'invalid authentication'});
    }

    const token = await generateJwt(user);
   return res.status(201).send({
    accessToken: token,
});

});

auth.post('/register', body('email').isEmail(), body('password').isLength({min: 8}), body('name').isString(), async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).send({errors: errors.array()});
    }
    const {email, password, name} = req.body;
    const passwordHash = hashSync(password, 10);
    let user: User;
    try {
         user =  await prisma.user.create({
            data: {
                name: name,
                email:email,
                passwordHash: passwordHash,
            }
        });
       
    } catch {
        return res.status(401).send({msg: 'cannot create user'});
    }

   return res.status(201).send({
        id: user.id,
        email: user.email,
        name: user.name
    });
    
});

export { auth }