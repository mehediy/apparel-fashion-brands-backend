const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.D_MH_U}:${process.env.D_MH_P}@cluster0.dqfkiqe.mongodb.net/?retryWrites=true&w=majority`;

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

    const database = client.db("apparelDB");

    //***************************************** */
    // ************ GET POST Dynamic*************/
    //***************************************** */
    app.get("/products/:productBrand", async (req, res) => {
      const productBrand = req.params.productBrand;
      const collection = database.collection(productBrand);
      const cursor = collection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/products/:productBrand", async (req, res) => {
      const productBrand = req.params.productBrand;
      const collection = database.collection(productBrand);
      const product = req.body;
      const newProduct = {
        name: product.name,
        brand: product.brand,
        type: product.type,
        price: product.price,
        description: product.description,
        image: product.image,
        rating: product.rating,
      };

      const result = await collection.insertOne(newProduct);
      res.send(result);

      //   console.log(newProduct);
    });

    //***************************************** */
    // ************ Get, Update Product*************/
    //***************************************** */

    app.get("/products/:productBrand/:id", async (req, res) => {
      const productBrand = req.params.productBrand;
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const collection = database.collection(productBrand);
      const result = await collection.findOne(query);

      res.send(result);
    });

    app.put("/products/:productBrand/:id", async (req, res) => {
      const productBrand = req.params.productBrand;
      const id = req.params.id;
      const collection = database.collection(productBrand);
      const filter = { _id: new ObjectId(id) };
      const product = req.body;
      const options = { upsert: true };
      const updatedProduct = {
        $set: {
          name: product.name,
          brand: product.brand,
          type: product.type,
          price: product.price,
          description: product.description,
          image: product.image,
          rating: product.rating,
        },
      };

      const result = await collection.updateOne(
        filter,
        updatedProduct,
        options
      );
      res.send(result);

      //   console.log(updatedProduct);
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
  res.send("Server running");
});

app.listen(port, () => {
  console.log("Port: ", port);
});
