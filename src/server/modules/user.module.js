import mysql from 'mysql';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import async from 'async';
import config from '../../config/config';
import APPError from '../helper/AppError';

const connectionPool = mysql.createPool({
  connectionLimit: 10,
  host: config.mysqlHost,
  user: config.mysqlUserName,
  password: config.mysqlPass,
  database: config.mysqlDatabase
});

/*  User GET 取得  */
const selectUser = () => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => { // 資料庫連線
      if (connectionError) {
        reject(connectionError); // 若連線有問題回傳錯誤
      } else {
        connection.query( // User撈取所有欄位的值組
          `SELECT
            *
          FROM
            User`
          , (error, result) => {
            if (error) {
              reject(error); // 寫入資料庫有問題時回傳錯誤
            } else {
              resolve(result); // 撈取成功回傳 JSON 資料
            }
            connection.release();
          }
        );
      }
    });
  });
};

/* User  POST 新增 */
const createUser = (insertValues) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => { // 資料庫連線
      if (connectionError) {
        reject(connectionError); // 若連線有問題回傳錯誤
      } else {
        connection.query('INSERT INTO User SET ?', insertValues, (error, result) => { // User資料表寫入一筆資料
          if (error) {
            reject(error); // 寫入資料庫有問題時回傳錯誤
          } else if (result.affectedRows === 1) {
            resolve(`新增成功！ user_id: ${result.insertId}`); // 寫入成功回傳寫入id
          }
          connection.release();
        });
      }
    });
  });
};

/* User PUT 修改 */
const modifyUser = (insertValues, userId) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => { // 資料庫連線
      if (connectionError) {
        reject(connectionError); // 若連線有問題回傳錯誤
      } else { // User資料表修改指定id一筆資料
        connection.query('UPDATE User SET ? WHERE user_id = ?', [insertValues, userId], (error, result) => {
          if (error) {
            // 寫入資料庫有問題時回傳錯誤
            reject(error);
          } else if (result.affectedRows === 0) { // 寫入時發現無該筆資料
            resolve('請確認修改Id！');
          } else if (result.message.match('Changed: 1')) { // 寫入成功
            resolve('資料修改成功');
          } else {
            resolve('資料無異動');
          }
          connection.release();
        });
      }
    });
  });
};

/* User Password PUT 修改密碼 */
const modifyUserPassword = (insertValues, userOldPassword, userId) => {
  return new Promise((resolve, reject) => {
    async.waterfall([
      (callback) => {
        // check old password is correct
        connectionPool.getConnection((connectionError, connection) => { // 資料庫連線
          if (connectionError) {
            reject(connectionError); // 若連線有問題回傳錯誤
          } else {
            connection.query( // User撈取所有欄位的值組
              'SELECT * FROM User WHERE user_id = ?', [userId]
              , (error, result) => {
                if (error) {
                  callback(error); // 寫入資料庫有問題時回傳錯誤
                } else {
                  callback(null, result[0]); // 撈取成功回傳 JSON 資料
                }
                connection.release();
              }
            );
          }
        });
      },
      (result, callback) => {
        // confirm old password
        const dbHashPassword = result.user_password; // 資料庫加密後的密碼
        bcrypt.compare(userOldPassword, dbHashPassword).then((res) => { // 使用bcrypt做解密驗證
          if (res) {
            callback(null, res);
          } else {
            callback(new APPError.LoginError2());// 輸入舊的密碼有誤
          }
        });
      }
    ], (err) => {
      // result now equals 'done'
      if (err) {
        console.log(err);
        resolve(err.message);
      } else {
        connectionPool.getConnection((connectionError, connection) => { // 資料庫連線
          if (connectionError) {
            reject(connectionError); // 若連線有問題回傳錯誤
          } else { // User資料表修改指定id一筆資料
            connection.query('UPDATE User SET ? WHERE user_id = ?', [insertValues, userId], (error, result) => {
              if (error) {
                // 寫入資料庫有問題時回傳錯誤
                reject(error);
              } else if (result.affectedRows === 0) { // 寫入時發現無該筆資料
                resolve('請確認修改Id！');
              } else if (result.message.match('Changed: 1')) { // 寫入成功
                resolve('資料修改成功');
              }
              connection.release();
            });
          }
        });
      }
    });
  });
};

/* User  DELETE 刪除 */
const deleteUser = (userId) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => { // 資料庫連線
      if (connectionError) {
        reject(connectionError); // 若連線有問題回傳錯誤
      } else { // User資料表刪除指定id一筆資料
        connection.query('DELETE FROM User WHERE user_id = ?', userId, (error, result) => {
          if (error) {
            // 資料庫存取有問題時回傳錯誤
            reject(error);
          } else if (result.affectedRows === 1) {
            resolve('刪除成功！');
          } else {
            resolve('刪除失敗！');
          }
          connection.release();
        });
      }
    });
  });
};

/*  User GET (Login)登入取得資訊  */
const selectUserLogin = (insertValues) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => { // 資料庫連線
      if (connectionError) {
        reject(connectionError); // 若連線有問題回傳錯誤
      } else {
        connection.query( // User撈取所有欄位的值組
          'SELECT * FROM User WHERE user_mail = ?',
          insertValues.user_mail, (error, result) => {
            if (error) {
              reject(error); // 寫入資料庫有問題時回傳錯誤
            } else if (Object.keys(result).length === 0) {
              reject(new APPError.LoginError1()); // 信箱尚未註冊
            } else {
              const dbHashPassword = result[0].user_password; // 資料庫加密後的密碼
              const userPassword = insertValues.user_password; // 使用者登入輸入的密碼
              bcrypt.compare(userPassword, dbHashPassword).then((res) => { // 使用bcrypt做解密驗證
                if (res) {
                  // 產生 JWT
                  const payload = {
                    user_id: result[0].user_id,
                    user_name: result[0].user_name,
                    user_mail: result[0].user_mail
                  };
                  // 取得 API Token
                  const token = jwt.sign({ payload, exp: Math.floor(Date.now() / 1000) + (60 * 15) }, 'my_secret_key');
                  resolve(Object.assign({ code: 200 }, { message: '登入成功', token })); // 登入成功
                } else {
                  reject(new APPError.LoginError2()); // 登入失敗 輸入的密碼有誤
                }
              });
            }
            connection.release();
          }
        );
      }
    });
  });
};

/*  User GET JWT取得個人資訊  */
const selectProfileUser = (token) => {
  return new Promise((resolve, reject) => {
    // JWT解密驗證
    jwt.verify(token, 'my_secret_key', (err, decoded) => {
      if (err) {
        reject(err); // 驗證失敗回傳錯誤
      } else {
        // JWT 驗證成功 ->取得用戶 user_id
        const userId = decoded.payload.user_id;
        // JWT 驗證成功 -> 撈取該使用者的所有文章
        connectionPool.getConnection((connectionError, connection) => { // 資料庫連線
          if (connectionError) {
            reject(connectionError); // 若連線有問題回傳錯誤
          } else {
            connection.query( // Article 撈取 user_id 的所有值組
              'SELECT * FROM User WHERE user_id = ?', [userId]
              , (error, result) => {
                if (error) {
                  reject(error); // 寫入資料庫有問題時回傳錯誤
                } else {
                  resolve(result); // 撈取成功回傳 JSON 資料
                }
                connection.release();
              }
            );
          }
        });
      }
    });
  });
};


export default {
  selectUser,
  createUser,
  modifyUser,
  modifyUserPassword,
  deleteUser,
  selectUserLogin,
  selectProfileUser
};
