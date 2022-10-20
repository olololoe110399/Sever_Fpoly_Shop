let helper = {
  isSelected_genre: function (select, id) {
    return select === id ? "selected" : "";
  },
  isSelected_prodution: function (select, id) {
    return select === id ? "selected" : "";
  },
  isSelected_category: function (select, options) {
    return options
      .fn(this)
      .replace(new RegExp(' value="' + select + '"'), '$& selected="selected"');
  },
};

module.exports = {
  helper: helper,
};