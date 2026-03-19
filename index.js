const express = require('express');
const app = express();
const port = 3000;

// Simple route to test
app.get('/', (req, res) => {
    res.json({
        message: "Welcome to BechoHub Backend!",
        status: "Active",
    });
});

app.listen(port, () => {
    console.log(`BechoHub server running at http://localhost:${port}`);
});