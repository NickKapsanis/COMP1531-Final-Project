import express from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import { authRegisterV1 } from './auth';

export { PORT, HOST };
// Set up web app, use JSON
const app = express();
app.use(express.json());

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

// Example get request
app.get('/echo', (req, res, next) => {
  try {
    const data = req.query.echo as string;
 //   res.send(JSON.stringify({
 //     url: 'http://' + HOST + ':' + PORT,
//    }))
    return res.json(echo(data));
  } catch (err) {
    next(err);
  }
});

// authRegister
app.post('/auth/register/v2', (req, res, next) => {
  try {
    const data = req.body;
    return authRegisterV1(data.email, data.password, data.namefirst, data.namelast); 
  } catch (err) {
    next(err);
  }
});

// for logging errors
app.use(morgan('dev'));

// start server
app.listen(PORT, HOST, () => {
  console.log(`⚡️ Server listening on port ${PORT} at ${HOST}`);
});
