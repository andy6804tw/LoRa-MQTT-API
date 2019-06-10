import express from 'express';
// Router
import user from './user.route';
import mqtt from './mqtt.route';
import config from './../../config/config';

const router = express.Router();


/* GET localhost:[port]/api page. */
router.get('/', (req, res) => {
  res.send(`server started on PORT ${config.port} (${config.env})`);
});

/** User Router */
router.use('/user', user);
/** Student Router */
router.use('/mqtt', mqtt);

export default router;
