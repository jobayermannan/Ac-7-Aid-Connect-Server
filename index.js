const express = require('express');
const cors = require('cors');
const multer = require('multer');

const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
   const { CloudinaryStorage } = require('multer-storage-cloudinary');







const Schema = mongoose.Schema;

// MongoDB Connection URL
const uri = process.env.MONGODB_URI;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

const SupplyPostSchema = new Schema({
  image: String,
  category: String,
  title: String,
  amount: String ,
  isFeatured: Boolean,
});

const SupplyPost = mongoose.model('SupplyPost', SupplyPostSchema);





async function getSupplyPost(req, res, next) {
    let supplyPost;
    try {
        supplyPost = await SupplyPost.findById(req.params.id);
        if (supplyPost == null) {
            return res.status(404).json({ message: 'Cannot find supply post' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

    res.supplyPost = supplyPost; // Attach the found supply post to the response object
    next(); // Move to the next middleware/handler
}



   cloudinary.config({ 
     cloud_name: process.env.CLOUD_NAME, 
     api_key: process.env.API_KEY, 
     api_secret: process.env.API_SECRET 
   });

   const storage = new CloudinaryStorage({
     cloudinary: cloudinary,
     folder: "supplyPosts",
     allowedFormats: ["jpg", "png"],
     transformation: [{ width: 500, height: 500, crop: "limit" }]
   });

   const parser = multer({ storage: storage });

// User Registration
app.post('/api/v1/register', async (req, res) => {
    const { name, email, password } = req.body;
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    const db = client.db('assignment');
    const collection = db.collection('users');

    const existingUser = await collection.findOne({ email });
    if (existingUser) {
        return res.status(400).json({
            success: false,
            message: 'User already exists'
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await collection.insertOne({ name, email, password: hashedPassword });
    res.status(201).json({
        success: true,
        message: 'User registered successfully'
    });
});

// User Login
app.post('/api/v1/login', async (req, res) => {
    const { email, password } = req.body;
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    const db = client.db('assignment');
    const collection = db.collection('users');

    const user = await collection.findOne({ email });
    if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.EXPIRES_IN });
    res.json({
        success: true,
        message: 'Login successful',
        token
    });
});

// Fetch supply posts endpoint
app.get('/api/v1/supplies', async (req, res) => {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    const db = client.db('assignment');
    const supplyPostsCollection = db.collection('supplyPosts');

    try {
        const supplyPosts = await supplyPostsCollection.find().toArray();
        res.status(200).json({
            success: true,
            data: supplyPosts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch supply posts',
            error: error.message
        });
    }
});


// Create a supply post        
app.post('/api/v1/create-supply', async (req, res) => {
	console.log("Received request for /create-supply");
	const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
	await client.connect();
	const db = client.db('assignment');
	const collection = db.collection('supplyPosts');

	// Assuming SupplyPost model is correctly defined and imported
	const { image, category, title, amount, isFeatured } = req.body;

	const supply = new SupplyPost({
		 image: image,
		 category: category,
		 title: title,
		 amount: amount,
		 isFeatured: isFeatured, // Make sure this field is defined in your schema if you're using it
	});

	try {
		 const newSupply = await collection.insertOne(supply);
		 res.status(201).json({
			  success: true,
			  data: newSupply,
			  message: 'Supply created successfully'
		 });
	} catch (err) {
		 res.status(400).json({ message: err.message });
	}
});




// Delete a supply post
app.delete('/api/v1/delete-supplies/:id', async (req, res) => {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
	try {
        await client.connect();
		 const db = client.db('assignment');
		 const collection = db.collection('supplyPosts');

		 // Convert the id from string to ObjectId for MongoDB
		 const { id } = req.params;
		 const result = await collection.deleteOne({ _id: new mongoose.Types.ObjectId(id) });

		 if (result.deletedCount === 0) {
			  return res.status(404).json({ message: 'Cannot find supply post' });
		 }

		 res.json({ message: 'Deleted Supply Post' });
	} catch (err) {
		 res.status(500).json({ message: err.message });
	} finally {
		 await client.close();
	}
});


// Update a supply post
app.patch('/api/v1/update-supplies/:id', parser.single('image'), async (req, res) => {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
      await client.connect();
      const db = client.db('assignment');
      const collection = db.collection('supplyPosts');
  
      const { id } = req.params;
      const updateData = {};
  
      // If an image was uploaded, use the Cloudinary URL
      if (req.file) {
        updateData.image = req.file.path;
      }
  
      if (req.body.category !== undefined) updateData.category = req.body.category;
      if (req.body.title !== undefined) updateData.title = req.body.title;
      if (req.body.amount !== undefined) updateData.amount = req.body.amount;
      if (req.body.isFeatured !== undefined) updateData.isFeatured = req.body.isFeatured;
  
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: 'No update fields provided' });
      }
  
      const result = await collection.updateOne(
        { _id: new mongoose.Types.ObjectId(id) },
        { $set: updateData }
      );
  
      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'Cannot find supply post' });
      }
  
      res.json({ message: 'Supply Post Updated', data: updateData });
    } catch (err) {
      res.status(500).json({ message: err.message });
    } finally {
      await client.close();
    }
  });






// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});






// Test route
app.get('/', (req, res) => {
	const serverStatus = {
		 message: 'Server is running smoothly',
		 timestamp: new Date()
	};
	res.json(serverStatus);
});
