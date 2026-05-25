// lib/firebaseAdmin.js
// import dotenv from 'dotenv';
// dotenv.config({ path: '.env.local' });

import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      project_id: 'digiheap-c4aed',
      client_email: 'firebase-adminsdk-fbsvc@digiheap-c4aed.iam.gserviceaccount.com',
      private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCb9UNxaVja2xwx\nCouPPq7if+h8i7tDSUh6Wc3ZWQZHDUqjffm8ybePOE9LhGm9Pcp5H0MsZP8wQJs4\nmRvFrxSbSHu5K3K60NRDn7VIXWCiu7kGRkIcWZvNoHMMX+9rwdvXYeAtPQSxPA1c\n0ppLF+h7e+4Xcl3wLLuqFsPON+qJxOYD9SetcOvEsK8FN2NLhMXPrq4ejqFbGpjB\nGXV83MP8AaZ5YhSoLZT9xnVy4KB+RKivSxDtLrpxcvWIeHRIhcn48SnJkDePaA5q\ndKFBu6xn1QMAvOj/ZrR54K677W0W5KJISjitwTW6Yg2OEfutilu3NwLnDzHME36D\nrgi2Wm2JAgMBAAECggEAAlKZ8V4FHZWRVb/oWuomtNHaYUx3lEN1Xwose8Cd1PNl\nbM6ChljA/g6edudJxZb4B42QeOjjOHOl3kk4IG68UWVz2w8HKOTmS1GH0qqk0Fvl\nBm92szEwL4go5wKlBZy3d1toLGVez56m+G1+p+bqBH0MYKxqiDO7akvWblz4W5qM\nWl70KRJv5k9w8I0oMqR3szK0CwL4hbRl0vc/LLlgt5eG0xyL6SY/XLqEeGWXh27w\nLoYU+XuFnWqJEuQPF4HGgaZjWX5t7wDqAItGooANYDC4EeN70N28lDCCwKFpjzCl\n5OjTOH/rKCbYEVY2uQfz63UvYT3C3Hh8k78dsEP9eQKBgQDbbWqEmAob6M9BBxjJ\n78HWKX6hgTyJx0CbR1CRxWb76+vjVbYkBfy/VvtkxdAkas1h4OtpqYeRqj1LwGQW\nrpE3eAXBO08ZMCNQT/uA9fqEy1RIRggmsTIJNLnwDqowf0t95zBbPoPvnoLhoz6J\n0Mk2CcftWgv0sISNLkI0j596nQKBgQC187imuzpwyQUvAs575SWzsxdf9xSB1gne\nB0c7GbvRjE0MPvc4EFpnZIlNMv0lu8rRyvS6f8mQK4wN3PCwxcQHQgrSWWILu4CG\nXHGhXUvONE6DFnLPc1Bu7cBoQpvdpxjumrPoDPWMzYJaJVjK+/AeN4+vax+OY/jF\neIIWbVWk3QKBgQDV47sgEsBP4kkcfxl3xmDxLLOGJN7pArQEaKit33l6eccPa75H\nMRrlPJmC6pvw07buAPwYnCtNH1/ullQ6E+Hz6ufZKsH4sIbLw5tKYvvXNAgtBy7s\n4G8AsEfLK9BTw9HHoXLujmq3SZEU9zZ/ymhIZ5Jd2BetZd9fa0cXyyROtQKBgHl5\nr+vQ0CGAc6+BJi3dPKCOjqqJIO3V4lyTa2Dvu08ZZk8ospCBinnAy1H5Gr1YdP4/\ni8f/jKhuCmEvAppiTo+x7dulxSmkExihG1PqH7QZg9lM4XXSvP5ySKTS45DGAIU8\nT6Q7Eqzgf4iDqpZKQXNLEOjCkhzUbcAYxnEGqckZAoGARVLqb9M21b/KUB5wB7PX\n/Y/IWwgO+X775AZdkvXKAUbuW0aoxtWkfEcne+kP/kBrDQjyR/UoBGU1o2UpLzxy\nW0r/272yE/eFil3V1riD+vPHOAahuVg/tw3zy+P3yynPnLo23mGN66yqkZNwOcqD\nmCt3zGqJy6ITfMgHwLpL/wc=\n-----END PRIVATE KEY-----\n",
    }),
  });
}

export default admin;