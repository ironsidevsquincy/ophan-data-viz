exports.sankey = function(req, res){
  res.render('sankey', { title: 'Sankey' });
};

exports.force = function(req, res){
  res.render('force', { title: 'Force' });
};

exports.scatter = function(req, res){
  res.render('scatter', { title: 'Scatter' });
};