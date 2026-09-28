/**
 * Resource shapes returned by DummyJSON, the public API these examples read
 * from.
 *
 * @see https://dummyjson.com/docs
 */

export type DummyProductReview = {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
};

export type DummyProduct = {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand?: string;
  thumbnail: string;
  images: string[];
  reviews?: DummyProductReview[];
};

/** The envelope every paginated product endpoint answers with. */
export type DummyProductListResponse = {
  products: DummyProduct[];
  total: number;
  skip: number;
  limit: number;
};
