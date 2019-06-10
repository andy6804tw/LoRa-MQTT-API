import express from 'express';
import validate from 'express-validation';
import userCtrl from '../controllers/user.controller';
import paramValidation from '../../config/param-validation';

const router = express.Router();

router.route('/')
  .get(userCtrl.userGet) /** 取得 User 所有值組 */
  .post(validate(paramValidation.createUser), userCtrl.userPost); /** 新增 User 值組 */

router.route('/:user_id')
  .put(userCtrl.userPut) /** 修改 User 值組 */
  .delete(userCtrl.userDelete); /** 刪除 User 值組 */

router.route('/password/:user_id')
  .put(userCtrl.userPasswordPut); /** 修改 User 值組 */

/** 利用 Middleware 取得 Header 中的 Rearer Token */
const ensureToken = (req, res, next) => {
  const bearerHeader = req.headers.authorization;
  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' '); // 字串切割
    const bearerToken = bearer[1]; // 取得 JWT
    req.token = bearerToken; // 在response中建立一個token參數
    next(); // 結束 Middleware 進入 articleCtrl.articlePersonalGet
  } else {
    res.status(403).send(Object.assign({ code: 403 }, { message: '您尚未登入！' })); // Header 查無 Rearer Token
  }
};
router.route('/login')
  .get(ensureToken, userCtrl.userProfileGet) /** User 個人資料取得 */
  .post(userCtrl.userLogin); /** User 登入 */


export default router;
