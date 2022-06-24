import express from 'express';
import { DashboardService } from './dashboard-service';
import { prisma } from './prisma';
import { hashSync, compareSync } from 'bcrypt';
import { userInfo } from 'os';
import { User } from '@prisma/client';

const auth = express();

auth.post('/login',async (req,res) => {
    const {email, password} = req.body;
    const user = await prisma.user.findUnique({
        where: {
            email: email
        }
    });

    if(!user){
        return res.status(401).send({msg: 'invalid authentication'});
    }

   if(!compareSync(password,user.passwordHash)){
    return res.status(401).send({msg: 'invalid authentication'});
   }

   return res.status(201).send({
    id: user.id,
    email: user.email,
    name: user.name
});

});

auth.post('/register', async (req, res) => {
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