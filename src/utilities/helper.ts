export const aggregationPipeline = (
  search: { field: string; text: string },
  // page: number,
  // limit: number,
  sort?: string,
) => {
  const pipeline: any = [
    {
      $sort: {
        [sort?.replace('-', '')]: sort?.startsWith('-') ? -1 : 1,
        ...(sort !== 'createdAt' && { createdAt: -1 }),
      },
    },
    // { $skip: (page - 1) * limit || 0 },
    // { $limit: limit || 10 },
  ];

  if (search && search.field && search.text)
    pipeline.unshift({
      $match: { [search.field]: new RegExp(search.text, 'ig') },
    });

  return pipeline;
};
