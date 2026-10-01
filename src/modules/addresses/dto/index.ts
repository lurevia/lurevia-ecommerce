export {
  CreateAddressDto,
  UpdateAddressDto,
} from "./address_input.dto";

export type { AddressOutput } from "./address_output.dto";

export {
  createAddressSchema,
  updateAddressSchema,
  addressIdParamsSchema,
} from "../validator/addresses.validator";

export type {
  CreateAddressInput,
  UpdateAddressInput,
} from "../validator/addresses.validator";