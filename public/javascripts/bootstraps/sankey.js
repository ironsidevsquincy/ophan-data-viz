require(['reqwest',  'modules/journey-graph', 'modules/sankey'], function(reqwest, JourneyGraph, Sankey) {

  // var currentTime = new Date().getTime();

  // var esQuery = {
  //   "query": {
  //     "bool": {
  //       "must": [
  //         {
  //           "term": {
  //             "host": "m.guardian.co.uk"
  //           }
  //         }
  //       ]
  //     },
  //     "from": 0,
  //     "size": 500
  //   }
  // }

  // var referringHost = /referring-host=([^&]+)/.exec(window.location.search);
  // if (referringHost) {
  //   esQuery.query.bool.must.push({"wildcard": {"referringHost": referringHost[1]}});
  // }
  // var size = /size=([\d]+)/.exec(window.location.search);
  // if (size) {
  //   esQuery.query.size = size[1];
  // }

  // // make request to ophan
  // reqwest({
  //   url: 'http://elasticsearch.ophan.co.uk:9200/_search',
  //   type: 'json',
  //   method: 'post',
  //   data: JSON.stringify(esQuery)
  // })
  //   .then(function(resp) {

  //     var graph = new JourneyGraph(resp.hits.hits, {showTargetSection: true}).get();
  //     console.log(graph);
  //     // new Sankey(graph).render();

  //   })
  //   .fail(function(err, msg) {
  //     console.log([err, msg].join(' : '));
  //   })



var graph = {
  nodes: [
    {
      name: "article-1"
    },
    {
      name: "article-2"
    },
    {
      name: "home-page"
    },
    {
      name: "article-3"
    },
    {
      name: "article-4"
    }
  ],
  links: [
    {
      source: 0,
      target:2,
      value:10
    },
    {
      source: 1,
      target:2,
      value:5
    },
    {
      source: 2,
      target:3,
      value:2
    },
    {
      source: 2,
      target:4,
      value:1
    }
  ]
}

console.log(graph);

new Sankey(graph).render();

})