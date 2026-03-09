const paginationMeta = ({ count, page, pageSize }) => {
  const totalPages = Math.ceil(count / pageSize);

  return {
    totalRecords: count,
    page,
    pageSize,
    totalPages,
    hasPreviousPage: page > 1,
    hasNextPage: totalPages > page,
  };
};

module.exports = {
  paginationMeta,
};
