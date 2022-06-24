import express from 'express';
import { PrismaClient} from '@prisma/client';
import { DashboardService } from './dashboard-service';
import cors from 'cors';

const prisma = new PrismaClient()
const dashboardService = new DashboardService(prisma);


const server = express();
const PORT = 4000;

server.use(express.json());
server.use(cors());

server.post('/:dashboardId/move',async (req, res) => {

    const { position } = req.body;
    const { dashboardId } = req.params;
    
  

    // controlla che la dashboard esiste
   const ok = await dashboardService.moveDashboard(dashboardId,position);
   if(!ok){
    return res.send(401).send({msg: 'cannot move dashboard'});
   }

     
    const dashboards = await dashboardService.getDashboards();
    res.send(dashboards);
});

server.post('/:dashboardId/:contentId/move',async (req, res) => {

    const to = req.body;
    const { dashboardId, contentId } = req.params;
    
  

    // controlla che la dashboard esiste
   const ok = await dashboardService.moveContent(contentId,to.position,dashboardId, to.dashboardId);
   if(!ok){
    return res.send(401).send({msg: 'cannot move content'});
   }

     
    const dashboards = await dashboardService.getDashboards();
    res.send(dashboards);
});

server.listen(PORT, () => {
    console.log(`server listening at http://localhost:${PORT}`);
});

server.get('/', async (req,res) => {
    const dashboards = await dashboardService.getDashboards();
    res.send(dashboards);
});

server.post('/', async (req,res) => {
    const {name} = req.body;
    await dashboardService.createDashboard(name);
    const dashboards = await dashboardService.getDashboards();
    res.send(dashboards);
});

server.post('/:dashboardId', async (req,res) => {
    const { dashboardId } = req.params;
    const {text} = req.body;
    await dashboardService.createContent(dashboardId,text);
    const dashboards = await dashboardService.getDashboards();
    res.send(dashboards);
});

server.delete('/:dashboardId', async (req,res) => {
    const{ dashboardId }= req.params;
    const dashboard =  await dashboardService.deleteDashboard(dashboardId);

    if(!dashboard){
        return res.status(401).send({msg: 'cannot delete dashboard'})
    }
    const dashboards = await dashboardService.getDashboards();
    res.send(dashboards);
});

server.delete('/:dashboardId/:contentId', async (req,res) => {
    const{ dashboardId,contentId }= req.params;
    const content =  await dashboardService.deleteContent(dashboardId, contentId);

    if(!content){
        return res.status(401).send({msg: 'cannot delete content'})
    }
    const dashboards = await dashboardService.getDashboards();
    res.send(dashboards);
});


