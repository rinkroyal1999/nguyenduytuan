const express = require('express');
const app = express();
const exphbs  = require('express-handlebars');
const path = require('path');
const port = 3000;
const Router = require('./routers/index');
const conectdb = require('./config/db/index');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
var dateFormat = require('dateformat');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride('_method'));
//connect db
conectdb();
//router
Router(app);
//
//Midlleware

//template engine
app.engine('.hbs', exphbs(
    {
        extname: '.hbs',
        helpers: {
            index : (a,b)=>a+b,
            admin:(user)=>{
                if(user.permission==1)
                    return true;
                return false;   
            },
            dateformat:function(value) {
                return dateFormat(value, "dd-mm-yyyy h:MM:ss TT"); 
            },
            isShowimg:(index)=>{

                if(parseInt(index)>0)
                    return '';
                return 'active';    
            },
            ischeckImg:(value)=>{
                return(value)?`/upload/${value}`:'https://loremflickr.com/320/240' 
            },
            firtimage(value){
                return value.image[0];
            }  
        }
    }
));

app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'resources','views'));
//static file
app.use(express.static(path.join(__dirname,'public')));
//app listen

app.listen(process.env.PORT||port,()=>{
    console.log(`listening at http://localhost:${port}`)
});
