// importing
import express from 'express';
import mongoose from 'mongoose';
import Messages from './dbMessages.js';
import Pusher from 'pusher';
import cors from 'cors';
//app config
const app = express();
const port = process.env.PORT || 9000;

//For real time experience
const pusher = new Pusher({
    appId: '1068595',
    key: '###',
    secret: '###',
    cluster: 'ap2',
    useTLS: true,
  });

  //middleware
  app.use(express.json());
  app.use(cors()); // Enabling cors

  app.use((req, res, next) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Headers", "*");
      next();
  })

  //Creating mongoose changestream
  const db = mongoose.connection;
  db.once("open", ()=> {
      console.log("DB connected");
      const msgCollection = db.collection('messagecontents');
      const changeStream = msgCollection.watch();
      changeStream.on('change', (change) => {
        if(change.operationType === 'insert') {
            const messageDetails = change.fullDocument;
            pusher.trigger('messages', 'inserted', 
                {
                    name: messageDetails.name,
                    message: messageDetails.message,
                    timestamp: messageDetails.timestamp,
                    received: messageDetails.received,
                }
            );
        } else {
            console.log('Error triggering pusher')
        }
      })
  })

//middleware
app.use(express.json());

//DB config
const connection_url = 'mongodb+srv://admin:###@cluster0.dx8k2.mongodb.net/ENV.DBNAME?retryWrites=true&w=majority';
mongoose.connect(connection_url, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

//app routes
app.get('/', (req, res) => res.status(200).send('hello world'));

app.get('/messages/sync', (req, res) => {
    
    Messages.find((err, data) => {
        if(err) {
            res.status(500).send(err)
        } else {
            res.status(200).send(data)
        }
    })
})

app.post('/messages/new', (req, res) => {
    const dbMessage = req.body;

    Messages.create(dbMessage, (err, data) => {
        if(err) {
            res.status(500).send(err)
        } else {
            res.status(201).send(data)
        }
    })
})

//listen
app.listen(port, ()=> console.log(`Listening on localhost: ${port}`));
