import express from 'express';
import cors from 'cors';
import { app } from './app';
import { auth } from './auth';
import { prisma } from './prisma';

const server = express();
const PORT = 4000;

server.use(express.json());
server.use(cors());
server.use('/app', app);
server.use('/auth', auth);

server.listen(PORT, () => {
    console.log(`server listening at http://localhost:${PORT}`);
});

/* process.on('SIGTERM', async () => {
    console.log("spegnimento...");
    await prisma.$disconnect();
}) */