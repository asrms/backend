
import { Content, Dashboard, PrismaClient} from '@prisma/client';
import { count } from 'console';


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

async moveContent(contentId: string, position:  number, fromDashboardId: string, toDashboardId: string): Promise<boolean>{


    const fromToSameDashboard = fromDashboardId == toDashboardId;

    const fromContents = await   this.prisma.content.findMany({
        orderBy: {
            position: 'asc',
        },
        where: {
            dashboardId: fromDashboardId
        }
});

const toContents = fromToSameDashboard ? fromContents : await   this.prisma.content.findMany({
    orderBy: {
        position: 'asc',
    },
    where: {
        dashboardId: toDashboardId
    }
});


if(position > toContents.length){
    return false;
}

const oldPosition = fromContents.findIndex((c) => c.id == contentId );

if(oldPosition == -1){
    return false;
}

// elimino la dashboard da dentro l'array
const [content] = fromContents.splice(oldPosition,1);
// riassegno la dashboard appena eliminato nella position desiderata
toContents.splice(position,0,content);

await this.reorderContent(fromContents, fromDashboardId);

if(!fromToSameDashboard){
    await this.reorderContent(toContents, toDashboardId);
}

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

    async reorderContent(contents: Content[], dashboardId: string){
  

        // usiamo map per trasformare array in list
        const updates = contents.map((content, index) => {
    
           return  this.prisma.content.update({
                where: {
                    id: content.id,
                },
                data: {
                    position: index,
                    dashboardId: dashboardId
                }
            });
    
        });

       await this.prisma.$transaction(updates);    
    
        }

        async createContent(dashboardId:string, text: string){
            const countContent = await this.prisma.content.count({
                where: {
                    dashboardId: dashboardId
                }
            });
           return await this.prisma.content.create({
                data: {
                    position: countContent,
                    text: text,
                    dashboardId: dashboardId
                }
            });
        }

        async createDashboard(name: string){
            const countDashboard = await this.prisma.dashboard.count();
           return await this.prisma.dashboard.create({
                data: {
                    position: countDashboard,
                    name: name
                }
            });
        }

        
        async deleteDashboard(dashboardId: string){
            const contentsInDashboard = await this.prisma.content.count({
                where: {
                    dashboardId: dashboardId
                }
            });
            if(contentsInDashboard > 0){
                return null;
            }
            const dashboards = await this.prisma.dashboard.findMany();
            await this.reorderDashboard(dashboards);
           return await this.prisma.dashboard.delete({
                where: {
                    id: dashboardId
                }
            });
        }

        async deleteContent(dashboardId: string, contentId: string){
            // dovremmo riuscire anche solo con la funzione delete perche dentro la tabella Content abbiamo messo  @@unique([id,dashboardId])

            const deleted = await this.prisma.content.deleteMany({
                 where: {
                    id:contentId,
                    dashboardId: dashboardId
                     
                 }
             });

            
             const allContents = await this.prisma.content.findMany({
                where: {
                   dashboardId: dashboardId
                    
                }
            });

            await this.reorderContent(allContents, dashboardId);

            return deleted;

         }

}