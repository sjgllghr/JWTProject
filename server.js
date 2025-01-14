const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const {importSPKI, jwtVerify} = require('jose');
const cors = require('cors');
const bodyParser = require('body-parser');

require('dotenv').config();
const jsonParser = bodyParser.json();

mongoose.connect(process.env.ATLAS_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

const postSchema = new mongoose.Schema({
  content: String,
  created_at: String,
  matchingJWT: Boolean,
  id: Number
});
const Post = mongoose.model('Post', postSchema);

const app = express();
app.use(cors());

app.get('/healthcheck', (req, res) => {
    res.send('OK');
});

app.get('/posts', async(req, res) => {
    try {
        posts = await Post.find().sort({created_at: -1});
        res.send(posts);
        console.log(posts);
    } catch (error) {
        res.send('No posts found');
        console.error(error);
    }
});

app.post('/posts', jsonParser, async(req, res) => {
    const key = await importSPKI(process.env.JWT_PUBLIC_KEY);
    console.log(req.body);

    matchingJWT = false;
    try {
        const verifiedJWT = await jwtVerify(req.body.content, key);
        console.log(verifiedJWT);
        matchingJWT = true;
    } catch (error) {
        console.log(error);
    }

    const post = new Post({
        content: req.body.content,
        created_at: new Date(),
        matchingJWT: matchingJWT,
    });

    result = await post.save();
    console.log(result);
    res.send(post);
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(8080, () => {
    console.log('Server listening on port' + 8080);
});