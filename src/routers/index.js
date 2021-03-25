
const mainRouter = require('./mainRouter');
const siteRouter = require('./siteRouter');

function router(app){
    
    app.use('/user',siteRouter);
    app.use('/',mainRouter);
}
module.exports = router;
