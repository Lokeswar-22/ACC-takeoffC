'use strict';   

const { HubsApi, ProjectsApi } = require('forge-apis');
const {createTreeNode} = require("./apiclient");

///////////////////////////////////////////////////////////////////////
///
///
///////////////////////////////////////////////////////////////////////
async function getHubs(oauthClient, credentials, res) {
    const hubs = new HubsApi();
    try{
        const data = await hubs.getHubs({}, oauthClient, credentials);
        const treeNodes = data.body.data.map((hub) => {
            if( hub.attributes.extension.type === 'hubs:autodesk.bim360:Account'){
                const hubType = 'bim360Hubs';
                return createTreeNode(
                    hub.links.self.href,
                    hub.attributes.name,
                    hubType,
                    null,
                    true
                );
            }else
                return null;
            });
        // Only BIM360 hubs are supported for now
        res.json(treeNodes.filter(node => node !== null));
    
    }catch{
        // res.json()
        console.error("Failed to get hubs.")
        res.status(500).json({
            diagnostic: 'Failed to get hubs.'
          });
      
    }
}

///////////////////////////////////////////////////////////////////////
///
///
///////////////////////////////////////////////////////////////////////
async function getProjects(hubId, oauthClient, credentials, res) {
    const projects = new ProjectsApi();
    const data = await projects.getHubProjects(hubId, {}, oauthClient, credentials);

    const treeNodes = data.body.data.map((project) => {
        let projectType = 'projects';
        switch (project.attributes.extension.type) {
            case 'projects:autodesk.core:Project':
                return null;
            case 'projects:autodesk.bim360:Project':
                if(project.attributes.extension.data.projectType == 'ACC'){
                    projectType = 'accprojects';  
                }else{
                    return null; 
                }
                break;
        }
        return createTreeNode(
            project.links.self.href,
            project.attributes.name,
            projectType,
            project.relationships.cost.data.id,
            true
        );
    })
    // only support ACC project
    res.json(treeNodes.filter(node => node !== null));
}

module.exports = {
    getHubs,
    getProjects
}