'use strict';   


var express = require('express'); 
var router = express.Router(); 
var config = require('../config'); 

const { apiClientCallAsync } = require('./common/apiclient');
const { OAuth } = require('./common/oauthImp');


/////////////////////////////////////////////////////////////////////////////
// Add String.format() method if it's not existing
if (!String.prototype.format) {
  String.prototype.format = function () {
      var args = arguments;
      return this.replace(/{(\d+)}/g, function (match, number) {
          return typeof args[number] != 'undefined'
              ? args[number]
              : match
              ;
      });
  };
}


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

// /////////////////////////////////////////////////////////////////////
// / Get items of takeoff package
// /////////////////////////////////////////////////////////////////////
router.get('/takeoff/:project_id/packages/:package_id/items', async function(req, res){
  const packageId = req.params.package_id;
  const projectId = req.params.project_id;
  if ( packageId === '' ||  projectId == '') {
      return (res.status(400).json({
          diagnostic: 'Missing input parameters'
      }));
  }

  const takeoffItemsUrl = config.url.takeoff.TAKEOFF_ITEMS_URL.format(projectId, packageId);
  let result = null;
  try {
    result = await apiClientCallAsync('GET', takeoffItemsUrl, req.oauth_token.access_token);
  } catch (err) {
    console.error(err);
    return (res.status(500).json({
      diagnostic: 'Failed to get takeoff items from ACC'
    }));
  }
  return (res.status(200).json(result.body.results));
})



// /////////////////////////////////////////////////////////////////////
// / Get types of takeoff package
// /////////////////////////////////////////////////////////////////////
router.get('/takeoff/:project_id/packages/:package_id/types', async function(req, res){
  const packageId = req.params.package_id;
  const projectId = req.params.project_id;
  if ( packageId === '' ||  projectId == '') {
      return (res.status(400).json({
          diagnostic: 'Missing input parameters'
      }));
  }

  const requestUrl = config.url.takeoff.TAKEOFF_TYPES_URL.format(projectId, packageId);
  let result = null;
  try {
    result = await apiClientCallAsync('GET', requestUrl, req.oauth_token.access_token);
  } catch (err) {
    console.error(err);
    return (res.status(500).json({
      diagnostic: 'Failed to get takeoff types from ACC'
    }));
  }
  return (res.status(200).json(result.body.results));
})


// /////////////////////////////////////////////////////////////////////
// / Get budget code template
// /////////////////////////////////////////////////////////////////////
router.get('/cost/:container_id/budgetcode', async( req, res, next)=>{
  const containerId = req.params.container_id;
  if ( containerId == '') {
      return (res.status(400).json({
          diagnostic: 'Missing input parameters'
      }));
  }

  const requestUrl = config.url.cost.BUDGETS_TEMPLATES.format(containerId);
  let result = null;
  try {
    result = await apiClientCallAsync('GET', requestUrl, req.oauth_token.access_token);
  } catch (err) {
    console.error(err);
    return (res.status(500).json({
      diagnostic: 'Failed to get budget code template from ACC'
    }));
  }
  console.log(result.body);
  return (res.status(200).json(result.body[0]));
})






// /////////////////////////////////////////////////////////////////////
// / Import budgets to ACC Cost module
// /////////////////////////////////////////////////////////////////////
router.post('/cost/budgets', async (req, res, next) => {
  const cost_container_id = req.body.cost_container_id;
  const budgetList  = req.body.data;
  if ( budgetList === '' ) {
      return (res.status(400).json({
          diagnostic: 'Missing input body info'
      }));
  }
  const importBudgetsUrl = config.url.cost.IMPORT_BUDGETS_URL.format(cost_container_id);
  let budgetsRes = null;
  try {
      budgetsRes = await apiClientCallAsync( 'POST',  importBudgetsUrl, req.oauth_token.access_token, budgetList);
  } catch (err) {
      console.error(err);
      return (res.status(500).json({
    diagnostic: 'Failed to import budgets into ACC Cost product'
      }));
  }
  return (res.status(200).json(budgetsRes.body));
});



module.exports = router