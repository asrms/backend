
import { Content, Dashboard, PrismaClient} from '@prisma/client';


export class DashboardService{

    constructor(private readonly prisma: PrismaClient) {}

   async moveDashboard(userId: string,dashboardId: string, position:  number): Promise<boolean>{

    
    const dashboardUser = this.getDashboard(userId,dashboardId);
    if(!dashboardUser){
        return false;
    }

        const dashboards = await   this.prisma.dashboard.findMany({
            where: {
                userId: userId,
            },
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

async moveContent(userId: string,contentId: string, position:  number, fromDashboardId: string, toDashboardId: string): Promise<boolean>{

    const fromToSameDashboard = fromDashboardId == toDashboardId;

    const fromDashboard = this.getDashboard(userId,fromDashboardId);
    if(!fromDashboard){
        return false;
    }

    if(!fromToSameDashboard){
        const toDashboard = this.getDashboard(userId,toDashboardId);
        if(!toDashboard){
            return false;
        }

    }



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

     getDashboards(userId: string){
        return this.prisma.dashboard.findMany({
            where: {
                userId: userId,
            },
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

   private async reorderDashboard(dashboards: Dashboard[]){
  

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

   private async reorderContent(contents: Content[], dashboardId: string){
  

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

        async createContent(userId: string,dashboardId:string, text: string){
            const dashboard = this.getDashboard(userId,dashboardId);
            if(!dashboard){
                return null;
            }
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

        async createDashboard( userId: string, name: string){
            const countDashboard = await this.prisma.dashboard.count();
           return await this.prisma.dashboard.create({
                data: {
                    position: countDashboard,
                    name: name,
                    userId: userId
                }
            });
        }

        
        async deleteDashboard(userId: string,dashboardId: string){
            const dashboard = this.getDashboard(userId,dashboardId);
            if(!dashboard){
                return null;
            }
            const contentsInDashboard = await this.prisma.content.count({
                where: {
                    dashboardId: dashboardId,
                    
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

        async deleteContent(userId: string,dashboardId: string, contentId: string){
            // dovremmo riuscire anche solo con la funzione delete perche dentro la tabella Content abbiamo messo  @@unique([id,dashboardId])
/*             const deleted = await this.prisma.content.deleteMany({
                 where: {
                    id:contentId,
                    dashboardId: dashboardId
                     
                 }
             }); */

             const dashboard = this.getDashboard(userId,dashboardId);
             if(!dashboard){
                 return null;
             }

             const deleted = await this.prisma.content.delete({
                where: {
                    id_dashboardId: {
                        dashboardId: dashboardId,
                        id: contentId
                    }
                    
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

         
         getDashboard(userId:string, dashboardId: string){
            return this.prisma.dashboard.findUnique({
                where: {
                    id_userId: {
                        id:dashboardId,
                        userId:userId
                    }
                    

                }
            })

         }

         

}