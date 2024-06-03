import express from 'express'
import { Router, Request, Response } from 'express';
import path from 'path';

const app = express();
const route = Router()

app.use(express.static(path.join(__dirname, 'dist')));

route.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Express with Typescript' })
})

app.use(route)
app.listen(3000, () => 'server running on port 3000')