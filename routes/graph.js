exports.sankey = function(req, res){
  res.render('sankey', { title: 'Sankey' });
};

exports.force = function(req, res){
  res.render('force', { title: 'Force' });
};