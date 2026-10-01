export type {
  BidDto,
} from "./bids_output.dto";

export {
  createBidSchema,
  updateBidStatusSchema,
  productIdSchema,
  bidIdSchema,
  listProductBidsQuerySchema,
} from "../validator/bids.validator";

export type {
  CreateBidInput,
  UpdateBidStatusInput,
  ListProductBidsQuery,
} from "../validator/bids.validator";
