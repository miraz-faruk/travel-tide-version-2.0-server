const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5001;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7plli.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const touristSpotCollection = client.db('touristSpotDB').collection('touristSpot');
        const countryCollection = client.db('touristSpotDB').collection('countriesOfSoutheastAsia');

        // Get all tourist spots
        app.get('/tourist-spot', async (req, res) => {
            const cursor = touristSpotCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        });

        // Get specific spot using id
        app.get('/tourist-spot/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await touristSpotCollection.findOne(query);
            res.send(result);
        });

        // Get all countries
        app.get('/countries', async (req, res) => {
            const cursor = countryCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        });

        // Get tourist spots by country name
        app.get('/tourist-spot/country/:countryName', async (req, res) => {
            const countryName = req.params.countryName;
            const query = { country: countryName };
            const spots = await touristSpotCollection.find(query).toArray();
            res.send(spots);
        });

        // Get spots added by a specific user
        app.get('/my-list', (req, res) => {
            const email = req.query.email;

            if (!email) {
                return res.status(400).send({ message: 'Email is required' });
            }
            // Query to find spots by user's email
            const query = { userEmail: email };

            touristSpotCollection.find(query).toArray()
                .then(result => {
                    res.send(result);
                })
                .catch(error => {
                    console.error('Error fetching spots:', error);
                    res.status(500).send({ message: 'Error fetching spots' });
                });
        });

        // Get spot by ID
        app.get('/my-list/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await touristSpotCollection.findOne(query);
            res.send(result);
        });

        // Add new tourist spot
        app.post('/tourist-spot', async (req, res) => {
            const newSpot = req.body;
            console.log(newSpot);
            const result = await touristSpotCollection.insertOne(newSpot);
            res.send(result);
        });

        // Update spot by ID
        app.put('/my-list/:id', (req, res) => {
            const id = req.params.id;
            const updatedSpot = req.body;
            const query = { _id: new ObjectId(id) };
            const update = {
                $set: {
                    image: updatedSpot.image,
                    spotName: updatedSpot.spotName,
                    country: updatedSpot.country,
                    location: updatedSpot.location,
                    description: updatedSpot.description,
                    cost: updatedSpot.cost,
                    seasonality: updatedSpot.seasonality,
                    travelTime: updatedSpot.travelTime,
                    visitors: updatedSpot.visitors,
                    userEmail: updatedSpot.userEmail,
                    userName: updatedSpot.userName,
                },
            };

            touristSpotCollection.updateOne(query, update)
                .then(result => {
                    if (result.modifiedCount > 0) {
                        res.status(200).json({ message: 'Spot updated successfully!' });
                    } else {
                        res.status(200).json({ message: 'No changes were made.' });
                    }
                })
                .catch((error) => {
                    console.error('Error updating spot:', error);
                    res.status(500).json({ error: 'Failed to update the spot.' });
                });
        });

        // Delete spot by ID
        app.delete('/tourist-spot/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await touristSpotCollection.deleteOne(query);
            res.send(result);
        });

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('travel tide version 2.0 server is running');
});

app.listen(port, () => {
    console.log(`travel tide version 2.0 server is running on port: ${port}`);
});