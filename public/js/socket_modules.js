const SocketEnum = {
  INDEX_TOPIC: 'index topic',
  INDEX_DONE: 'index done',
  DIFF_INDEX_DONE: 'diff index done',
  QUERY_DONE: 'index query done',
  DIFF_QUERY_DONE: 'diff query done',
  ERROR: 'index errors'
};

//socket host 
var socketio = io();
socketio.on(SocketEnum.INDEX_TOPIC, async (d) => {
  const jsonData = JSON.parse(d)

  switch (jsonData.message) {
    case SocketEnum.INDEX_DONE:
      console.log('index done')

      //refresh the tables
      const properties = jsonData.properties
      const addedItems = properties.filter(i => i.type == 'OBJECT_ADDED'//) 
        && i.views && i.views.length > 0)
      const removedItems = properties.filter(i => i.type == 'OBJECT_REMOVED'//) 
        && i.prev.views && i.prev.views.length > 0)
      const changedItems = properties.filter(i => i.type == 'OBJECT_CHANGED' //) 
        && i.views && i.views.length > 0)

      $('#addedTitle').html(`Elements Added (${addedItems.length})`)
      $('#removedTitle').html(`Elements Removed (${removedItems.length})`)
      $('#changedTitle').html(`Elements Changed (${changedItems.length})`)

      global_AddedView.produceView(addedItems)
      global_RemovedView.produceView(removedItems)
      global_ChangedView.produceView(changedItems)

      // cacurate the quantity change: check all the takeoff item, 
      // and check if the quantity is changed
      const instanceTree = $('#sourceHubs').jstree(true);
      if (instanceTree == null) {
        alert('Can not get the user hub');
        return;
      }

      const sourceNode = instanceTree.get_selected(true)[0];
      const itemIds = sourceNode.children.map((item) => {
        const params = item.split('.');
        return objectId = params[params.length - 1]
      })
      
      const changedTakeoffItems = changedItems.filter(item =>
        itemIds.find((i) => i == item.svf2Id)
      )
      const removedTakeoffItems = removedItems.filter(item =>
        itemIds.find((i) => i == item.svf2Id)
      )
      //for the new added elements, they are not calcurate because they are not set as takeoff items.
      // const addedTakeoffItems = addedItems.filter(item =>
      //   itemIds.find((i) => i == item.svf2Id)
      // )

      const totalTakeoffItems = changedTakeoffItems.concat(removedTakeoffItems )

      //Render the cost diff table
      global_ChangedItem.produceView(totalTakeoffItems)

      $('.diffInProgress').hide();
      $('.diffResult').show();
      console.log(SocketEnum.DIFF_INDEX_DONE)
      break;

    case SocketEnum.ERROR:
      $('.req_progress').hide();
      console.log(SocketEnum.ERROR)
      break;
  }
})