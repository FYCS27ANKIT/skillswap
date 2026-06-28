const mongoose = require('mongoose');
const SwapRequest = require('./models/SwapRequest');
mongoose.connect('mongodb://localhost:27017/skillswap').then(async () => {
    const reqs = await SwapRequest.find();
    console.log(reqs);
    process.exit(0);
});
