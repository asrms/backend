import { PrismaClient } from "@prisma/client"; 

const prisma = new PrismaClient();



async function main(){

    const user = prisma.user.create({
        data: {
            email:"marco@test.it",
            name: "Marco",
            passwordHash: "test"
        }

    });

    const user2 = prisma.user.create({
        data: {
            email:"test@test.it",
            name: "Test",
            passwordHash: "test"
        }

    })

 await   prisma.dashboard.create({
        data: {
            name: 'dashboard 1',
            position:0,
            userId: (await user).id,
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
            userId: (await user2).id,
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