require(['reqwest',  'modules/journey-graph', 'modules/force'], function(reqwest, JourneyGraph, Force) {

  var currentTime = new Date().getTime();

  var esQuery = {
    "query": {
      "bool": {
        "must": [
          {
            "term": {
              "host": "m.guardian.co.uk"
            }
          },
          {
            "term": {
              "referringHost": "m.guardian.co.uk"
            }
          }
        ]
      },
      "from": 0,
      "size": 500
    }
  }

  var referringHost = /referring-host=([^&]+)/.exec(window.location.search);
  if (referringHost) {
    esQuery.query.bool.must.push({"wildcard": {"referringHost": referringHost[1]}});
  }
  var size = /size=([\d]+)/.exec(window.location.search);
  if (size) {
    esQuery.query.size = size[1];
  }

  // make request to ophan
  reqwest({
    url: 'http://elasticsearch.ophan.co.uk:9200/_search',
    type: 'json',
    method: 'post',
    data: JSON.stringify(esQuery)
  })
    .then(function(resp) {
      // create graph and display it
      var graph = new JourneyGraph(resp.hits.hits, {showSourcePath: true}).get();
      console.log(graph);
      new Force(graph).render();

    })
    .fail(function(err, msg) {
      console.log([err, msg].join(' : '));
    })
})