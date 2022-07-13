import express from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import { authRegisterV1, authLoginV1, authLogoutV1 } from './auth';
import { dmCreateV1, dmListV1, dmRemoveV1 } from './dm'
import { userProfileV2 } from './users'
import { clearV1 } from './other';
import { channelsCreateV1 } from './channels';



// Set up web app, use JSON
const app = express();
app.use(express.json());

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';
export { PORT, HOST };

// Example get request
app.get('/echo', (req, res, next) => {
  try {
    const data = req.query.echo as string;
    return res.json(echo(data));
  } catch (err) {
    next(err);
  }
});

// authRegister
app.post('/auth/register/v2', (req, res) => {
  const data = req.body;
  res.json(authRegisterV1(data.email, data.password, data.nameFirst, data.nameLast));
});

// authLogin
app.post('/auth/login/v2', (req, res) => {
  const data = req.body;
  res.json(authLoginV1(data.email, data.password));
});

// authLogout
app.post('/auth/logout/v1', (req, res) => {
  const data = req.body;
  res.json(authLogoutV1(data.token));
});

app.post('dm/create/v1', (req, res) => {

  const {token, uIds} = req.body;
  res.json(dmCreateV1(token, uIds));

});

app.get('dm/list/v1', (req, res) => {

  const token = String(req.query);
  res.json(dmListV1(token));

});

app.delete('dm/remove/v1', (req, res) => {

  const token = String(req.query.token);
  const dmId = Number(req.query.dmId);
  res.json(dmRemoveV1(token, dmId));

});

app.get('/users/profile/v2', (req, res) => {
  const token = String(req.query.token);
  const uId = Number(req.query.uId);
  res.json(userProfileV2(token, uId));

});


// clearV1()
app.delete('/clear/v1', (req, res) => {
  res.json(clearV1());
});

app.get('/channels/create/v2', (req, res) => {
  const token = String(req.query.token);
  const name = String(req.query.name);
  const isPublic = Boolean(req.query.isPublic);
  res.json(channelsCreateV1(token, name, isPublic));
});


// for logging errors
app.use(morgan('dev'));

// start server
app.listen(PORT, HOST, () => {
  console.log(`⚡️ Server listening on port ${PORT} at ${HOST}`);
});
