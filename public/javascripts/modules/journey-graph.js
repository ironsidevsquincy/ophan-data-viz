define(function() {

  /**
   * Convert response into format for sankey - http://bost.ocks.org/mike/sankey/energy.json
   */
  var SankeyNodes = function(requests) {

    this.requests = requests,

    this.sankeyData = {
      nodes: [],
      links: []
    },

    /**
     * check if they're already accounted for, otherwise add
     */
    this._findIndex = function(nodeName) {
      var nodeIndex = null;
      this.sankeyData.nodes.some(function(node, index) {
        if (node.name === nodeName) {
          nodeIndex = index;
          return true
        } else {
          return false
        }
      });
      if (nodeIndex === null) {
        nodeIndex = (this.sankeyData.nodes.push({name: nodeName}) - 1)
      }
      return nodeIndex;
    }

    this._extractDomain = function(host) {
      ['google', 'bbc', 'm.guardian', 'www.guardian', 'facebook', 'yahoo', 'ask', 'o2', 'outbrain', 'bing', 'linkedin', 
      'reddit', 'stumbleupon', 'readability', 'wikipedia', 'telegraph'].some(function(knownHost) {
        if (host.indexOf(knownHost) !== -1) {
          host = knownHost;
        }
      }, this);
      return host;
    }

    this.get = function() {

      // iterate through each request
      requests.forEach(function(request, index) {

        // pull out the referrer (source), and the current url (target)
        var source = this._findIndex(this._extractDomain(request._source.referringHost || 'none'));
        // var target = this._findIndex(request._source.path);
        var target = this._findIndex(/\/([^/]*)/.exec(request._source.path)[1] || '/');

        // have we already counted this flow
        var found = false;
        this.sankeyData.links.some(function(link) {
          if (link.source === source && link.target === target) {
            link.value++
            return found = true;
          }
        })
        if (!found) {
          this.sankeyData.links.push({
            source: source,
            target: target,
            value: 1
          })
        }
      }, this)
  
      return this.sankeyData;

    }

  }

  return SankeyNodes;
})