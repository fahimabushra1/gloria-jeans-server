const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000

// bushraarifeen
// Z0cBeP14ChjoPX8u

app.use(cors())
app.use(express.json())


const uri = "mongodb+srv://bushraarifeen:Z0cBeP14ChjoPX8u@cluster0.gcmb5gz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";


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

    app.post('/coffees', async (req,res)=>{
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
      const coffeesData = coffeesCollection.findOne({_id:new ObjectId(id)});
      res.send(coffeesData);
    })
    app.patch('/coffees/:id', async (req,res)=>{
      const id = req.params.id;
      const updatedData = req.body;
      const result = coffeesCollection.updateOne({_id:new ObjectId(id)},
      {set: updatedData}
    );
      res.send(result);
    })
    app.delete('/coffees/:id', async (req,res)=>{
      const id = req.params.id;
      const result = coffeesCollection.deleteOne({_id:new ObjectId(id)});
      res.send(result);
    })
   app.post('/user', async(req,res)=>{
    const user = req.body;
    const isUserExist = await userCollection.findOne({email: user?.email})
    console.log(isUserExist)
    const result = await userCollection.insertOne(user);
    res.send(result)
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
  console.log(`Example app listening on port ${port}`)
})