const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;



app.use(cors())
app.use(express.json())


function createToken(user){
  const token = jwt.sign({
    email: user.email
  }, 'secret', { expiresIn: '7d' });
  return token;
}

function verifyToken(req,res,next){
const token = req.headers.authorization.split(" ")[1];
console.log(token);
const verify = jwt.verify(token, 'secret');
console.log(verify);
if(!verify?.email){
  return res.send('you are not authorized')
}
req.user = verify.email;
  next()
}


const uri = `mongodb+srv://${process.env.S3_BUCKET}:${process.env.SECRET_KEY}@cluster0.gcmb5gz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    const coffeesCollection = client.db("productDB").collection("coffeesCollection");
    const userCollection = client.db("userDB").collection("userCollection");



    app.post('/coffees',verifyToken, async (req,res)=>{
        const coffeesData = req.body;
        const result = await coffeesCollection.insertOne(coffeesData);
        res.send(result)
    })

    app.get('/coffees', async (req,res)=>{
      const coffeesData = coffeesCollection.find();
      const result = await coffeesData.toArray();
      res.send(result);
    })

    app.get('/coffees/:id', async (req,res)=>{
      const id = req.params.id;
      const coffeesData =  await coffeesCollection.findOne({_id:new ObjectId(id)});
      res.send(coffeesData);
    })

    app.patch('/coffees/:id',verifyToken, async (req,res)=>{
      const id = req.params.id;
      const updatedData = req.body;
      const result = await coffeesCollection.updateOne({_id:new ObjectId(id)},
      {$set: updatedData}
    );
      res.send(result);
    })

    app.delete('/coffees/:id',verifyToken,async (req,res)=>{
      const id = req.params.id;
      const result = coffeesCollection.deleteOne({_id:new ObjectId(id)});
      res.send(result);
    })

   app.post('/user', async(req,res)=>{
    const user = req.body;
    const token = createToken(user);
    console.log(token)
    const isUserExist = await userCollection.findOne({email: user?.email})
    console.log(isUserExist)
    if(isUserExist?._id){
      return res.send({
        status:"success",
        message:"login success",
        token
      })
    }
    await userCollection.insertOne(user);
    res.send(token)
   })


   app.get('/user', async (req,res)=>{
    const userData = userCollection.find();
    const result = await userData.toArray();
    res.send(result);
  })


   app.get('/user/get/:id', async (req,res)=>{
    const id = req.params.id;
    const result = await userCollection.findOne({_id:new ObjectId(id)});
    res.send(result);
   })

   app.get('/user/:email', async (req,res)=>{
    const email = req.params.email;
    const result = await userCollection.findOne({email});
    res.send(result);
   })

   app.patch('/user/:email', async (req,res)=>{
    const email = req.params.email;
    const userData = req.body;
    const result = await userCollection.updateOne({email},{$set: userData},{upsert:true});
    res.send(result);
   })
    
    
    
    console.log("Database successfully connected");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`app listening on port ${port}`)
})