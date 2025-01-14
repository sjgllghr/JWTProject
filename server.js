const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const {importSPKI, jwtVerify} = require('jose');
const cors = require('cors');
const bodyParser = require('body-parser');
const {OAuth2Client} = require('google-auth-library');

require('dotenv').config();
const jsonParser = bodyParser.json();

// Set up OAuth client and expected audience for IAP
const expectedAudience = `/projects/${process.env.PROJ_NUMBER}/apps/${process.env.PROJ_ID}`;
const oAuth2Client = new OAuth2Client();

// Set up connection to MongoDB
mongoose.connect(process.env.ATLAS_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

// Define schema and model for posts
const postSchema = new mongoose.Schema({
  content: String,
  created_at: String,
  matchingJWT: Boolean,
  id: Number
});
const Post = mongoose.model('Post', postSchema);

const app = express();
app.use(cors());

// Set up rate limiting (CodeQL finding). Limit to 500 requests per 15 minutes
var RateLimit = require('express-rate-limit');
var limiter = RateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500, 
});
app.use(limiter);

// Middleware to verify IAP JWT. GCP guide: https://cloud.google.com/iap/docs/signed-headers-howto
app.use(async (req, res) => {
    const iapJwt = req.headers['x-goog-iap-jwt-assertion'];

    try {
        // Verify the id_token, and access the claims. 
        const response = await oAuth2Client.getIapPublicKeys();
        const ticket = await oAuth2Client.verifySignedJwtWithCertsAsync(
            iapJwt,
            response.pubkeys,
            expectedAudience,
            ['https://cloud.google.com/iap']
        );
        req.claims = ticket.getPayload();
        return req.next();
    } catch (e) {
        // Token could not be validated, user is unauthorized
        return res.status(401).send('Unauthorized');
    }
});

// Send all posts sorted by time descending
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

// Save a post to the database. If the JWT can be validated with the provided 
// public key, set matchingJWT to true
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

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(8080, () => {
    console.log('Server listening on port' + 8080);
});