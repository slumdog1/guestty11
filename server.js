const express = require('express')
const modelHandler = require('./modelHandler').modelHandler
const app = express()
const port = 3000


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.post('/batch', async (req, res) => {
    const verb = req.body.verb;
    const url = req.body.url;
    const payload = req.body.payload;
    const params = req.body.params;

    var model = new modelHandler(verb, url, payload, params);
    await model.performActions();
    model.prepareResponse();

    res.status(model.response.status).send(model.response.data);
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})












  