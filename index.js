const express = require("express");
const cors = require("cors");
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

// middleware

app.use(cors({
  origin: [
    'http://localhost:5173'
  ],
  credentials: true
}));
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cmjacbf.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const jobCollection = client.db("jobDB").collection("job");
    const bidCollection = client.db("jobDB").collection("bid");


    app.post('/jwt', async(req, res)=>{
        const user = req.body
        console.log('user for token', user)
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn : '1h'})
        res.cookie('token', token, {
          httpOnly: true,
          secure: true,
          sameSite: 'none'
        })
        .send({success: true})
    })


  app.post('/logout', async(req, res)=>{
    const user = req.body
    console.log('logging out', user)
    res.clearCookie('token', {maxAge: 0}).send({success: true})
  })






    app.get("/addJob", async (req, res) => {
      const cursor = jobCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/addJob/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobCollection.findOne(query);
      res.send(result);
    });

    app.post("/addJob", async (req, res) => {
      const newJob = req.body;
      console.log(newJob);
      const result = await jobCollection.insertOne(newJob);
      res.send(result);
    });
    app.get("/bidJob", async (req, res) => {
      const cursor = bidCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });


    app.post("/bidJob", async (req, res) => {
      const bidJob = req.body;
      console.log(bidJob);
      const result = await bidCollection.insertOne(bidJob);
      res.send(result);
    });

    app.patch('/bidJob/:id', async(req, res)=>{
      const id = req.params.id
      const filter = {_id: new ObjectId(id)}
      const updateStatus = req.body
      console.log(updateStatus)
      const updatedDoc = {
        $set: {
          status: updateStatus.status
        }
      }
      const result = await bidCollection.updateOne(filter, updatedDoc)
      res.send(result)
    })

    app.put("/addJob/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedJob = req.body
      const updateJob = {
        $set: {
          employerEmail: updatedJob.employerEmail,
          title: updatedJob.title,
          deadline: updatedJob.deadline,
          category: updatedJob.category,
          minPrice: updatedJob.minPrice,
          maxPrice: updatedJob.maxPrice,
          description: updatedJob.description
        },
      };
      const result = await jobCollection.updateOne(filter,updateJob,options)
      res.send(result)
    });

    app.delete("/addJob/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Job Connect Server is Running");
});

app.listen(port, () => {
  console.log(`Job Connect server is running on port : ${port}`);
});
