'use strict';   

const { OAuth } = require('./common/oauthImp');
const express = require('express');

const { 
    getPackages, 
    // getTakeoffTypes,
    getTakeoffContents,
    getTakeoffItems
 } = require('./common/bimTakeoffImp');

const { 
    getHubs,
    getProjects,
} = require('./common/datamanagementImp');

let router = express.Router();

///////////////////////////////////////////////////////////////////////
/// Middleware for obtaining a token for each request.
///////////////////////////////////////////////////////////////////////
router.use(async (req, res, next) => {
    const oauth = new OAuth(req.session);
    if (!oauth.isAuthorized()) {
        console.log('no valid authorization!')
        res.status(401).end('Please login first')
        return
    }
    req.oauth_client = oauth.getClient();
    req.oauth_token = await oauth.getInternalToken();  
    next();   
  });



router.get('/datamanagement', async (req, res) => {
    // The id querystring parameter contains what was selected on the UI tree, make sure it's valid
    const href = decodeURIComponent(req.query.id);
    if (href === '') {
        res.status(500).end();
        return;
    }

    if (href === '#') {
        // If href is '#', it's the root tree node
        getHubs(req.oauth_client, req.oauth_token, res);
    } else {
        // Otherwise let's break it by '/'
        const params = href.split('/');
        const resourceName = params[params.length - 2];
        const resourceId = params[params.length - 1];
        switch (resourceName) {
            case 'hubs': {
                getProjects(resourceId, req.oauth_client, req.oauth_token, res);
                break;
            }
            case 'projects':{
                const projectId = resourceId.split('b.').join('');
                getPackages( projectId, req.oauth_token, res );
                break;
            }
            case 'packages':{
                const projectId = params[params.length - 3];
                getTakeoffContents(projectId, resourceId, req.oauth_token, res);
                break;
            }            
            case 'contents':{
                const projectId = params[params.length - 5];
                const packageId = params[params.length - 3];
                const contentId = params[params.length - 1];
                getTakeoffItems(projectId, packageId, contentId,req.oauth_token, res);
                break;
            }
            case 'types':{
                const projectId = params[params.length - 5];
                const packageId = params[params.length - 3];
                const typeId = params[params.length - 1];
                getTakeoffItems(projectId, packageId, typeId,req.oauth_token, res);
                break;
            }
        }
    }
});


module.exports = router;
