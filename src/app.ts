import express from 'express';
import { DashboardService } from './dashboard-service';
import { prisma } from './prisma';

const dashboardService = new DashboardService(prisma);

const getUser = async () => {
    const user = await prisma.user.findFirst({
    where: {
     email: "marco@test.it",
    }
 
 });
 
    return user!;
 };

 const app = express();

 app.post('auth/login', () => {
     
 });
 
 app.post('/:dashboardId/move',async (req, res) => {
 
     const { position } = req.body;
     const { dashboardId } = req.params;
     const user = await getUser();
   
 
     // controlla che la dashboard esiste
    const ok = await dashboardService.moveDashboard(user.id,dashboardId,position);
    if(!ok){
     return res.send(401).send({msg: 'cannot move dashboard'});
    }
 
      
     const dashboards = await dashboardService.getDashboards(user.id);
     res.send(dashboards);
 });
 
 app.post('/:dashboardId/:contentId/move',async (req, res) => {
 
     const to = req.body;
     const { dashboardId, contentId } = req.params;
     const user = await getUser();
   
 
     // controlla che la dashboard esiste
    const ok = await dashboardService.moveContent(user.id,contentId,to.position,dashboardId, to.dashboardId);
    if(!ok){
     return res.send(401).send({msg: 'cannot move content'});
    }
 
      
     const dashboards = await dashboardService.getDashboards(user.id);
     res.send(dashboards);
 });
 
 app.get('/', async (req,res) => {
     const user = await getUser();
     const dashboards = await dashboardService.getDashboards(user.id);
     res.send(dashboards);
 });
 
 app.post('/', async (req,res) => {
     const {name} = req.body;
     const user = await getUser();
     await dashboardService.createDashboard(user.id,name);
     const dashboards = await dashboardService.getDashboards(user.id);
     res.send(dashboards);
 });
 
 app.post('/:dashboardId', async (req,res) => {
     const user = await getUser();
     const { dashboardId } = req.params;
     const {text} = req.body;
     await dashboardService.createContent(user.id,dashboardId,text);
     const dashboards = await dashboardService.getDashboards(user.id);
     res.send(dashboards);
 });
 
 app.delete('/:dashboardId', async (req,res) => {
     const user = await getUser();
     const{ dashboardId }= req.params;
     const dashboard =  await dashboardService.deleteDashboard(user.id,dashboardId);
 
     if(!dashboard){
         return res.status(401).send({msg: 'cannot delete dashboard'})
     }
     const dashboards = await dashboardService.getDashboards(user.id);
     res.send(dashboards);
 });
 
 app.delete('/:dashboardId/:contentId', async (req,res) => {
     const user = await getUser();
     const{ dashboardId,contentId }= req.params;
     const content =  await dashboardService.deleteContent(user.id,dashboardId, contentId);
 
     if(!content){
         return res.status(401).send({msg: 'cannot delete content'})
     }
     const dashboards = await dashboardService.getDashboards(user.id);
     res.send(dashboards);
 });
 
 export { app };