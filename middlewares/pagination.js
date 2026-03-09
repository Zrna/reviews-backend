const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

const pagination = (req, res, next) => {
  const page = req.query.page || DEFAULT_PAGE;
  const pageSize = req.query.pageSize || DEFAULT_PAGE_SIZE;
  const offset = (page - 1) * pageSize;

  req.pagination = { page, pageSize, offset };

  next();
};

module.exports = {
  pagination,
};
