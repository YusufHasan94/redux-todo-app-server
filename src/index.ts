import express, { Application, Request, Response } from "express";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";
import "dotenv/config";
import cors from "cors";

const app: Application = express();
app.use(express.json());
app.use(cors());
const port = process.env.PORT || 3000;

const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.kaasp8g.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Send a ping to confirm a successful connection

    const todo_app = client.db("redux-todo-app").collection("todo-app");

    app.get("/tasks", async (req: Request, res: Response) => {
      let query: any = {};
      if (req.query.priority) {
        query.priority = req.query.priority;
      }
      const result = await todo_app.find(query).toArray();
      res.send(result);
    });
    app.post("/tasks", async (req: Request, res: Response) => {
      const data = req.body;
      const result = await todo_app.insertOne(data);
      res.send(result);
    });
    app.delete("/tasks/:id", async (req: Request, res: Response) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await todo_app.deleteOne(query);
      res.send(result);
    });
    app.put("/tasks/:id", async (req: Request, res: Response) => {
      const id = req.params.id;
      const data = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          isCompleted: data.isCompleted,
          title: data.title,
          description: data.description,
          priority: data.priority,
        },
      };
      const options = { upsert: true };
      const result = await todo_app.updateOne(filter, updateDoc, options);
      res.send(result);
    });

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

app.get("/", (req: Request, res: Response) => {
  res.send("Server working");
});

app.listen(port, () => {
  console.log(`server running on ${port}`);
});
