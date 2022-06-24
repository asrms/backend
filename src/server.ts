import express from 'express';
import { PrismaClient} from '@prisma/client';
import { DashboardService } from './dashboard-service';
import { send } from 'process';

const prisma = new PrismaClient()
const dashboardService = new DashboardService(prisma);


const server = express();
const PORT = 3000;


server.use(express.json());
server.post('/:dashboardId/move',async (req, res) => {

    const { position } = req.body;
    const { dashboardId } = req.params;
    
  

    // controlla che la dashboard esiste
   const ok = await dashboardService.moveDashboard(dashboardId,position);
   if(!ok){
    return res.send(401).send({msg: 'cannot move dashboard'});
   }

     // sposta la dashboard
    const dashboards = await dashboardService.getDashboards();
    res.send(dashboards);
}
)

server.listen(PORT, () => {
    console.log(`server listening at http://localhost:${PORT}`);
});

server.get('/', async (req,res) => {
    const dashboards = await dashboardService.getDashboards();
    res.send(dashboards);
});


