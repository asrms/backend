import express from 'express';
import { DashboardService } from './dashboard-service';
import { getJwtKeys } from './key';
import { prisma } from './prisma';
import jwt from 'jsonwebtoken';
import {body, validationResult } from 'express-validator';

const dashboardService = new DashboardService(prisma);

/* const getUser = async () => {
    const user = await prisma.user.findFirst({
    where: {
     email: "marco@test.it",
    }
 
 });
 
    return user!;
 }; */

 const app = express();

async function verifyToken(autHeader: string | undefined): Promise<string | null> {
    if(!autHeader){
        return null;
    }
        // Bearer Token
        const match = /Bearer(.+)/.exec(autHeader);
        if(!match){
            return null;    
        }
        const token = match[1];
        const {publicKey} = await getJwtKeys();

        try {
            const data =  jwt.verify(token, publicKey, {algorithms: ['RS256']}) as {id:string};

            return data.id;
            
        } catch  {
            return null;
        }

 }

 app.use(async(req, res, next) => {
    const autHeader = req.headers['authorization'];
    const userId = await verifyToken(autHeader);
    if(!userId){
        return res.status(400).send({error: 'authorization header required'})
    }
    res.locals.userId = userId;

    console.log('middleware')
    // questa funzione anticipa ogni tipo di chiamata rest (di app = express()) dentro app.ts (quindi quando viene effettuata una qualsiasi chiamata rest presente qui dentro, 
    // prima entra in questo metodo, perche chiamiamo la funzione next())
    next();



 });

 app.post('/:dashboardId/move',body('position').isInt(),async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).send({errors: errors.array()});
    }
 
     const { position } = req.body;
     const { dashboardId } = req.params!;
     const userId = res.locals.userId;
    /*  const user = await getUser(); */
   
 
     // controlla che la dashboard esiste
    const ok = await dashboardService.moveDashboard(userId,dashboardId,position);
    if(!ok){
     return res.send(401).send({msg: 'cannot move dashboard'});
    }
 
      
     const dashboards = await dashboardService.getDashboards(userId);
     res.send(dashboards);
 });
 
 app.post('/:dashboardId/:contentId/move',body('dashboardId').isString(),body('position').isInt(),async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).send({errors: errors.array()});
    }
 
     const to = req.body as {position: number, dashboardId: string};
     const { dashboardId, contentId } = req.params!;
     const userId = res.locals.userId;
  /*    const user = await getUser(); */
   
 
     // controlla che la dashboard esiste
    const ok = await dashboardService.moveContent(userId,contentId,to.position,dashboardId, to.dashboardId);
    if(!ok){
     return res.send(401).send({msg: 'cannot move content'});
    }
 
      
     const dashboards = await dashboardService.getDashboards(userId);
     res.send(dashboards);
 });
 
 app.get('/', async (req,res) => {
    const userId = res.locals.userId;
    /*    const user = await getUser(); */
     const dashboards = await dashboardService.getDashboards(userId);
     res.send(dashboards);
 });
 
 app.post('/',body('name').isString(), async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).send({errors: errors.array()});
    }
     const {name} = req.body;
     const userId = res.locals.userId;
     /*    const user = await getUser(); */
     await dashboardService.createDashboard(userId,name);
     const dashboards = await dashboardService.getDashboards(userId);
     res.send(dashboards);
 });
 
 app.post('/:dashboardId',body('text').isString(), async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).send({errors: errors.array()});
    }
    const userId = res.locals.userId;
    /*    const user = await getUser(); */
     const { dashboardId } = req.params!;
     const {text} = req.body;
     await dashboardService.createContent(userId,dashboardId,text);
     const dashboards = await dashboardService.getDashboards(userId);
     res.send(dashboards);
 });
 
 app.delete('/:dashboardId', async (req,res) => {
    const userId = res.locals.userId;
    /*    const user = await getUser(); */
     const{ dashboardId }= req.params;
     const dashboard =  await dashboardService.deleteDashboard(userId,dashboardId);
 
     if(!dashboard){
         return res.status(401).send({msg: 'cannot delete dashboard'})
     }
     const dashboards = await dashboardService.getDashboards(userId);
     res.send(dashboards);
 });
 
 app.delete('/:dashboardId/:contentId', async (req,res) => {
    const userId = res.locals.userId;
    /*    const user = await getUser(); */
     const{ dashboardId,contentId }= req.params;
     const content =  await dashboardService.deleteContent(userId,dashboardId, contentId);
 
     if(!content){
         return res.status(401).send({msg: 'cannot delete content'})
     }
     const dashboards = await dashboardService.getDashboards(userId);
     res.send(dashboards);
 });
 
 export { app };