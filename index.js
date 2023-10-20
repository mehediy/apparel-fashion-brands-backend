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
    // await client.connect();

    const database = client.db("apparelDB");
    const productsCollection = database.collection("productsCollection");
    const usersCollection = database.collection("usersCollection");

    //***************************************** */
    // ************ GET POST by Brand*************/
    //***************************************** */
    app.get("/products/:productBrand", async (req, res) => {
      const productBrand = req.params.productBrand;
      //   const collection = database.collection(productBrand);
      const query = { brandId: productBrand };
      const cursor = productsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/products/:productBrand", async (req, res) => {
      const productBrand = req.params.productBrand;
      //   const collection = database.collection(productBrand);
      const product = req.body;
      const newProduct = {
        date: new Date(),
        brandId: productBrand,
        name: product.name,
        brand: product.brand,
        type: product.type,
        price: product.price,
        description: product.description,
        image: product.image,
        rating: product.rating,
      };

      const result = await productsCollection.insertOne(newProduct);
      res.send(result);

      //   console.log(newProduct);
    });

    //***************************************** */
    // ************ Get Update by ID*************/
    //***************************************** */

    app.get("/product/:id", async (req, res) => {
      //   const productBrand = req.params.productBrand;
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      //   const collection = database.collection(productBrand);
      const result = await productsCollection.findOne(query);

      res.send(result);
    });

    app.put("/product/:id", async (req, res) => {
      const productBrand = req.params.productBrand;
      const id = req.params.id;
      //   const collection = database.collection(productBrand);
      const filter = { _id: new ObjectId(id) };
      const product = req.body;
      const options = { upsert: true };
      const updatedProduct = {
        $set: {
          brandId: product.brandId,
          name: product.name,
          brand: product.brand,
          type: product.type,
          price: product.price,
          description: product.description,
          image: product.image,
          rating: product.rating,
        },
      };
      //   console.log(updatedProduct);

      const result = await productsCollection.updateOne(
        filter,
        updatedProduct,
        options
      );
      res.send(result);

      //   console.log(updatedProduct);
    });

    //***************************************** */
    // ************ Get Latest Products*************/
    //***************************************** */
    app.get("/latest_products/", async (req, res) => {
      const cursor = productsCollection.find().sort({ date: -1 }).limit(8);
      const result = await cursor.toArray();
      res.send(result);
    });

    //***************************************** */
    // ************ Get PUT cart item*************/
    //***************************************** */

    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });

    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const user = req.body;
      const options = { upsert: true };
      const updatedUser = {
        $set: {
          email: user.email,
        },
        $addToSet: {
          cart: { $each: user.cart },
        },
      };

      const result = await usersCollection.updateOne(
        filter,
        updatedUser,
        options
      );
      res.send(result);
    });
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
