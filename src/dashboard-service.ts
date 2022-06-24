
import { Dashboard, PrismaClient} from '@prisma/client';


export class DashboardService{

    constructor(private readonly prisma: PrismaClient) {}

   async moveDashboard(dashboardId: string, position:  number): Promise<boolean>{

        const dashboards = await   this.prisma.dashboard.findMany({
            orderBy: {
                position: 'asc',
            }
    });


    if(position >= dashboards.length){
        return false;
    }

    const oldPosition = dashboards.findIndex((d) => d.id == dashboardId );

    if(oldPosition == -1){
        return false;
    }

    // elimino la dashboard da dentro l'array
    const [dashboard] = dashboards.splice(oldPosition,1);
    // riassegno la dashboard appena eliminato nella position desiderata
    dashboards.splice(position,0,dashboard);

    await this.reorderDashboard(dashboards);

    return true;

}

     getDashboards(){
        return this.prisma.dashboard.findMany({
            orderBy: {
                position: 'asc',
            },
            include: {
                contents: {
                    orderBy: {
                        position: 'asc',
                    }
                }
            }
        });

    }

   async reorderDashboard(dashboards: Dashboard[]){
  

    // usiamo map per trasformare array in list
    const updates = dashboards.map((dashboard, index) => {

       return  this.prisma.dashboard.update({
            where: {
                id: dashboard.id,
            },
            data: {
                position: index,
            }
        });

    });

   await this.prisma.$transaction(updates);

// forEach
  /*   dashboards.forEach(async (dashboard, index) => {

        await this.prisma.dashboard.update({
            where: {
                id: dashboard.id,
            },
            data: {
                position: index,
            }
        });

    }) */

    // ciclo for normale

/*     for(let i = 0; i < dashboards.length; i++ ){
        await this.prisma.dashboard.update({
            where: {
                id: dashboards[i].id,
            },
            data: {
                position: i,
            }
        });
    } */



    }

}