require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')
const mongoose = require('mongoose')
const { logger, logEvents } = require('./middleware/logger')
const errorHandler = require('./middleware/errorHandler')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const corsOptions = require('./config/corsOptions')
const connectDB = require('./config/dbConn')

const PORT = process.env.PORT || 3501

connectDB()

app.use(logger)

app.use(cors(corsOptions))

// app.use(cors({
//     origin: "*"
// }))
// app.options('*', cors(corsOptions));
// app.use((req,res,next)=>{
//     res.setHeader('Access-Control-Allow-Origin', '');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//     next();
// })

app.use(express.json())

app.use(cookieParser())

app.use('/', express.static(path.join(__dirname, 'public')))

app.use('/', require('./routes/root'))

app.use(express.static(path.join(__dirname, 'uploads')));

app.use('/auth', require('./routes/authRoutes'))
app.use('/users', require('./routes/userRoutes'))
app.use('/patients', require('./routes/patientRoutes'))

app.all('*', (req, res) => {
    res.status(404)
    if(req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    }
    else if(req.accepts('json')) {
        res.json({ message: '404 not found' })
    }
    else {
        res.type('txt').send('404 not found')
    }
})

app.use(errorHandler)

mongoose.connection.once('open', () => {
    console.log('Connected to DB')
    app.listen(PORT, () => console.log(`server is running at port ${PORT}`))
})

mongoose.connection.on('error', err => {
    console.log(err)
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
})





