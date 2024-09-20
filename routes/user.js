const express = require('express');
const { UserProfileApi } = require('forge-apis');

const { OAuth } = require('./common/oauthImp');

let router = express.Router();

router.get('/user/profile', async (req, res) => {
    try {
        const oauth = new OAuth(req.session);
        const internalToken = await oauth.getInternalToken();
        if (internalToken) {
            const user = new UserProfileApi();
            const profile = await user.getUserProfile(oauth.getClient(), internalToken);
            res.json({
                name: profile.body.firstName + ' ' + profile.body.lastName,
                picture: profile.body.profileImages.sizeX40
            });

        } else {
            res.status(500).end();
        }
    }
    catch (err) {
        res.status(500).end(JSON.stringify(err));
    }
});

module.exports = router;
