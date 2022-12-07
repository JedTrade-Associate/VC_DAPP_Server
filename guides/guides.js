// import dependencies
const path = require('path');
const fs = require('fs');

bootstrap = async () => {
  // guides paths
  var minimalist = path.join(__dirname, `minimalist.md`);
  var mongodb = path.join(__dirname, `mongodb.md`);
  var bearerAuth = path.join(__dirname, `bearer-auth.md`);


  // minimalist server
  var minimalistServer = path.join(__dirname, `../minimalist/guides`);
  await fs.copyFile(minimalist, path.join(minimalistServer, `minimalist.md`), (err) => {
    if (err) throw err;
  })

  // minimalist w/ bearer auth server
  var minimalistBearerAuthServer = path.join(__dirname, `../minimalist-bearer/guides`);
  await fs.copyFile(minimalist, path.join(minimalistBearerAuthServer, `minimalist.md`), (err) => {
    if (err) throw err;
  })
  await fs.copyFile(bearerAuth, path.join(minimalistBearerAuthServer, `bearer-auth.md`), (err) => {
    if (err) throw err;
  })

  // minimalist w/ database server
  var minimalistWithDBServer = path.join(__dirname, `../minimalist-database/guides`);
  await fs.copyFile(minimalist, path.join(minimalistWithDBServer, `minimalist.md`), (err) => {
    if (err) throw err;
  })
  await fs.copyFile(mongodb, path.join(minimalistWithDBServer, `mongodb.md`), (err) => {
    if (err) throw err;
  })

  // minimalist w/ database and bearer auth server
  var minimalistWithDBAndBearerAuthServer = path.join(__dirname, `../minimalist-database-bearer/guides`);
  await fs.copyFile(minimalist, path.join(minimalistWithDBAndBearerAuthServer, `minimalist.md`), (err) => {
    if (err) throw err;
  })
  await fs.copyFile(mongodb, path.join(minimalistWithDBAndBearerAuthServer, `mongodb.md`), (err) => {
    if (err) throw err;
  })
  await fs.copyFile(bearerAuth, path.join(minimalistWithDBAndBearerAuthServer, `bearer-auth.md`), (err) => {
    if (err) throw err;
  })
}

bootstrap();