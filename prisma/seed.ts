import { PrismaClient } from "@prisma/client"; 

const prisma = new PrismaClient();



async function main(){
 await   prisma.dashboard.create({
        data: {
            name: 'dashboard 1',
            position:0,
            contents: {
                create: [
                    {
                       text: 'ciao a tutti',
                       position:0
                },
                {
                    text: 'qualcosa da fare',
                    position:1
             }
            ]
            }
        }
    });

 await   prisma.dashboard.create({
        data: {
            name: 'dashboard 2',
            position:1,
            contents: {
                create: [
                    {
                       text: 'ciao Lacerba',
                       position:0
                },
                {
                    text: 'TO DO',
                    position:1
             }
            ]
            }
        }
    });

}



main()
.then(() => {
    console.log('ok');
    process.exit(0);
})
.catch((err) => {
    console.log(err);
    process.exit(1);
});