define(function() {

  /**
   * Convert response into format for sankey - http://bost.ocks.org/mike/sankey/energy.json
   */
  var SankeyNodes = function(requests, opts) {

    // constructor
    (function (){
      // default opts
      var defaultOpts = {
        showSourcePath: false,
        showTargetSection: false
      };
      for (var key in opts) defaultOpts[key] = opts[key]
      this.opts = defaultOpts;
    }).call(this)

    this.requests = requests;

    this.sankeyData = {
      nodes: [],
      links: []
    };

    this.sections = [];

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
        // search for the section
        var group = null;
        var nodeSection = /^\/([^/]*)/.exec(nodeName);
        if (nodeSection && nodeSection[0]) {
          this.sections.some(function(section, i) {
            if (section === nodeSection[0]) {
              group = i;
              return true;
            }
          }, this);
          if(group === null) {
            group = (this.sections.push(nodeSection[0]) - 1)
          }  
        }
        nodeIndex = (this.sankeyData.nodes.push({name: nodeName, group: group}) - 1)
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

        // use 
        var sourceName = (this.opts.showSourcePath) 
          ? /^.*:\/\/[^/]+(.*)$/.exec(request._source.documentReferrer)[1]
          : this._extractDomain(request._source.referringHost || 'none');
        // pull out the referrer (source), and the current url (target)
        var source = this._findIndex(sourceName);
        var targetName = (this.opts.showTargetSection) 
          ? /\/([^/]*)/.exec(request._source.path)[1] || '/'
          : request._source.path;
        var target = this._findIndex(targetName);

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