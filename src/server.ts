import express from 'express';

const server = express();
const PORT = 3000;

server.listen(PORT, () => {
    console.log(`server listening at http://localhost:${PORT}`);
});


server.get('/', (req,res) => {
    res.send({ msg: 'ciao'});
});